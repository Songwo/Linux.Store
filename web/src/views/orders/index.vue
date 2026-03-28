<template>
  <section class="orders-page fade-in-up">
    <div class="page-header glass-panel">
      <div class="header-copy">
        <span class="header-kicker">{{ $t('orders.commandCenter') }}</span>
        <div>
          <h1 class="page-title">{{ $t('orders.pageTitle') }}</h1>
          <p class="page-desc">{{ $t('orders.pageDesc') }}</p>
        </div>
      </div>
      <div class="header-summary">
        <div class="summary-pill">
          <span>{{ $t('orders.visible') }}</span>
          <strong>{{ orders.length }}</strong>
        </div>
        <div class="summary-pill">
          <span>{{ $t('orders.pendingLabel') }}</span>
          <strong>{{ pendingCount }}</strong>
        </div>
        <div class="summary-pill">
          <span>{{ $t('orders.doneLabel') }}</span>
          <strong>{{ completedCount }}</strong>
        </div>
      </div>
    </div>

    <div class="status-tabs glass-panel">
      <button
        v-for="tab in tabs"
        :key="tab.val"
        :class="['tab-btn', { 'is-active': activeStatus === tab.val }]"
        @click="switchStatus(tab.val)"
      >
        {{ tab.label }}
      </button>
      <button class="action-btn outline" @click="loadOrders">{{ $t('orders.refreshOrders') }}</button>
    </div>

    <div class="orders-shell">
      <div class="orders-column">
        <div v-if="selectedOrder" class="current-strip glass-panel">
          <div>
            <span class="strip-label">{{ $t('orders.currentlyPinned') }}</span>
            <strong>#{{ selectedOrder.order_no }}</strong>
            <p>{{ statusText(selectedOrder.status) }}  |  {{ formatDate(selectedOrder.created_at) }}</p>
          </div>
          <button class="glass-btn" @click="openCurrentDetail">{{ isDesktop ? $t('orders.jumpToDetail') : $t('orders.openDetail') }}</button>
        </div>

        <div v-loading="loading" class="order-list">
          <div v-if="loading && orders.length === 0" class="skeleton-list">
            <el-skeleton v-for="index in 3" :key="index" animated class="glass-panel skeleton-card" />
          </div>

          <div v-else-if="orders.length" class="order-grid">
            <article
              v-for="order in orders"
              :key="order.order_no"
              :class="['order-card', 'glass-panel', { 'is-active': selectedOrderNo === order.order_no }]"
              @click="selectOrder(order.order_no)"
            >
              <div class="order-header">
                <div class="order-meta">
                  <span class="order-no">#{{ order.order_no }}</span>
                  <span class="order-time">{{ formatDate(order.created_at) }}</span>
                </div>
                <div class="order-status-badge" :class="`status-${order.status}`">
                  {{ statusText(order.status) }}
                </div>
              </div>

              <div class="order-items">
                <div v-for="item in order.items.slice(0, 2)" :key="item.id" class="item-row">
                  <div class="item-visual">{{ initials(item.product_name) }}</div>
                  <div class="item-info">
                    <strong>{{ item.product_name }}</strong>
                    <span>{{ item.sku_title }} x {{ item.quantity }}</span>
                  </div>
                  <div class="item-price">
                    <span class="p-amount">CNY {{ Number(item.total_amount).toFixed(2) }}</span>
                    <span v-if="item.points_price" class="p-points">{{ item.points_price }} Pts</span>
                  </div>
                </div>
                <div v-if="order.items.length > 2" class="more-items">
                  +{{ order.items.length - 2 }} more items in this order
                </div>
              </div>

              <div class="order-footer">
                <div class="order-summary">
                  <span class="label">Total paid</span>
                  <strong class="total-amount">CNY {{ Number(order.pay_amount).toFixed(2) }}</strong>
                  <span v-if="order.points_amount" class="total-points">+ {{ order.points_amount }} Pts</span>
                </div>
                <div class="order-actions">
                  <button class="glass-btn" @click.stop="viewDetail(order.order_no)">{{ $t('common.details') }}</button>
                  <button v-if="order.status === 10" class="glass-btn danger" @click.stop="cancel(order.order_no)">Cancel</button>
                  <button v-if="order.status === 10" class="primary-btn" @click.stop="pay(order.order_no)">{{ $t('orders.payNow') }}</button>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="empty-state glass-panel">
            <div class="empty-icon">OD</div>
            <h3>{{ $t('orders.noOrders') }}</h3>
            <p>{{ $t('orders.noOrdersDesc') }}</p>
          </div>
        </div>
      </div>

      <aside v-if="orders.length" class="detail-column">
        <div class="detail-sticky">
          <div class="detail-intro glass-panel">
            <span class="detail-kicker">Pinned detail panel</span>
            <h2>{{ selectedOrder ? `#${selectedOrder.order_no}` : 'Order detail' }}</h2>
            <p>
              The current order stays visible here while you keep scrolling and comparing records on the left.
            </p>
          </div>
          <div ref="detailPanelRef" class="detail-panel glass-panel">
            <OrderDetailPanel
              :detail-data="detailData"
              :detail-loading="detailLoading"
              @open-cards="openCards"
              @pay="pay"
            />
          </div>
        </div>
      </aside>
    </div>

    <button v-if="!isDesktop && detailData" class="mobile-focus-bar" @click="openCurrentDetail">
      <span>Current order</span>
      <strong>#{{ detailData.order.order_no }}</strong>
      <small>Tap to open details</small>
    </button>

    <el-drawer
      v-if="!isDesktop"
      v-model="detailVisible"
      size="92%"
      class="premium-drawer"
      :show-close="false"
    >
      <template #header>
        <div class="drawer-header">
          <div>
            <span class="detail-kicker">Mobile detail</span>
            <h2>{{ detailData?.order?.order_no ? `#${detailData.order.order_no}` : $t('orders.orderDetail') }}</h2>
          </div>
          <button class="close-btn" @click="detailVisible = false">Close</button>
        </div>
      </template>

      <OrderDetailPanel
        :detail-data="detailData"
        :detail-loading="detailLoading"
        @open-cards="openCards"
        @pay="pay"
      />
    </el-drawer>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { mallApi } from '@/api/mall'
