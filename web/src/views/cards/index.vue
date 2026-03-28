<template>
  <section class="cards-page fade-in-up">
    <div class="page-header glass-panel">
      <div class="header-copy">
        <h1>{{ $t('cards.pageTitle') }}</h1>
        <p>{{ $t('cards.pageDesc') }}</p>
      </div>
      <div class="header-actions">
        <button class="ghost-btn" @click="refreshCards">{{ $t('common.refresh') }}</button>
        <button
          v-if="orderFilter"
          class="ghost-btn"
          @click="clearOrderFilter"
        >
          {{ $t('cards.clearOrderFilter') }}
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <article class="stat-card glass-panel">
        <span>{{ $t('cards.totalCards') }}</span>
        <strong>{{ cards.length }}</strong>
        <small>{{ $t('cards.totalCardsHint') }}</small>
      </article>
      <article class="stat-card glass-panel">
        <span>{{ $t('cards.pendingCards') }}</span>
        <strong>{{ pendingCount }}</strong>
        <small>{{ $t('cards.pendingCardsHint') }}</small>
      </article>
      <article class="stat-card glass-panel">
        <span>{{ $t('cards.viewedCards') }}</span>
        <strong>{{ viewedCount }}</strong>
        <small>{{ $t('cards.viewedCardsHint') }}</small>
      </article>
      <article class="stat-card glass-panel">
        <span>{{ $t('cards.redeemedCards') }}</span>
        <strong>{{ redeemedCount }}</strong>
        <small>{{ $t('cards.redeemedCardsHint') }}</small>
      </article>
    </div>

    <div class="filter-bar glass-panel">
      <label class="filter-field">
        <span>{{ $t('cards.orderFilter') }}</span>
        <input
          v-model.trim="draftOrderFilter"
          type="text"
          :placeholder="$t('cards.orderFilterPlaceholder')"
          @keyup.enter="applyOrderFilter"
        />
      </label>
      <div class="filter-actions">
        <button class="ghost-btn" @click="applyOrderFilter">{{ $t('common.confirm') }}</button>
        <button class="ghost-btn" @click="clearOrderFilter">{{ $t('common.cancel') }}</button>
      </div>
    </div>

    <div class="privacy-banner glass-panel">
      <div>
        <strong>{{ $t('cards.privacyTitle') }}</strong>
        <p>{{ $t('cards.privacyDesc') }}</p>
      </div>
      <span v-if="orderFilter" class="filter-chip">#{{ orderFilter }}</span>
    </div>

    <div v-loading="loading" class="card-grid">
      <article
        v-for="card in cards"
        :key="card.id"
        class="card-item glass-panel"
      >
        <div class="card-top">
          <div class="card-title">
            <h2>{{ card.product_name }}</h2>
            <p>{{ card.sku_title || card.profile_name || '-' }}</p>
          </div>
          <span :class="['status-pill', `status-${card.status}`]">
            {{ statusText(card.status) }}
          </span>
        </div>

        <div class="card-secret-shell">
          <div class="secret-label">{{ $t('cards.maskedSecret') }}</div>
          <code>{{ card.masked_summary }}</code>
        </div>

        <div class="meta-grid">
          <div>
            <span>{{ $t('cards.orderNo') }}</span>
            <strong>{{ card.order_no || '-' }}</strong>
          </div>
          <div>
            <span>{{ $t('cards.profileName') }}</span>
            <strong>{{ card.profile_name || '-' }}</strong>
          </div>
          <div>
            <span>{{ $t('cards.assignedAt') }}</span>
            <strong>{{ formatDate(card.assigned_at) }}</strong>
          </div>
          <div>
            <span>{{ $t('cards.revealCount') }}</span>
            <strong>{{ card.reveal_count || 0 }}</strong>
          </div>
        </div>

        <div class="notes-box">
          <p>{{ card.guide_text || $t('cards.defaultGuide') }}</p>
          <small>{{ card.privacy_note || $t('cards.defaultPrivacy') }}</small>
        </div>

        <div class="card-actions">
          <button class="primary-btn" @click="handleReveal(card)">
            {{ card.reveal_count > 0 ? $t('cards.viewAgain') : $t('cards.viewSecret') }}
          </button>
          <button
            v-if="card.status !== 30"
            class="ghost-btn"
            @click="handleRedeem(card)"
          >
            {{ $t('cards.markRedeemed') }}
          </button>
          <button
            v-else
            class="ghost-btn"
            @click="handleReveal(card)"
          >
            {{ $t('cards.viewDetail') }}
          </button>
        </div>
      </article>

      <div v-if="!loading && cards.length === 0" class="empty-state glass-panel">
        <div class="empty-icon">🔐</div>
        <h3>{{ $t('cards.emptyTitle') }}</h3>
        <p>{{ $t('cards.emptyDesc') }}</p>
      </div>
    </div>

    <el-drawer v-model="detailVisible" size="520px" class="card-drawer" :show-close="false">
      <template #header>
        <div class="drawer-header">
          <div>
            <h3>{{ activeCard?.product_name || $t('cards.pageTitle') }}</h3>
            <p>{{ activeCard?.masked_summary || '-' }}</p>
          </div>
          <button class="close-btn" type="button" @click="detailVisible = false">✕</button>
        </div>
      </template>

      <div v-if="activeCard" class="drawer-body">
        <div class="drawer-status">
          <span :class="['status-pill', `status-${activeCard.status}`]">
            {{ statusText(activeCard.status) }}
          </span>
          <span>{{ $t('cards.revealCount') }} {{ activeCard.reveal_count }}</span>
          <span>{{ $t('cards.redeemedAt') }} {{ formatDate(activeCard.redeemed_at) }}</span>
        </div>

        <div class="secret-list">
          <div v-if="activeCard.secret.card_code" class="secret-row">
            <div>
              <span>{{ $t('cards.cardCode') }}</span>
              <code>{{ activeCard.secret.card_code }}</code>
            </div>
            <button class="copy-btn" @click="copyValue(activeCard.secret.card_code)">{{ $t('common.copy') }}</button>
          </div>
          <div v-if="activeCard.secret.card_password" class="secret-row">
            <div>
              <span>{{ $t('cards.cardPassword') }}</span>
              <code>{{ activeCard.secret.card_password }}</code>
            </div>
            <button class="copy-btn" @click="copyValue(activeCard.secret.card_password)">{{ $t('common.copy') }}</button>
          </div>
          <div v-if="activeCard.secret.redeem_code" class="secret-row">
            <div>
              <span>{{ $t('cards.redeemCode') }}</span>
              <code>{{ activeCard.secret.redeem_code }}</code>
            </div>
            <button class="copy-btn" @click="copyValue(activeCard.secret.redeem_code)">{{ $t('common.copy') }}</button>
          </div>
          <div v-if="activeCard.secret.extra_note" class="secret-row note-row">
            <div>
              <span>{{ $t('cards.extraNote') }}</span>
              <p>{{ activeCard.secret.extra_note }}</p>
            </div>
          </div>
        </div>

        <div class="info-panel glass-panel">
          <h4>{{ $t('cards.redeemGuide') }}</h4>
          <p>{{ activeCard.guide_text || $t('cards.defaultGuide') }}</p>
          <small>{{ activeCard.privacy_note || $t('cards.defaultPrivacy') }}</small>
        </div>

        <div class="link-panel">
          <a
            v-if="activeCard.product_url"
            :href="activeCard.product_url"
            class="link-btn"
            target="_blank"
            rel="noreferrer"
          >
            {{ $t('cards.openProduct') }}
          </a>
          <a
            v-if="activeCard.redirect_url || activeCard.redeem_url"
            :href="activeCard.redirect_url || activeCard.redeem_url"
            class="link-btn primary-link"
            target="_blank"
            rel="noreferrer"
          >
            {{ $t('cards.openRedeem') }}
          </a>
          <button class="link-btn" type="button" @click="copyAllSecrets(activeCard)">
            {{ $t('cards.copyAll') }}
          </button>
        </div>

        <div v-if="activeCard.support_contact" class="support-box">
          <span>{{ $t('cards.supportContact') }}</span>
          <strong>{{ activeCard.support_contact }}</strong>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { mallApi, type CardSecretDetailResult, type CardSecretListItem } from '@/api/mall'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const cards = ref<CardSecretListItem[]>([])
