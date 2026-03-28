<template>
  <section class="coupons-page fade-in-up">
    <!-- Header -->
    <div class="page-header glass-panel">
      <div class="header-text">
        <h1 class="page-title">{{ $t('coupons.pageTitle') }}</h1>
        <p class="page-desc">{{ $t('coupons.pageDesc') }}</p>
      </div>
      <div class="header-actions">
        <button class="action-btn outline hover-float" @click="loadTemplates">{{ $t('coupons.refreshTemplates') }}</button>
      </div>
    </div>

    <!-- My Coupons -->
    <div class="coupon-list" v-if="coupons.length">
      <article v-for="coupon in coupons" :key="coupon.coupon_code" class="coupon-card glass-panel hover-float">
        <div class="coupon-left">
          <div class="coupon-amount">¥{{ coupon.amount }}</div>
          <div class="coupon-threshold">{{ $t('coupons.threshold', { amount: coupon.threshold_amount }) }}</div>
        </div>
        <div class="coupon-right">
          <div class="coupon-name">
            {{ coupon.template_name }}
            <span class="coupon-status" :class="`s-${coupon.status}`">{{ statusText(coupon.status) }}</span>
          </div>
          <div class="coupon-meta">{{ $t('coupons.expires') }}: {{ coupon.expired_at }}</div>
          <div class="coupon-meta" v-if="coupon.order_no">{{ $t('coupons.linkedOrder') }}: {{ coupon.order_no }}</div>
        </div>
      </article>
    </div>

    <!-- Available Templates -->
    <div class="template-section glass-panel" v-if="templates.length">
      <h2 class="section-title">{{ $t('coupons.available') }}</h2>
      <div class="template-list">
        <div v-for="tpl in templates" :key="tpl.id" class="template-item">
          <div class="tpl-info">
            <strong>{{ tpl.name }}</strong>
            <span class="tpl-desc">{{ $t('coupons.threshold', { amount: tpl.threshold_amount }) }} → -¥{{ tpl.amount }}</span>
          </div>
          <button 
            class="primary-btn hover-float" 
            :class="{ claimed: isClaimed(tpl.id) }" 
            :disabled="isClaimed(tpl.id)" 
            @click="claim(tpl.id)"
          >
            {{ isClaimed(tpl.id) ? $t('coupons.alreadyClaimed') : $t('coupons.claim') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import http from '@/api/http'

const { t } = useI18n()
const coupons = ref<any[]>([])
const templates = ref<any[]>([])

async function loadCoupons() {
  const res = await http.get('/user/coupons')
  coupons.value = res.data
}

async function loadTemplates() {
  const res = await http.get('/coupon/templates')
  templates.value = res.data
}

function isClaimed(templateId: number) {
  return coupons.value.some((c) => c.template_id === templateId)
}

async function claim(templateId: number) {
  await http.post('/user/coupons/claim', { template_id: templateId })
  ElMessage.success(t('coupons.claimed'))
  await loadCoupons()
}

function statusText(status: number) {
  return ({ 10: t('coupons.unused'), 20: t('coupons.locked'), 30: t('coupons.used') } as Record<number, string>)[status] || t('orders.unknown')
}

onMounted(async () => {
  await loadCoupons()
  await loadTemplates()
})
</script>

<style scoped>
.coupons-page { display: flex; flex-direction: column; gap: 32px; padding-bottom: 80px; }

.page-header { padding: 32px 40px; display: flex; justify-content: space-between; align-items: center; }
.header-text { display: flex; flex-direction: column; gap: 8px; }
.page-title { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
.page-desc { margin: 0; color: var(--text-secondary); font-size: 15px; }

.action-btn { padding: 10px 20px; border-radius: 999px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.action-btn.outline { background: var(--bg-glass); border: 1px solid var(--border); color: var(--text-main); }
.action-btn.outline:hover { background: var(--bg-elevated); }

/* Coupons */
.coupon-list { display: grid; gap: 16px; }

.coupon-card { padding: 24px 28px; display: grid; grid-template-columns: 140px 1fr; gap: 24px; align-items: center; }

.coupon-left { text-align: center; }
.coupon-amount { font-size: 36px; font-weight: 800; letter-spacing: -0.03em; color: var(--primary-strong); line-height: 1; }
.coupon-threshold { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }

.coupon-right { display: flex; flex-direction: column; gap: 6px; }
.coupon-name { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.coupon-status {
  padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
}
.s-10 { background: rgba(16, 185, 129, 0.1); color: var(--primary-strong); }
.s-20 { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.s-30 { background: rgba(0, 0, 0, 0.05); color: var(--text-muted); }

.coupon-meta { font-size: 13px; color: var(--text-secondary); }

/* Templates */
.template-section { padding: 32px 40px; }
.section-title { margin: 0 0 24px; font-size: 20px; font-weight: 800; }

.template-list { display: flex; flex-direction: column; }
.template-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border); }
.template-item:last-child { border-bottom: none; }

.tpl-info { display: flex; flex-direction: column; gap: 4px; }
.tpl-info strong { font-size: 15px; font-weight: 700; }
.tpl-desc { font-size: 13px; color: var(--text-secondary); }

.primary-btn { padding: 8px 24px; border-radius: 999px; background: var(--btn-primary-bg); color: var(--btn-primary-text); border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.primary-btn:hover { background: var(--btn-primary-bg); filter: brightness(0.9); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.primary-btn.claimed { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; box-shadow: none; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .coupon-card { grid-template-columns: 1fr; }
  .coupon-left { text-align: left; }
  .template-item { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>