import OrderDetailPanel from '@/components/OrderDetailPanel.vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const app = useAppStore()
const auth = useAuthStore()

const loading = ref(false)
const orders = ref<any[]>([])
const activeStatus = ref((route.query.status as string) || 'all')
const selectedOrderNo = ref(typeof route.query.focus === 'string' ? route.query.focus : '')
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<any | null>(null)
const detailPanelRef = ref<HTMLElement | null>(null)
const isDesktop = ref(true)

const tabs = computed(() => [
  { label: t('orders.allOrders'), val: 'all' },
  { label: t('orders.pending'), val: '10' },
  { label: t('orders.paid'), val: '20' },
  { label: t('orders.completed'), val: '50' },
  { label: t('orders.canceled'), val: '30' },
])

const selectedOrder = computed(() => orders.value.find((order) => order.order_no === selectedOrderNo.value) || null)
const pendingCount = computed(() => orders.value.filter((order) => order.status === 10).length)
const completedCount = computed(() => orders.value.filter((order) => order.status === 50 || order.status === 20).length)

function statusText(status: number) {
  return ({
    10: t('orders.pendingPay'),
    20: t('orders.statusPaid'),
    30: t('orders.statusCanceled'),
    40: t('orders.statusClosed'),
    50: t('orders.statusCompleted'),
  } as Record<number, string>)[status] || t('orders.unknown')
}

function formatDate(value?: string) {
  return value ? dayjs(value).format('MMM D, YYYY  |  HH:mm') : '-'
}

function initials(value?: string) {
  return (value || 'IT').slice(0, 2).toUpperCase()
}

function handleResize() {
  isDesktop.value = window.innerWidth >= 1080
  if (isDesktop.value) {
    detailVisible.value = false
  }
}

