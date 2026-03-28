<template>
  <section class="admin-panel page">
    <div class="toolbar">
      <h1>订单管理</h1>
      <div class="search-bar">
        <el-input v-model="keyword" placeholder="订单号 / 用户昵称 / 邮箱" style="width: 260px;" clearable @keyup.enter="doSearch" />
        <el-button type="primary" @click="doSearch">搜索</el-button>
        <el-select v-model="status" style="width: 140px;" @change="doSearch">
          <el-option label="全部状态" value="all" />
          <el-option label="待支付" value="10" />
          <el-option label="已支付" value="20" />
          <el-option label="已取消" value="30" />
          <el-option label="已关闭" value="40" />
          <el-option label="已完成" value="50" />
        </el-select>
      </div>
    </div>
    <el-table v-loading="loading" :data="rows" style="margin-top: 18px;">
      <el-table-column prop="order_no" label="订单号" min-width="220" />
      <el-table-column prop="nickname" label="用户" width="160" />
      <el-table-column prop="pay_amount" label="支付金额" width="120" />
      <el-table-column prop="order_type" label="类型" width="120" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" min-width="180" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.order_no)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" layout="total, prev, pager, next" :total="total" @current-change="loadOrders" />
    </div>

    <el-drawer v-model="detailVisible" title="订单详情" size="52%">
      <div v-if="detailLoading"><el-skeleton animated /></div>
      <div v-else-if="detail" class="detail-wrap">
        <div class="detail-card">
          <div>订单号：{{ detail.order.order_no }}</div>
          <div>用户：{{ detail.user.nickname }} / {{ detail.user.email }}</div>
          <div>状态：{{ statusLabel(detail.order.status) }}</div>
          <div>金额：¥{{ Number(detail.order.pay_amount).toFixed(2) }}</div>
        </div>
        <div class="detail-card">
          <h3>订单项</h3>
          <div v-for="item in detail.items" :key="item.id" class="detail-row">
            <span>{{ item.product_name }} · {{ item.sku_title }} · x{{ item.quantity }}</span>
            <span>¥{{ Number(item.total_amount).toFixed(2) }}</span>
          </div>
        </div>
        <div v-if="detail.cards?.length" class="detail-card">
          <h3>卡密交付</h3>
          <div v-for="card in detail.cards" :key="card.id" class="card-row">
            <div class="card-main">
              <strong>{{ card.product_name }} · {{ card.sku_title }}</strong>
              <span>{{ card.masked_summary }}</span>
              <small>档案：{{ card.profile_name || '-' }} / 订单：{{ card.order_no }}</small>
            </div>
            <div class="card-side">
              <el-tag :type="cardStatusType(card.status)">{{ cardStatusLabel(card.status) }}</el-tag>
              <small>查看 {{ card.reveal_count || 0 }} 次</small>
              <small>兑换：{{ card.redeemed_at || '未兑换' }}</small>
            </div>
          </div>
        </div>
        <div class="detail-card">
          <h3>发货内容</h3>
          <pre v-for="record in detail.deliveries" :key="record.id" class="delivery-box">{{ record.content }}</pre>
        </div>
      </div>
    </el-drawer>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import http from '@/api/http'

const loading = ref(false)
const rows = ref<any[]>([])
const status = ref('all')
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<any | null>(null)

function statusLabel(value: number) {
  return ({ 10: '待支付', 20: '已支付', 30: '已取消', 40: '已关闭', 50: '已完成' } as Record<number, string>)[value] || '未知'
}

function statusType(value: number) {
  return ({ 10: 'warning', 20: 'success', 30: 'info', 40: 'danger', 50: 'success' } as Record<number, string>)[value] || 'info'
}

function cardStatusLabel(value: number) {
  return ({ 20: '待兑换', 30: '已兑换' } as Record<number, string>)[value] || '已发放'
}

function cardStatusType(value: number) {
  return ({ 20: 'warning', 30: 'success' } as Record<number, string>)[value] || 'info'
}

function doSearch() {
  page.value = 1
  loadOrders()
}

async function loadOrders() {
  loading.value = true
  try {
    const res = await http.get('/admin/orders', { params: { status: status.value, keyword: keyword.value, page: page.value, page_size: pageSize.value } })
    rows.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

async function openDetail(orderNo: string) {
  detailVisible.value = true
  detailLoading.value = true
  try {
    const res = await http.get(`/admin/orders/${orderNo}`)
    detail.value = res.data
  } finally {
    detailLoading.value = false
  }
}

onMounted(loadOrders)
</script>
<style scoped>
.page { padding: 24px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
.pager { display: flex; justify-content: flex-end; margin-top: 18px; }
.detail-wrap { display: grid; gap: 16px; }
.detail-card { padding: 18px; border-radius: 18px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--admin-border); display: grid; gap: 10px; }
.detail-row { display: flex; justify-content: space-between; gap: 12px; }
.card-row { display: flex; justify-content: space-between; gap: 12px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.card-row:last-child { border-bottom: none; padding-bottom: 0; }
.card-main { display: grid; gap: 6px; }
.card-main span,
.card-main small,
.card-side small { color: var(--admin-text-secondary); }
.card-side { display: grid; justify-items: end; gap: 8px; }
.delivery-box { white-space: pre-wrap; padding: 12px; border-radius: 14px; background: rgba(0, 0, 0, 0.2); border: 1px dashed var(--admin-border); color: var(--admin-text-main); }
</style>
