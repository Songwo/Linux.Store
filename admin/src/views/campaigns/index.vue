<template>
  <section class="admin-panel page">
    <div class="toolbar">
      <h1>活动管理</h1>
      <div class="actions">
        <el-button type="primary" @click="handleAdd">新增活动</el-button>
        <el-button @click="loadCampaigns">刷新</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="name" label="活动名称" min-width="220" />
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="row.type === 'seckill' ? 'danger' : 'primary'">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="活动时间" min-width="280">
        <template #default="{ row }">{{ row.start_at }} - {{ row.end_at }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '开启' : '关闭' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.type === 'seckill'" link type="success" @click="handleManageGoods(scope.row)">配置商品</el-button>
          <el-button v-if="scope.row.type === 'seckill'" link type="warning" @click="warmup(scope.row.id)">库存预热</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Campaign Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? '编辑活动' : '新增活动'" width="50%" min-width="500px" append-to-body>
      <el-form :model="form" label-width="100px">
        <el-form-item label="活动名称">
          <el-input v-model="form.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="秒杀 (Seckill)" value="seckill" />
            <el-option label="优惠券 (Coupon)" value="coupon" />
            <el-option label="普通营销 (Marketing)" value="marketing" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="form.range"
            type="datetimerange"
            range-separator="To"
            start-placeholder="Start"
            end-placeholder="End"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
          />
        </el-form-item>
        <el-form-item label="活动状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="活动头图">
          <el-input v-model="form.banner" placeholder="URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitCampaign">提交</el-button>
      </template>
    </el-dialog>

    <!-- Goods Management Dialog -->
    <el-dialog v-model="goodsDialog.visible" :title="`管理秒杀商品 - ${goodsDialog.campaignName}`" width="80%" append-to-body>
      <div class="goods-toolbar">
        <el-button type="primary" @click="prepareAddGood">添加商品</el-button>
      </div>
      <el-table :data="goodsDialog.list" border style="margin-top: 15px">
        <el-table-column prop="product_id" label="商品ID" width="100" />
        <el-table-column prop="sku_id" label="SKU ID" width="100" />
        <el-table-column prop="seckill_price" label="秒杀价">
          <template #default="{ row }">¥{{ row.seckill_price.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="秒杀总库存" />
        <el-table-column prop="available_stock" label="可用库存" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button link type="primary" @click="editGood(scope.row)">修改</el-button>
            <el-button link type="danger" @click="deleteGood(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- Add/Edit Good Inner Dialog -->
    <el-dialog v-model="goodFormDialog.visible" :title="goodFormDialog.isEdit ? '编辑秒杀参数' : '添加秒杀商品'" append-to-body width="40%" min-width="400px">
      <el-form :model="goodForm" label-width="100px">
        <el-form-item label="选择商品">
          <el-select v-model="goodForm.product_id" filterable placeholder="请选择商品" :disabled="goodFormDialog.isEdit" @change="onProductSelect" style="width: 100%">
            <el-option v-for="p in allProducts" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择 SKU">
          <el-select v-model="goodForm.sku_id" filterable placeholder="请选择 SKU" :disabled="goodFormDialog.isEdit" @change="onSkuSelect" style="width: 100%">
            <el-option v-for="sku in allSkus" :key="sku.id" :label="sku.title" :value="sku.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="秒杀价格">
          <el-input-number v-model="goodForm.seckill_price" :precision="2" :step="0.1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="秒杀库存">
          <el-input-number v-model.number="goodForm.stock" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="goodForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="goodFormDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitGood">确认</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/api/http'

const loading = ref(false)
const rows = ref<any[]>([])

const allProducts = ref<any[]>([])
const allSkus = ref<any[]>([])

async function loadAllProducts() {
  try {
    const res = await http.get('/admin/products', { params: { page: 1, page_size: 100 } })
    allProducts.value = res.data.list || []
  } catch {}
}

async function onProductSelect(val: number) {
  goodForm.sku_id = undefined as any
  goodForm.seckill_price = 0
  allSkus.value = []
  try {
    const res = await http.get(`/products/${val}`)
    allSkus.value = res.data.skus || []
    if (allSkus.value.length === 1) {
      goodForm.sku_id = allSkus.value[0].id
      onSkuSelect(goodForm.sku_id)
    }
  } catch {}
}