const detailVisible = ref(false)
const activeCard = ref<CardSecretDetailResult | null>(null)
const draftOrderFilter = ref('')

const orderFilter = computed(() => {
  return typeof route.query.order_no === 'string' ? route.query.order_no.trim() : ''
})

const pendingCount = computed(() => cards.value.filter((card) => card.status === 20).length)
const viewedCount = computed(() => cards.value.filter((card) => (card.reveal_count || 0) > 0).length)
const redeemedCount = computed(() => cards.value.filter((card) => card.status === 30).length)

function formatDate(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'
}

function statusText(status: number) {
  return ({ 20: 'Pending Redeem', 30: 'Redeemed' } as Record<number, string>)[status] || 'Unknown'
}

async function loadCards() {
  loading.value = true
  try {
    const result = await mallApi.getCards(orderFilter.value || undefined)
    cards.value = result.list || []
  } finally {
    loading.value = false
  }
}

function applyOrderFilter() {
  router.replace({
    path: '/cards',
    query: {
      ...route.query,
      order_no: draftOrderFilter.value || undefined,
    },
  })
}

function clearOrderFilter() {
  draftOrderFilter.value = ''
  router.replace({
    path: '/cards',
    query: {
      ...route.query,
      order_no: undefined,
    },
  })
}

async function refreshCards() {
  await loadCards()
}

