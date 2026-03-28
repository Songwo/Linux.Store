<template>
  <section class="seckill-page fade-in-up">
    <div class="page-header glass-panel">
      <div class="header-main">
        <div class="header-text">
          <h1 class="page-title">{{ $t('seckill.pageTitle') }}</h1>
          <p class="page-desc">{{ $t('seckill.pageDesc') }}</p>
        </div>
        <div class="header-metrics">
          <div class="metric-pill">
            <strong>{{ liveCount }}</strong>
            <span>{{ $t('seckill.liveLabel') }}</span>
          </div>
          <div class="metric-pill">
            <strong>{{ queueingCount }}</strong>
            <span>{{ $t('seckill.queueingLabel') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="seckill-grid">
      <div class="campaigns-col">
        <div v-if="campaigns.length === 0" class="empty-state glass-panel">
          <div class="empty-icon">SE</div>
          <h3>{{ $t('common.empty') }}</h3>
        </div>
        <article v-for="camp in campaigns" :key="camp.seckill_campaign_id + '-' + camp.sku_id" class="campaign-card glass-panel hover-float">
          <div class="camp-header">
            <div class="camp-title-group">
              <strong class="camp-name">{{ camp.campaign_name }}</strong>
              <div class="product-name">{{ camp.product_name }}</div>
            </div>
            <span class="camp-badge" :class="getCampStatus(camp).class">
              {{ getCampStatus(camp).text }}
            </span>
          </div>
          <div class="camp-meta">
            <span>{{ $t('seckill.limitPerUser') }}</span>
            <span>SKU {{ camp.sku_id }} · ￥{{ Number(camp.seckill_price || 0).toFixed(2) }}</span>
          </div>
          <div class="stock-meta">
            <span>{{ $t('seckill.stockLeft', { a: getAvailableStock(camp), t: Number(camp.stock || 0) }) }}</span>
            <span>{{ $t('seckill.progressLabel', { n: getProgress(camp) }) }}</span>
          </div>
          <el-progress :percentage="getProgress(camp)" :stroke-width="8" color="#10b981" />
          <div class="camp-actions">
            <button class="glass-btn hover-float" @click="queryResult(camp.seckill_campaign_id)">{{ $t('seckill.checkResult') }}</button>
            <button
              class="primary-btn hover-float"
              :class="{ 'is-loading': purchasing[camp.seckill_campaign_id] }"
              :disabled="isPurchaseDisabled(camp)"
              @click="purchase(camp.seckill_campaign_id, camp.sku_id)"
            >
              {{ purchaseLabel(camp) }}
            </button>
          </div>
        </article>
      </div>

      <aside class="info-panel glass-panel">
        <h3>{{ $t('seckill.notes') }}</h3>
        <ul class="rules-list">
          <li>{{ $t('seckill.note1') }}</li>
          <li>{{ $t('seckill.note2') }}</li>
          <li>{{ $t('seckill.note3') }}</li>
        </ul>
        <div class="result-display">
          <span class="result-label">{{ $t('seckill.currentResult') }}</span>
          <div class="result-value">{{ formattedResult }}</div>
          <p v-if="resultOrderNo" class="result-order">{{ $t('seckill.resultOrder', { no: resultOrderNo }) }}</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { mallApi, type SeckillItem } from '@/api/mall'
import { useAuthStore } from '@/stores/auth'

interface CampaignState {
  class: 'live' | 'off'
  text: string
  active: boolean
}

const { t } = useI18n()
const auth = useAuthStore()
const campaigns = ref<SeckillItem[]>([])
const result = ref('none')
const purchasing = ref<Record<number, boolean>>({})
const userResults = ref<Record<number, string>>({})
let refreshTimer: number | undefined

const liveCount = computed(() => campaigns.value.filter((camp) => isCampActive(camp)).length)
const queueingCount = computed(() => Object.values(userResults.value).filter((status) => status === 'queueing' || status === 'joined').length)
const formattedResult = computed(() => formatResult(result.value))
const resultOrderNo = computed(() => (result.value.startsWith('success:') ? result.value.split(':')[1] : ''))

function getCampStatus(camp: SeckillItem): CampaignState {
  if (camp.campaign_status !== 1) return { class: 'off', text: t('seckill.closed'), active: false }
  const now = Date.now()
  const start = camp.start_at ? new Date(camp.start_at).getTime() : 0
  const end = camp.end_at ? new Date(camp.end_at).getTime() : 0
  if (start && now < start) return { class: 'off', text: t('seckill.upcoming'), active: false }
  if (end && now > end) return { class: 'off', text: t('seckill.ended'), active: false }
  return { class: 'live', text: t('seckill.ongoing'), active: true }
}

function getAvailableStock(camp: SeckillItem) {
  const value = Number(camp.available_stock || 0)
  return Number.isFinite(value) && value > 0 ? value : 0
}

function getProgress(camp: SeckillItem) {
  const value = Number(camp.progress || 0)
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Number(value.toFixed(0))))
}

