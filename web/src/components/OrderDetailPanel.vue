<template>
  <div class="detail-panel-body">
    <div v-if="detailLoading" class="detail-loading">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="image" style="width: 100%; height: 140px; border-radius: 24px;" />
          <div style="margin-top: 20px; display: grid; gap: 14px;">
            <el-skeleton-item variant="p" style="width: 65%; height: 18px;" />
            <el-skeleton-item variant="p" style="width: 100%; height: 18px;" />
            <el-skeleton-item variant="p" style="width: 90%; height: 18px;" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="detailData" class="detail-stack">
      <section class="detail-hero">
        <div class="hero-main">
          <span class="hero-kicker">Current order</span>
          <h3>{{ statusText(detailData.order.status) }}</h3>
          <p>#{{ detailData.order.order_no }}</p>
        </div>
        <div class="hero-meta">
          <span>{{ formatDate(detailData.order.created_at) }}</span>
          <span v-if="detailData.order.paid_at">Paid {{ formatDate(detailData.order.paid_at) }}</span>
        </div>
      </section>

      <section class="detail-block summary-block glass-panel">
        <div class="summary-grid">
          <div class="summary-cell">
            <span>Items</span>
            <strong>{{ detailData.items.length }}</strong>
          </div>
          <div class="summary-cell">
            <span>Amount</span>
            <strong>CNY {{ Number(detailData.order.pay_amount).toFixed(2) }}</strong>
          </div>
          <div class="summary-cell">
            <span>Delivery</span>
            <strong>{{ detailData.deliveries.length ? 'Ready' : 'Pending' }}</strong>
          </div>
        </div>
        <p v-if="detailData.order.points_amount" class="summary-hint">
          Includes {{ detailData.order.points_amount }} points in this order.
        </p>
      </section>

      <section class="detail-block glass-panel">
        <div class="block-head">
          <div>
            <span class="block-kicker">Purchased assets</span>
            <h4 class="box-title">Line items</h4>
          </div>
          <span class="block-badge">{{ detailData.items.length }} items</span>
        </div>
        <div class="items-list">
          <div v-for="item in detailData.items" :key="item.id" class="d-item-row">
            <div class="d-item-info">
              <strong>{{ item.product_name }}</strong>
              <span>{{ item.sku_title }} x {{ item.quantity }}</span>
            </div>
            <div class="d-item-price">
              <strong>CNY {{ Number(item.total_amount).toFixed(2) }}</strong>
              <span v-if="item.points_price">{{ item.points_price }} Pts</span>
            </div>
          </div>
        </div>
        <div class="d-total-row">
          <span>Total paid</span>
          <strong>CNY {{ Number(detailData.order.pay_amount).toFixed(2) }}</strong>
        </div>
      </section>

      <section class="detail-block glass-panel delivery-box">
        <div class="block-head">
          <div>
            <span class="block-kicker">Delivery content</span>
            <h4 class="box-title">Fulfillment records</h4>
          </div>
          <span class="block-badge">{{ detailData.deliveries.length }}</span>
        </div>
        <div v-if="detailData.deliveries.length" class="delivery-records">
          <div v-for="record in detailData.deliveries" :key="record.id" class="d-record-card">
            <pre>{{ record.content }}</pre>
          </div>
        </div>
        <div v-else class="empty-delivery">
          {{ $t('orders.deliveryPending') }}
        </div>
      </section>

      <section v-if="detailData.cards?.length" class="detail-block glass-panel">
        <div class="cards-header">
          <div>
            <span class="block-kicker">Card delivery</span>
            <h4 class="box-title">{{ $t('cards.pageTitle') }}</h4>
            <p class="cards-desc">{{ $t('cards.orderEntryDesc') }}</p>
          </div>
          <button class="glass-btn" @click="$emit('open-cards', detailData.order.order_no)">{{ $t('cards.openCenter') }}</button>
        </div>
        <div class="cards-list">
          <div v-for="card in detailData.cards" :key="card.id" class="card-summary">
            <div>
              <strong>{{ card.product_name }}</strong>
              <span>{{ card.masked_summary }}</span>
            </div>
            <div class="card-side">
              <span class="status-badge" :class="`status-${card.status}`">{{ cardStatusText(card.status) }}</span>
              <small>{{ card.profile_name || card.sku_title }}</small>
            </div>
          </div>
        </div>
      </section>

      <div v-if="detailData.order.status === 10" class="action-wrap">
        <button class="primary-btn w-full" @click="$emit('pay', detailData.order.order_no)">
          Pay CNY {{ Number(detailData.order.pay_amount).toFixed(2) }} now
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">OD</div>
      <h3>Select an order</h3>
      <p>Choose any order on the left to keep its details visible while you browse the list.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