async function handleReveal(card: CardSecretListItem) {
  activeCard.value = await mallApi.revealCard(card.id)
  detailVisible.value = true
  await loadCards()
}

async function handleRedeem(card: CardSecretListItem) {
  activeCard.value = await mallApi.redeemCard(card.id)
  detailVisible.value = true
  ElMessage.success(t('cards.markedRedeemed'))
  await loadCards()
}

async function copyValue(value?: string) {
  if (!value) return
  await navigator.clipboard.writeText(value)
  ElMessage.success(t('cards.copiedClipboard'))
}

async function copyAllSecrets(card: CardSecretDetailResult) {
  const lines = [
    card.secret.card_code ? `Card Code: ${card.secret.card_code}` : '',
    card.secret.card_password ? `Card Password: ${card.secret.card_password}` : '',
    card.secret.redeem_code ? `Redeem Code: ${card.secret.redeem_code}` : '',
    card.secret.extra_note ? `Note: ${card.secret.extra_note}` : '',
  ].filter(Boolean)
  await navigator.clipboard.writeText(lines.join('\n'))
  ElMessage.success(t('cards.copiedAll'))
}

watch(orderFilter, async (value) => {
  draftOrderFilter.value = value
  await loadCards()
}, { immediate: true })
</script>

<style scoped>
.cards-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 80px;
}

.page-header,
.privacy-banner,
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
}

.header-copy h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.header-copy p,
.privacy-banner p {
  margin: 8px 0 0;
  color: var(--text-secondary);
}

.header-actions,
.filter-actions,
.link-panel {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card span,
.secret-label,
.meta-grid span,
.support-box span {
  color: var(--text-secondary);
  font-size: 13px;
}

.stat-card strong {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.stat-card small,
.notes-box small {
  color: var(--text-muted);
}

.filter-bar {
  align-items: flex-end;
}

.filter-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-field input {
  height: 46px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  padding: 0 16px;
  color: var(--text-main);
  font-size: 14px;
}

.privacy-banner {
  align-items: flex-start;
}

.privacy-banner strong {
  font-size: 16px;
}

.filter-chip {
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  color: var(--primary-strong);
  font-size: 12px;
  font-weight: 700;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.card-item {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.card-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.card-title p {
  margin: 6px 0 0;
  color: var(--text-secondary);
}

.status-pill {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.status-20 {
  background: rgba(245, 158, 11, 0.14);
  color: #d97706;
}

.status-30 {
  background: rgba(16, 185, 129, 0.14);
  color: var(--primary-strong);
}

.card-secret-shell {
  padding: 16px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border);
  display: grid;
  gap: 10px;
}

.card-secret-shell code,
.secret-row code {
  display: inline-block;
  font-size: 15px;
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
  color: var(--text-main);
  word-break: break-all;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.meta-grid div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-grid strong,
.support-box strong {
  font-size: 14px;
  color: var(--text-main);
}

.notes-box {
  display: grid;
  gap: 8px;
}

.notes-box p {
  margin: 0;
  line-height: 1.7;
}

.card-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.primary-btn,
.ghost-btn,
.copy-btn,
.link-btn,
.close-btn {
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn,
.link-btn.primary-link {
  padding: 11px 18px;
  border-radius: 14px;
  background: var(--text-main);
  color: white;
  font-weight: 700;
}

.primary-btn:hover,
.link-btn.primary-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
}

.ghost-btn,
.link-btn,
.copy-btn {
  padding: 11px 16px;
  border-radius: 14px;
  background: var(--bg-glass);
  border: 1px solid var(--border);
  color: var(--text-main);
  font-weight: 600;
}

.ghost-btn:hover,
.link-btn:hover,
.copy-btn:hover {
  background: var(--bg-elevated);
}

.empty-state {
  grid-column: 1 / -1;
  padding: 72px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 14px;
}

.empty-state h3 {
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 800;
}

.empty-state p {
  margin: 0;
  color: var(--text-secondary);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.drawer-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.drawer-header p {
  margin: 6px 0 0;
  color: var(--text-secondary);
}

.close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-main);
  font-size: 16px;
}

.drawer-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drawer-status {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 13px;
}

.secret-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.secret-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border);
}

.secret-row div {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.secret-row span {
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.note-row p,
.info-panel p {
  margin: 0;
  line-height: 1.7;
}

.info-panel {
  padding: 18px;
  display: grid;
  gap: 10px;
}

.info-panel h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.info-panel small {
  color: var(--text-muted);
}

.support-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.14);
}

@media (max-width: 980px) {
  .stats-grid,
  .card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header,
  .privacy-banner,
  .filter-bar,
  .card-top,
  .secret-row {
    flex-direction: column;
    align-items: stretch;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
