<template>
  <section class="admin-panel page">
    <div class="toolbar">
      <h1>商品管理</h1>
      <el-button type="primary" @click="openCreate">新建商品</el-button>
    </div>
    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="name" label="商品名称" min-width="220" />
      <el-table-column prop="category_name" label="分类" width="140" />
      <el-table-column prop="type" label="类型" width="120" />
      <el-table-column prop="price" label="现金价" width="120" />
      <el-table-column prop="points_price" label="积分价" width="120" />
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '上架' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" layout="total, prev, pager, next" :total="total" :page-sizes="[20, 50, 100]" @current-change="loadProducts" @size-change="loadProducts" />
    </div>

    <el-dialog v-model="openDialog" :title="editingId ? '编辑商品' : '新建商品'" width="720px" append-to-body>
      <el-form :model="form" label-width="110px">
        <el-form-item label="分类">
          <el-select v-model="form.category_id" placeholder="请选择分类" filterable style="width: 100%">
            <el-option v-for="item in categories" :key="item.id" :label="formatCategoryLabel(item)" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="副标题"><el-input v-model="form.subtitle" /></el-form-item>
        <el-form-item label="封面图"><el-input v-model="form.cover" /></el-form-item>
        <el-form-item label="商品说明"><el-input v-model="form.description" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width:100%">
            <el-option label="普通" value="normal" />
            <el-option label="积分" value="points" />
            <el-option label="限购" value="limited" />
          </el-select>
        </el-form-item>
        <el-form-item label="现金价"><el-input-number v-model="form.price" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="原价"><el-input-number v-model="form.origin_price" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="积分价"><el-input-number v-model="form.points_price" :min="0" /></el-form-item>
        <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" /></el-form-item>
        <el-form-item label="限购"><el-input-number v-model="form.limit_per_user" :min="0" /></el-form-item>
        <el-form-item label="上架状态"><el-switch v-model="statusSwitch" /></el-form-item>
        <el-form-item label="热门推荐">
          <el-checkbox v-model="hotSwitch">热门</el-checkbox>
          <el-checkbox v-model="recommendSwitch">推荐</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="openDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProduct">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/api/http'

interface CategoryItem {
  id: number
  name: string
  status: number
}

const loading = ref(false)
const rows = ref<any[]>([])
const categories = ref<CategoryItem[]>([])
const openDialog = ref(false)
const editingId = ref<number | null>(null)
const statusSwitch = ref(true)
const hotSwitch = ref(false)
const recommendSwitch = ref(false)
const categoryApiReady = ref(true)
const form = reactive({ category_id: 0, name: '', subtitle: '', type: 'normal', cover: '', description: '', price: 0, origin_price: 0, points_price: 0, stock: 0, limit_per_user: 0, status: 1, is_hot: 0, is_recommend: 0 })

function getDefaultCategoryId() {
  return categories.value.find((item) => item.status === 1)?.id || categories.value[0]?.id || 0
}

function formatCategoryLabel(item: CategoryItem) {
  return item.status === 1 ? item.name : `${item.name}（已停用）`
}

function resetForm() {
  Object.assign(form, { category_id: getDefaultCategoryId(), name: '', subtitle: '', type: 'normal', cover: '', description: '', price: 0, origin_price: 0, points_price: 0, stock: 0, limit_per_user: 0, status: 1, is_hot: 0, is_recommend: 0 })
  statusSwitch.value = true
  hotSwitch.value = false
  recommendSwitch.value = false
  editingId.value = null
}

async function loadCategories() {
  try {
    const res = await http.get('/admin/categories')
    categories.value = res.data || []
    categoryApiReady.value = true
  } catch (error: any) {
    if (Number(error?.response?.status || 0) === 404) {
      categoryApiReady.value = false
      ElMessage.warning('后台分类接口未生效，先使用公开分类列表展示，请重启后端服务后再试新增或修改分类。')
      const fallback = await http.get('/categories')
      categories.value = fallback.data || []
    } else {
      throw error
    }
  }

  if (!form.category_id) {
    form.category_id = getDefaultCategoryId()
  }
}

const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

async function loadProducts() {
  loading.value = true
  try {
    const res = await http.get('/admin/products', { params: { page: page.value, page_size: pageSize.value } })
    rows.value = res.data.list
    total.value = res.data.total || res.data.list?.length || 0
  } finally {
    loading.value = false
  }
}

async function openCreate() {
  if (!categories.value.length) {
    await loadCategories()
  }
  resetForm()
  openDialog.value = true
}

function openEdit(row: any) {
  editingId.value = row.id
  Object.assign(form, {
    category_id: row.category_id,
    name: row.name,
    subtitle: row.subtitle,
    type: row.type,
    cover: row.cover || '',
    description: row.description || '',
    price: Number(row.price || 0),
    origin_price: Number(row.origin_price || 0),
    points_price: Number(row.points_price || 0),
    stock: Number(row.stock || 0),
    limit_per_user: Number(row.limit_per_user || 0),
  })
  statusSwitch.value = row.status === 1
  hotSwitch.value = row.is_hot === 1
  recommendSwitch.value = row.is_recommend === 1
  openDialog.value = true
}

async function saveProduct() {
  if (!form.category_id) {
    ElMessage.warning('请先选择商品分类')
    return
  }

  const payload = { ...form, status: statusSwitch.value ? 1 : 0, is_hot: hotSwitch.value ? 1 : 0, is_recommend: recommendSwitch.value ? 1 : 0 }
  if (editingId.value) {
    await http.put(`/admin/products/${editingId.value}`, payload)
    ElMessage.success('商品更新成功')
  } else {
    await http.post('/admin/products', payload)
    ElMessage.success('商品创建成功')
  }
  openDialog.value = false
  resetForm()
  await loadProducts()
}

onMounted(async () => {
  try {
    await Promise.all([loadCategories(), loadProducts()])
  } catch {
    if (!rows.value.length) {
      rows.value = []
    }
  }
})
</script>

<style scoped>
.page { padding: 24px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.pager { display: flex; justify-content: flex-end; margin-top: 18px; }
</style>