defineProps<{
  detailData: any | null
  detailLoading: boolean
}>()

defineEmits<{
  (e: 'open-cards', orderNo: string): void
  (e: 'pay', orderNo: string): void
}>()

function statusText(status: number) {
  return ({ 10: 'Pending pay', 20: 'Paid', 30: 'Canceled', 40: 'Closed', 50: 'Completed' } as Record<number, string>)[status] || 'Unknown'
}

function cardStatusText(status: number) {
  return ({ 20: 'Pending redeem', 30: 'Redeemed' } as Record<number, string>)[status] || 'Card ready'
}

function formatDate(value?: string) {
  return value ? dayjs(value).format('MMM D, YYYY  |  HH:mm') : '-'
}
</script>

<style scoped>
.detail-panel-body {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.detail-loading {
  padding: 8px;
}

.detail-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-hero {
  padding: 24px;
  border-radius: 28px;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.16), rgba(15, 23, 42, 0.06));
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: 0 18px 40px -26px rgba(4, 120, 87, 0.5);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hero-kicker,
.block-kicker {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary-strong);
}

.hero-main h3 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-main);
}

.hero-main p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 13px;
}

.detail-block {
  padding: 20px;
  border-radius: 24px;
}

.summary-block {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(240, 253, 250, 0.9));
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.summary-cell {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-cell span {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.summary-cell strong {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main);
}

.summary-hint {
  margin: 14px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.block-head,
.cards-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.box-title {
  margin: 6px 0 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main);
}

.block-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(15, 23, 42, 0.05);
  color: var(--text-secondary);
}

.items-list,
.delivery-records,
.cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.d-item-row,
.card-summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}

.d-item-row:last-child,
.card-summary:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.d-item-info,
.card-summary > div:first-child,
.card-side {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.d-item-info strong,
.card-summary strong {
  font-size: 14px;
  font-weight: 700;
}

.d-item-info span,
.card-summary span,
.card-side small,
.cards-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

.d-item-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.d-item-price strong,
.d-total-row strong {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main);
}

.d-item-price span {
  font-size: 12px;
  color: var(--text-muted);
}

.d-total-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.d-total-row span {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.delivery-box {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.88), rgba(255, 255, 255, 0.88));
}

.d-record-card {
  padding: 16px;
  border-radius: 18px;
  background: var(--bg-card);
  border: 1px solid var(--border);
}

.d-record-card pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Consolas, monospace;
  font-size: 13px;
  line-height: 1.65;
  color: var(--text-main);
}

.glass-btn,
.primary-btn {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.glass-btn {
  background: var(--bg-glass);
  color: var(--text-main);
}

.glass-btn:hover,
.primary-btn:hover {
  transform: translateY(-1px);
}

.primary-btn {
  border: none;
  background: var(--text-main);
  color: #fff;
}

.action-wrap {
  position: sticky;
  bottom: 0;
  padding-top: 4px;
}

.w-full {
  width: 100%;
  height: 50px;
  box-shadow: 0 16px 28px -18px rgba(17, 24, 39, 0.55);
}

.empty-state {
  min-height: 340px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 14px;
  padding: 28px;
  color: var(--text-secondary);
}

.empty-icon {
  width: 64px;
  height: 64px;
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
  font-size: 22px;
  color: var(--text-main);
}

.empty-state p,
.empty-delivery {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
}

@media (max-width: 768px) {
  .detail-hero,
  .detail-block {
    padding: 18px;
    border-radius: 22px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .block-head,
  .cards-header,
  .card-summary,
  .d-item-row {
    flex-direction: column;
  }

  .d-item-price,
  .card-side {
    align-items: flex-start;
  }
}

</style>


