<template>
  <section class="admin-panel page">
    <div class="toolbar">
      <h1>库存管理</h1>
      <div class="actions">
        <el-input v-model="keyword" placeholder="商品名 / SKU / 规格" style="width: 280px;" clearable @keyup.enter="loadInventory" />
        <el-button type="primary" @click="loadInventory">查询</el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="rows" style="margin-top: 18px;">
      <el-table-column prop="product_name" label="商品" min-width="220" />
      <el-table-column prop="sku_code" label="SKU" min-width="180" />
      <el-table-column prop="sku_title" label="规格" min-width="160" />
      <el-table-column prop="total_stock" label="总库存" width="120" />
      <el-table-column prop="available_stock" label="可售" width="120" />
      <el-table-column prop="reserved_stock" label="预占" width="120" />
      <el-table-column prop="updated_at" label="更新时间" min-width="180" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" @click="openAdjust(row)">调整库存</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" layout="total, prev, pager, next" :total="total" @current-change="loadInventory" />
    </div>

    <el-dialog v-model="adjustVisible" title="调整库存" width="400px" destroy-on-close>
      <div v-if="adjustRow" class="adjust-info">
        <div class="adjust-product">{{ adjustRow.product_name }} · {{ adjustRow.sku_title }}</div>
        <div class="adjust-current">当前可售库存：<strong>{{ adjustRow.available_stock }}</strong></div>
      </div>
      <el-form style="margin-top: 16px;">
        <el-form-item label="调整量">
          <el-input-number v-model="adjustDelta" :min="-9999" :max="99999" style="width: 100%" />
        </el-form-item>
        <div class="adjust-preview" v-if="adjustRow">
          调整后可售：<strong>{{ adjustRow.available_stock + adjustDelta }}</strong>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="adjustVisible = false">取消</el-button>
        <el-button type="primary" :loading="adjustLoading" :disabled="adjustDelta === 0" @click="submitAdjust">确认调整</el-button>
      </template>
    </el-dialog>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/api/http'

const loading = ref(false)
const rows = ref<any[]>([])
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const adjustVisible = ref(false)
const adjustLoading = ref(false)
const adjustRow = ref<any | null>(null)
const adjustDelta = ref(0)

async function loadInventory() {
  loading.value = true
  try {
    const res = await http.get('/admin/inventory', { params: { keyword: keyword.value, page: page.value, page_size: pageSize.value } })
    rows.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function openAdjust(row: any) {
  adjustRow.value = row
  adjustDelta.value = 0
  adjustVisible.value = true
}

async function submitAdjust() {
  if (!adjustRow.value || adjustDelta.value === 0) return
  adjustLoading.value = true
  try {
    await http.post(`/admin/inventory/${adjustRow.value.sku_id}/adjust`, { delta: adjustDelta.value })
    ElMessage.success('库存调整成功')
    adjustVisible.value = false
    await loadInventory()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '调整失败')
  } finally {
    adjustLoading.value = false
  }
}

onMounted(loadInventory)
</script>
<style scoped>
.page { padding: 24px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.actions { display: flex; gap: 12px; }
.pager { display: flex; justify-content: flex-end; margin-top: 18px; }
.adjust-info { display: grid; gap: 8px; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--admin-border); }
.adjust-product { font-weight: 700; font-size: 15px; }
.adjust-current { color: var(--admin-text-secondary); font-size: 14px; }
.adjust-preview { margin-top: 8px; color: var(--admin-text-secondary); font-size: 14px; }
</style>