function isCampActive(camp: SeckillItem) {
  return getCampStatus(camp).active
}

function isJoined(campaignId: number) {
  const status = userResults.value[campaignId] || ''
  return status === 'queueing' || status === 'joined' || status.startsWith('success')
}

function isPurchaseDisabled(camp: SeckillItem) {
  return Boolean(purchasing.value[camp.seckill_campaign_id] || !isCampActive(camp) || isJoined(camp.seckill_campaign_id) || getAvailableStock(camp) <= 0)
}

function purchaseLabel(camp: SeckillItem) {
  if (purchasing.value[camp.seckill_campaign_id]) return t('seckill.processing')
  if (isJoined(camp.seckill_campaign_id)) return t('seckill.alreadyJoined')
  if (getAvailableStock(camp) <= 0) return t('seckill.soldOut')
  return t('seckill.grabNow')
}

function formatResult(status: string) {
  if (status.startsWith('success:')) return t('seckill.resultSuccess')
  if (status === 'queueing') return t('seckill.resultQueueing')
  if (status === 'joined') return t('seckill.resultJoined')
  if (status === 'failed') return t('seckill.resultFailed')
  if (status === 'cancelled') return t('seckill.resultCancelled')
  if (status === 'none') return t('seckill.resultNone')
  return status || t('seckill.resultNone')
}