function onSkuSelect(skuId: number) {
  const sku = allSkus.value.find(s => s.id === skuId)
  if (sku) {
    goodForm.seckill_price = sku.price
    goodForm.stock = sku.stock
  }
}

const dialog = reactive({
  visible: false,
  isEdit: false,
})

const form = reactive({
  id: 0,
  name: '',
  type: 'seckill',
  range: [] as string[],
  status: 1,
  banner: '',
  rules: '{}',
})

const goodsDialog = reactive({
  visible: false,
  campaignId: 0,
  campaignName: '',
  list: [] as any[],
})

const goodFormDialog = reactive({
  visible: false,
  isEdit: false,
})

const goodForm = reactive({
  id: 0,
  seckill_campaign_id: 0,
  product_id: 0,
  sku_id: 0,
  seckill_price: 0,
  stock: 0,
  status: 1,
})

async function loadCampaigns() {
  loading.value = true
  try {
    const res = await http.get('/admin/campaigns')
    rows.value = res.data || []
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  dialog.isEdit = false
  form.id = 0
  form.name = ''
  form.type = 'seckill'
  form.range = []
  form.status = 1
  form.banner = ''
  dialog.visible = true
}

function handleEdit(row: any) {
  dialog.isEdit = true
  form.id = row.id
  form.name = row.name
  form.type = row.type
  form.range = [row.start_at, row.end_at]
  form.status = row.status
  form.banner = row.banner
  form.rules = row.rules || '{}'
  dialog.visible = true
}

async function submitCampaign() {
  if (!form.name || form.range.length < 2) {
    return ElMessage.warning('请填写完整信息')
  }
  const payload = {
    ...form,
    start_at: form.range[0],
    end_at: form.range[1],
  }
  delete (payload as any).range

  try {
    if (dialog.isEdit) {
      await http.put(`/admin/campaigns/${form.id}`, payload)
    } else {
      await http.post('/admin/campaigns', payload)
    }
    ElMessage.success('操作成功')
    dialog.visible = false
    loadCampaigns()
  } catch {}
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定删除该活动吗？', '提示', { type: 'warning' })
  await http.delete(`/admin/campaigns/${id}`)
  ElMessage.success('已删除')
  loadCampaigns()
}

async function handleManageGoods(row: any) {
  goodsDialog.campaignId = row.id
  goodsDialog.campaignName = row.name
  goodsDialog.visible = true
  loadGoods()
}

async function loadGoods() {
  const res = await http.get(`/admin/seckill/goods?campaign_id=${goodsDialog.campaignId}`)
  goodsDialog.list = res.data || []
}

function prepareAddGood() {
  goodFormDialog.isEdit = false
  goodForm.id = 0
  goodForm.seckill_campaign_id = goodsDialog.campaignId
  goodForm.product_id = undefined as any
  goodForm.sku_id = undefined as any
  goodForm.seckill_price = 0
  goodForm.stock = 10
  goodForm.status = 1
  allSkus.value = []
  loadAllProducts()
  goodFormDialog.visible = true
}

function editGood(row: any) {
  goodFormDialog.isEdit = true
  Object.assign(goodForm, row)
  goodFormDialog.visible = true
}

async function submitGood() {
  try {
    if (goodFormDialog.isEdit) {
      await http.put(`/admin/seckill/goods/${goodForm.id}`, goodForm)
    } else {
      await http.post('/admin/seckill/goods', goodForm)
    }
    ElMessage.success('保存成功')
    goodFormDialog.visible = false
    loadGoods()
  } catch {}
}

async function deleteGood(id: number) {
  await ElMessageBox.confirm('确定移除该秒杀商品吗？', '提示', { type: 'warning' })
  await http.delete(`/admin/seckill/goods/${id}`)
  ElMessage.success('已移除')
  loadGoods()
}

async function warmup(id: number) {
  await http.post(`/admin/seckill/${id}/warmup`)
  ElMessage.success('秒杀库存预热成功')
}

onMounted(loadCampaigns)
</script>

<style scoped>
.page { padding: 24px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.goods-toolbar { margin-bottom: 20px; }
</style>
