<template>
  <section class="admin-panel page">
    <div class="toolbar">
      <h1>分类管理</h1>
      <div class="actions">
        <el-button type="primary" @click="openCreate">新增分类</el-button>
        <el-button @click="loadCategories">刷新</el-button>
      </div>
    </div>

    <el-alert
      v-if="!adminApiReady"
      type="warning"
      :closable="false"
      title="当前后端还没有加载最新的分类管理接口，列表先回退到公开分类接口；如需新增或修改分类，请先重启后端服务。"
      class="warn-banner"
    />

    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" min-width="180" />
      <el-table-column label="父级分类" min-width="160">
        <template #default="{ row }">{{ getParentName(row.parent_id) }}</template>
      </el-table-column>
      <el-table-column prop="icon" label="图标" min-width="140" />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updated_at" label="更新时间" min-width="180" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="!adminApiReady" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑分类' : '新增分类'" width="560px" append-to-body>
      <el-form :model="form" label-width="100px">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-select v-model="form.parent_id" style="width: 100%">
            <el-option label="顶级分类" :value="0" />
            <el-option v-for="item in parentOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="图标标识">
          <el-input v-model="form.icon" placeholder="可选，例如 book / ticket" />
        </el-form-item>
        <el-form-item label="排序值">
          <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!adminApiReady" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/api/http'

interface CategoryItem {
  id: number
  parent_id: number
  name: string
  icon?: string
  sort: number
  status: number
  updated_at?: string
}

const loading = ref(false)
const rows = ref<CategoryItem[]>([])
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const adminApiReady = ref(true)
const form = reactive({
  parent_id: 0,
  name: '',
  icon: '',
  sort: 0,
  status: 1,
})

const parentOptions = computed(() => rows.value.filter((item) => item.id !== editingId.value))

function resetForm() {
  editingId.value = null
  form.parent_id = 0
  form.name = ''
  form.icon = ''
  form.sort = 0
  form.status = 1
}

function getParentName(parentId: number) {
  if (!parentId) return '顶级分类'
  return rows.value.find((item) => item.id === parentId)?.name || `#${parentId}`
}

async function loadCategories() {
  loading.value = true
  try {
    try {
      const res = await http.get('/admin/categories')
      rows.value = res.data || []
      adminApiReady.value = true
    } catch (error: any) {
      if (Number(error?.response?.status || 0) !== 404) {
        throw error
      }
      adminApiReady.value = false
      const fallback = await http.get('/categories')
      rows.value = fallback.data || []
    }
  } finally {
    loading.value = false
  }
}

function openCreate() {
  if (!adminApiReady.value) {
    ElMessage.warning('请先重启后端服务，再使用分类新增功能')
    return
  }
  resetForm()
  dialogVisible.value = true
}

function openEdit(row: CategoryItem) {
  if (!adminApiReady.value) {
    ElMessage.warning('请先重启后端服务，再使用分类编辑功能')
    return
  }
  editingId.value = row.id
  form.parent_id = Number(row.parent_id || 0)
  form.name = row.name || ''
  form.icon = row.icon || ''
  form.sort = Number(row.sort || 0)
  form.status = row.status === 1 ? 1 : 0
  dialogVisible.value = true
}

async function saveCategory() {
  if (!adminApiReady.value) {
    ElMessage.error('后台分类接口未生效，请重启后端服务后再试')
    return
  }
  if (!form.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  const payload = {
    parent_id: Number(form.parent_id || 0),
    name: form.name.trim(),
    icon: form.icon.trim(),
    sort: Number(form.sort || 0),
    status: Number(form.status || 0),
  }

  if (editingId.value) {
    await http.put(`/admin/categories/${editingId.value}`, payload)
    ElMessage.success('分类更新成功')
  } else {
    await http.post('/admin/categories', payload)
    ElMessage.success('分类创建成功')
  }

  dialogVisible.value = false
  resetForm()
  await loadCategories()
}

onMounted(async () => {
  try {
    await loadCategories()
  } catch {
    rows.value = []
  }
})
</script>

<style scoped>
.page { padding: 24px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.actions { display: flex; gap: 12px; }
.warn-banner { margin-bottom: 16px; }
</style>