async function syncSelectedOrder(preferredOrderNo?: string) {
  if (!orders.value.length) {
    selectedOrderNo.value = ''
    detailData.value = null
    detailVisible.value = false
    return
  }

  const preferred = preferredOrderNo && orders.value.some((order) => order.order_no === preferredOrderNo) ? preferredOrderNo : ''
  const current = selectedOrderNo.value && orders.value.some((order) => order.order_no === selectedOrderNo.value) ? selectedOrderNo.value : ''
  const nextOrderNo = preferred || current || orders.value[0].order_no

  await selectOrder(nextOrderNo, {
    openDrawer: false,
    forceReload: detailData.value?.order?.order_no !== nextOrderNo,
  })
}

async function loadOrders() {
  loading.value = true
  try {
    orders.value = await mallApi.getOrders(activeStatus.value)
    await syncSelectedOrder(typeof route.query.focus === 'string' ? route.query.focus : '')
  } finally {
    loading.value = false
  }
}

async function selectOrder(orderNo: string, options: { openDrawer?: boolean; forceReload?: boolean } = {}) {
  if (!orderNo) {
    return
  }

  const { openDrawer = !isDesktop.value, forceReload = false } = options
  selectedOrderNo.value = orderNo

  if (openDrawer && !isDesktop.value) {
    detailVisible.value = true
  }

  if (!forceReload && detailData.value?.order?.order_no === orderNo) {
    return
  }

  detailLoading.value = true
  try {
    detailData.value = await mallApi.getOrderDetail(orderNo)
  } finally {
    detailLoading.value = false
  }
}

async function viewDetail(orderNo: string) {
  await selectOrder(orderNo, { openDrawer: true, forceReload: true })
}

async function pay(orderNo: string) {
  await mallApi.payOrder(orderNo)
  await Promise.all([auth.fetchProfile().catch(() => undefined), app.refreshUserAssets().catch(() => undefined)])
  ElMessage.success({ message: t('orders.paySuccess'), customClass: 'premium-toast' })
  await loadOrders()
  await selectOrder(orderNo, { openDrawer: !isDesktop.value, forceReload: true })
}

async function cancel(orderNo: string) {
  await mallApi.cancelOrder(orderNo)
  ElMessage.success({ message: t('orders.cancelSuccess'), customClass: 'premium-toast' })
  await loadOrders()
}

async function openCurrentDetail() {
  if (!selectedOrderNo.value) {
    return
  }

  if (isDesktop.value) {
    await nextTick()
    detailPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  detailVisible.value = true
}

function openCards(orderNo: string) {
  detailVisible.value = false
  router.push({ path: '/cards', query: { order_no: orderNo } })
}

function switchStatus(status: string) {
  if (activeStatus.value === status) {
    return
  }
  activeStatus.value = status
  void loadOrders()
}

watch(
  () => route.query.focus,
  async (orderNo) => {
    if (typeof orderNo === 'string' && orderNo && orders.value.length) {
      await selectOrder(orderNo, { openDrawer: !isDesktop.value, forceReload: true })
    }
  },
)

watch(
  () => route.query.status,
  (status) => {
    const nextStatus = typeof status === 'string' ? status : 'all'
    if (nextStatus !== activeStatus.value) {
      activeStatus.value = nextStatus
      void loadOrders()
    }
  },
)

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize, { passive: true })
  await loadOrders()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.orders-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 100px;
}

.page-header {
  padding: 32px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-kicker,
.detail-kicker,
.strip-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary-strong);
}

.page-title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.page-desc {
  margin: 8px 0 0;
  font-size: 15px;
  color: var(--text-secondary);
}