async function fetchSeckillResultSilently(campaignId: number) {
  if (!auth.token) return 'none'
  try {
    const response = await fetch(`/api/v1/user/seckill/result?campaign_id=${campaignId}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok || !payload || payload.code !== 0) {
      return 'none'
    }
    return payload.data?.status || 'none'
  } catch {
    return 'none'
  }
}

async function syncUserResults(list: SeckillItem[]) {
  if (!auth.isLoggedIn) {
    userResults.value = {}
    return
  }

  const campaignIds = Array.from(new Set(list.map((item) => item.seckill_campaign_id)))
  const next: Record<number, string> = { ...userResults.value }
  const results = await Promise.allSettled(campaignIds.map((campaignId) => fetchSeckillResultSilently(campaignId)))
  results.forEach((entry, index) => {
    if (entry.status === 'fulfilled') {
      next[campaignIds[index]] = entry.value
    }
  })
  userResults.value = next
}

function trackedCampaignIds() {
  return Array.from(
    new Set(
      Object.entries(userResults.value)
        .filter(([, status]) => status === 'queueing' || status === 'joined')
        .map(([campaignId]) => Number(campaignId)),
    ),
  )
}

async function refreshTrackedResults() {
  const campaignIds = trackedCampaignIds()
  if (!campaignIds.length) return
  const next = { ...userResults.value }
  const results = await Promise.allSettled(campaignIds.map((campaignId) => fetchSeckillResultSilently(campaignId)))
  results.forEach((entry, index) => {
    if (entry.status === 'fulfilled') {
      const campaignId = campaignIds[index]
      next[campaignId] = entry.value
      if (entry.value.startsWith('success') || entry.value === 'failed') {
        result.value = entry.value
      }
    }
  })
  userResults.value = next
}

async function loadCampaigns(syncResults = false) {
  try {
    campaigns.value = await mallApi.getSeckillGoods()
    if (syncResults) {
      await syncUserResults(campaigns.value)
    }
  } catch {
    campaigns.value = []
  }
}

async function purchase(campaignId: number, skuId: number) {
  if (purchasing.value[campaignId]) return
  purchasing.value[campaignId] = true
  try {
    const res = await mallApi.purchaseSeckill(campaignId, skuId)
    userResults.value = { ...userResults.value, [campaignId]: 'queueing' }
    result.value = res.status
    ElMessage.success(t('seckill.queuedMsg'))
    await Promise.all([loadCampaigns(false), refreshTrackedResults()])
  } catch (error: any) {
    const code = Number(error?.code || error?.response?.data?.code || 0)
    if (code === 40021) {
      userResults.value = { ...userResults.value, [campaignId]: 'joined' }
    }
  } finally {
    purchasing.value[campaignId] = false
  }
}

async function queryResult(campaignId: number, silent = false) {
  const res = await mallApi.getSeckillResult(campaignId)
  const status = res.status || 'none'
  userResults.value = { ...userResults.value, [campaignId]: status }
  if (!silent) {
    result.value = status
  }
  return status
}

onMounted(async () => {
  await loadCampaigns(true)
  refreshTimer = window.setInterval(() => {
    if (document.hidden) return
    void loadCampaigns(false)
    void refreshTrackedResults()
  }, 4000)
})

onUnmounted(() => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.seckill-page { display: flex; flex-direction: column; gap: 32px; padding-bottom: 80px; }
.page-header { padding: 32px 40px; }
.header-main { display: flex; justify-content: space-between; align-items: center; gap: 24px; }
.page-title { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
.page-desc { margin: 8px 0 0; color: var(--text-secondary); font-size: 15px; }
.header-metrics { display: flex; gap: 12px; }
.metric-pill { min-width: 110px; padding: 14px 18px; border-radius: 20px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.14); display: flex; flex-direction: column; gap: 4px; }
.metric-pill strong { font-size: 24px; line-height: 1; }
.metric-pill span { color: var(--text-secondary); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }

.seckill-grid { display: grid; grid-template-columns: 1.4fr 0.6fr; gap: 32px; }
.campaigns-col { display: flex; flex-direction: column; gap: 24px; }
.campaign-card { padding: 28px; display: flex; flex-direction: column; gap: 16px; }
.camp-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.camp-title-group { display: flex; flex-direction: column; gap: 4px; }
.camp-name { font-size: 20px; font-weight: 800; }
.product-name { font-size: 14px; color: var(--text-secondary); font-weight: 500; }
.camp-badge { padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.camp-badge.live { background: rgba(16, 185, 129, 0.15); color: var(--primary-strong); }
.camp-badge.off { background: var(--bg-card); color: var(--text-muted); }
.camp-meta { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-secondary); }
.stock-meta { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); }
.camp-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }

.glass-btn { padding: 8px 16px; border-radius: 999px; background: var(--bg-glass); border: 1px solid var(--border); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.glass-btn:hover { background: var(--bg-elevated); }
.primary-btn { padding: 8px 24px; border-radius: 999px; background: var(--text-main); color: white; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.primary-btn:hover { background: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.primary-btn:disabled { background: var(--text-muted); cursor: not-allowed; opacity: 0.6; }

.info-panel { padding: 28px; display: flex; flex-direction: column; gap: 20px; height: max-content; position: sticky; top: 120px; }
.info-panel h3 { margin: 0; font-size: 18px; font-weight: 800; }
.rules-list { margin: 0; padding-left: 20px; color: var(--text-secondary); line-height: 2; font-size: 14px; }
.result-display { padding: 20px; border-radius: 16px; background: var(--bg-card); border: 1px solid var(--border); }
.result-label { font-size: 13px; font-weight: 600; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; }
.result-value { font-size: 24px; font-weight: 800; color: var(--primary-strong); margin-top: 8px; }
.result-order { margin: 8px 0 0; color: var(--text-secondary); font-size: 13px; }

.empty-state { padding: 60px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.empty-icon { font-size: 40px; font-weight: 800; letter-spacing: 0.08em; color: var(--text-muted); }
.empty-state h3 { font-size: 18px; font-weight: 700; margin: 0; }

@media (max-width: 1024px) {
  .seckill-grid { grid-template-columns: 1fr; }
  .info-panel { position: static; }
}

@media (max-width: 768px) {
  .page-header, .campaign-card, .info-panel { padding: 24px; }
  .header-main { flex-direction: column; align-items: flex-start; }
  .header-metrics { width: 100%; }
  .metric-pill { flex: 1; }
}
</style>