.header-summary {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-pill {
  min-width: 96px;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.14);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-pill span {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.summary-pill strong {
  font-size: 24px;
  line-height: 1;
}

.status-tabs {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-radius: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.tab-btn,
.action-btn,
.glass-btn,
.primary-btn,
.close-btn {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.tab-btn {
  color: var(--text-secondary);
}

.tab-btn:hover,
.tab-btn.is-active,
.action-btn:hover,
.glass-btn:hover,
.primary-btn:hover,
.close-btn:hover {
  transform: translateY(-1px);
}

.tab-btn.is-active {
  background: var(--bg-page);
  color: var(--text-main);
  box-shadow: 0 10px 20px -16px rgba(17, 24, 39, 0.35);
}

.action-btn.outline,
.glass-btn,
.close-btn {
  background: var(--bg-glass);
  color: var(--text-main);
}

.primary-btn {
  border: none;
  background: var(--text-main);
  color: #fff;
}

.orders-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) 420px;
  gap: 24px;
  align-items: start;
}

.orders-column,
.order-list,
.order-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.current-strip {
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.current-strip strong {
  display: block;
  margin-top: 4px;
  font-size: 20px;
  color: var(--text-main);
}

.current-strip p {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.skeleton-card {
  min-height: 220px;
  padding: 24px;
}

.order-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  cursor: pointer;
  border: 1px solid transparent;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: inset 0 1px 0 0 var(--border-glow), var(--shadow-float);
}

.order-card.is-active {
  border-color: rgba(16, 185, 129, 0.26);
  background: linear-gradient(180deg, rgba(240, 253, 250, 0.9), rgba(255, 255, 255, 0.88));
  box-shadow: 0 20px 40px -28px rgba(4, 120, 87, 0.5);
}

.order-header,
.order-footer,
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.order-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-no {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.order-time,
.more-items,
.p-points,
.total-points {
  font-size: 13px;
  color: var(--text-secondary);
}

.order-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.status-10 {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}

.status-20,
.status-50 {
  background: rgba(16, 185, 129, 0.12);
  color: var(--primary-strong);
}

.status-30,
.status-40 {
  background: rgba(15, 23, 42, 0.06);
  color: var(--text-muted);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-visual {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(15, 23, 42, 0.06));
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--primary-strong);
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-info strong,
.p-amount,
.total-amount {
  color: var(--text-main);
}

.item-info strong {
  font-size: 15px;
}

.item-info span {
  font-size: 13px;
  color: var(--text-secondary);
}

.item-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.p-amount {
  font-size: 15px;
  font-weight: 700;
}

.order-footer {
  padding-top: 16px;
  border-top: 1px dashed var(--border);
  align-items: center;
}

.order-summary {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.order-summary .label {
  font-size: 12px;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.total-amount {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.order-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.glass-btn.danger {
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.18);
}

.detail-column {
  position: relative;
}

.detail-sticky {
  position: sticky;
  top: 124px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-intro {
  padding: 22px;
}

.detail-intro h2 {
  margin: 10px 0 6px;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.detail-intro p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.detail-panel {
  padding: 16px;
}

.empty-state {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 14px;
  padding: 24px;
}

.empty-icon {
  width: 68px;
  height: 68px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-strong);
  font-weight: 800;
  letter-spacing: 0.08em;
}

.empty-state h3 {
  margin: 0;
  font-size: 24px;
  color: var(--text-main);
}

.empty-state p {
  margin: 0;
  color: var(--text-secondary);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 8px;
}

.drawer-header h2 {
  margin: 8px 0 0;
  font-size: 22px;
  font-weight: 800;
}

.mobile-focus-bar {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 18px;
  z-index: 45;
  border: 1px solid rgba(16, 185, 129, 0.18);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 22px 40px -28px rgba(17, 24, 39, 0.45);
  border-radius: 24px;
  padding: 14px 18px;
  display: none;
  text-align: left;
}

.mobile-focus-bar span,
.mobile-focus-bar small {
  display: block;
}

.mobile-focus-bar span {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary-strong);
}

.mobile-focus-bar strong {
  display: block;
  margin-top: 6px;
  font-size: 18px;
  color: var(--text-main);
}

.mobile-focus-bar small {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

@media (max-width: 1079px) {
  .orders-shell {
    grid-template-columns: 1fr;
  }

  .detail-column {
    display: none;
  }

  .mobile-focus-bar {
    display: block;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px;
    flex-direction: column;
    align-items: flex-start;
  }

  .header-summary {
    width: 100%;
  }

  .summary-pill {
    flex: 1;
  }

  .status-tabs {
    width: 100%;
  }

  .tab-btn {
    flex: 1 1 calc(50% - 8px);
  }

  .current-strip,
  .order-footer,
  .order-header,
  .item-row,
  .drawer-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-actions,
  .item-price {
    width: 100%;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .order-card {
    padding: 20px;
  }
}
</style>

