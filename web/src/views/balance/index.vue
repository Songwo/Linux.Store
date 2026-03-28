<template>
  <section class="wallet-page fade-in-up">
    <!-- Header Section -->
    <div class="wallet-hero glass-panel">
      <div class="hero-content">
        <h1 class="page-title">{{ $t('balance.pageTitle') }}</h1>
        <p class="page-desc">{{ $t('balance.currentBalance') }}</p>
        
        <div class="main-balance" v-if="summary">
          <span class="currency">¥</span>
          <span class="amount">{{ Number(summary.balance || 0).toFixed(2) }}</span>
        </div>
        <div class="main-balance-meta" v-if="summary">
          <span>{{ $t('balance.currentBalance') }}</span>
          <div class="trend-badge is-positive">
            <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            +{{ ((Number(summary.total_income) / (Number(summary.total_expense)||1))*10).toFixed(1) }}% vs Last Month
          </div>
        </div>
      </div>
      
      <!-- Mock Chart Background -->
      <div class="hero-chart">
        <div class="bar" style="height: 30%"></div>
        <div class="bar" style="height: 50%"></div>
        <div class="bar" style="height: 40%"></div>
        <div class="bar" style="height: 70%"></div>
        <div class="bar" style="height: 60%"></div>
        <div class="bar" style="height: 90%"></div>
        <div class="bar" style="height: 85%"></div>
        <div class="bar highlight" style="height: 100%"></div>
      </div>
    </div>

    <!-- Summary Grid -->
    <div class="summary-blocks" v-if="summary">
      <div class="block-card glass-panel hover-float">
        <div class="block-icon bg-blue">💎</div>
        <div class="block-text">
          <span class="label">{{ $t('profile.points') }}</span>
          <strong class="value">{{ summary.points }} Pts</strong>
        </div>
      </div>
      <div class="block-card glass-panel hover-float">
        <div class="block-icon bg-green">📥</div>
        <div class="block-text">
          <span class="label">{{ $t('balance.totalIncome') }}</span>
          <strong class="value">¥{{ Number(summary.total_income).toFixed(2) }}</strong>
        </div>
      </div>
      <div class="block-card glass-panel hover-float">
        <div class="block-icon bg-orange">📤</div>
        <div class="block-text">
          <span class="label">{{ $t('balance.totalExpense') }}</span>
          <strong class="value">¥{{ Number(summary.total_expense).toFixed(2) }}</strong>
        </div>
      </div>
      <div class="block-card glass-panel hover-float">
        <div class="block-icon bg-purple">✨</div>
        <div class="block-text">
          <span class="label">{{ $t('balance.signReward') }}</span>
          <strong class="value">{{ summary.sign_reward_total }} / {{ summary.sign_days }} Days</strong>
        </div>
      </div>
    </div>

    <!-- Transaction Timeline -->
    <div class="transactions-section glass-panel">
      <div class="section-header">
        <h2 class="title">{{ $t('balance.txHistory') }}</h2>
        <div class="filters">
          <el-select v-model="flowType" @change="loadFlows" class="glass-select">
            <el-option :label="$t('balance.allFlows')" value="all" />
            <el-option :label="$t('balance.incomeOnly')" value="income" />
            <el-option :label="$t('balance.expenseOnly')" value="expense" />
          </el-select>
          <el-input v-model="bizType" placeholder="Filter by source (e.g. sign)" clearable @change="loadFlows" class="glass-input">
            <template #prefix><span style="padding-left:10px">🔍</span></template>
          </el-input>
          <el-button @click="loadData" class="refresh-btn">⟳</el-button>
        </div>
      </div>

      <div class="timeline" v-loading="loading">
        <div v-if="!flows?.list?.length" class="empty-timeline">
          <div class="empty-icon">📝</div>
          <p>No transactions found for this period.</p>
        </div>
        
        <article v-for="(item, idx) in flows?.list" :key="idx" class="timeline-item">
          <div class="timeline-track">
            <div class="track-dot" :class="{ 'is-income': item.direction === 1, 'is-expense': item.direction === 2 }"></div>
            <div class="track-line" v-if="idx !== flows.list.length - 1"></div>
          </div>
          
          <div class="timeline-content hover-float">
            <div class="content-left">
              <div class="tx-icon" :class="getIconClass(item.biz_type)">
                {{ getIcon(item.biz_type) }}
              </div>
              <div class="tx-meta">
                <strong class="tx-title">{{ item.biz_type.toUpperCase() }}</strong>
                <span class="tx-desc">{{ item.description || item.remark || (item.direction === 1 ? 'Received' : 'Spent') }}</span>
              </div>
            </div>
            
            <div class="content-right">
              <strong class="tx-amount" :class="{ 'text-green': item.direction === 1 }">
                {{ item.direction === 1 ? '+' : '-' }}
                <template v-if="item.type === 'balance'">¥{{ Number(item.amount).toFixed(2) }}</template>
                <template v-else>{{ item.points }} Pts</template>
              </strong>
              <span class="tx-time">{{ formatDate(item.created_at) }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { mallApi, type WalletSummary } from '@/api/mall'

const loading = ref(false)
const summary = ref<WalletSummary | null>(null)
const flows = ref<{ list: any[]; total: number }>({ list: [], total: 0 })
const flowType = ref('all')
const bizType = ref('')

function formatDate(dateStr: string) {
  return dayjs(dateStr).format('MMM D, YYYY · HH:mm')
}

function getIcon(bizType: string) {
  if (bizType.includes('sign')) return '📅'
  if (bizType.includes('pay') || bizType.includes('order')) return '🛍️'
  if (bizType.includes('refund')) return '↩️'
  return '💸'
}

function getIconClass(bizType: string) {
  if (bizType.includes('sign')) return 'bg-purple'
  if (bizType.includes('pay') || bizType.includes('order')) return 'bg-orange'
  if (bizType.includes('refund')) return 'bg-blue'
  return 'bg-green'
}

async function loadFlows() {
  loading.value = true
  try {
    const result = await mallApi.getWalletFlows({
      type: flowType.value,
      biz_type: bizType.value,
      page: 1,
      page_size: 50,
    })
    flows.value = result || { list: [], total: 0 }
  } finally {
    loading.value = false
  }
}

async function loadData() {
  summary.value = await mallApi.getWalletSummary()
  await loadFlows()
}

onMounted(loadData)
</script>

<style scoped>
.wallet-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 80px;
}

/* HERO */
.wallet-hero {
  position: relative;
  overflow: hidden;
  padding: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.page-desc {
  margin: 0;
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 24px;
}

.main-balance {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.main-balance .currency {
  font-size: 32px;
  color: var(--text-muted);
  font-weight: 600;
}
.main-balance .amount {
  font-size: 72px;
  font-weight: 800;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.04em;
  line-height: 1;
  background: linear-gradient(135deg, var(--text-main), var(--text-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.main-balance-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
}
.trend-badge.is-positive {
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-strong);
}
.trend-badge .w-4 { width: 14px; height: 14px; }

.hero-chart {
  position: absolute;
  right: 48px;
  bottom: 0;
  height: 160px;
  width: 300px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  z-index: 1;
}
.hero-chart .bar {
  flex: 1;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px 8px 0 0;
  transition: all 1s ease-out;
}
.hero-chart .bar.highlight {
  background: linear-gradient(180deg, var(--primary), rgba(16,185,129,0.2));
  box-shadow: 0 0 20px rgba(16,185,129,0.3);
}

/* BLOCKS */
.summary-blocks {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.block-card {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.block-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 24px;
}

.bg-blue { background: rgba(59, 130, 246, 0.1); }
.bg-green { background: rgba(16, 185, 129, 0.1); }
.bg-orange { background: rgba(245, 158, 11, 0.1); }
.bg-purple { background: rgba(139, 92, 246, 0.1); }

.block-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.block-text .label {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.block-text .value {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-main);
}

/* TIMELINE */
.transactions-section {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 24px;
}

.section-header .title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.filters {
  display: flex;
  align-items: center;
  gap: 16px;
}

.glass-select, .glass-input {
  width: 180px;
}

.timeline {
  display: flex;
  flex-direction: column;
}

.empty-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--text-muted);
}
.empty-icon { font-size: 48px; opacity: 0.5; }

.timeline-item {
  display: flex;
  gap: 24px;
}

.timeline-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
}

.track-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 24px;
  background: var(--text-muted);
  box-shadow: 0 0 0 4px var(--bg-page);
  position: relative;
  z-index: 2;
}
.track-dot.is-income { background: var(--primary); }
.track-dot.is-expense { background: var(--text-main); }

.track-line {
  flex: 1;
  width: 2px;
  background: var(--border);
  margin-top: -8px;
  margin-bottom: -24px;
  z-index: 1;
}

.timeline-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 16px;
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 16px;
  transition: transform 0.2s, background 0.2s;
}

.timeline-content:hover {
  background: var(--bg-elevated);
}

.content-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.tx-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 20px;
}

.tx-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tx-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.tx-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.content-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.tx-amount {
  font-size: 18px;
  font-family: 'Inter', monospace;
  font-weight: 700;
}
.text-green { color: var(--primary-strong); }

.tx-time {
  font-size: 13px;
  color: var(--text-muted);
}

@media (max-width: 1024px) {
  .wallet-hero { flex-direction: column; align-items: flex-start; gap: 40px; }
  .hero-chart { position: relative; right: 0; width: 100%; height: 120px; }
  .summary-blocks { grid-template-columns: repeat(2, 1fr); }
  .section-header { flex-direction: column; align-items: flex-start; gap: 20px; }
  .filters { flex-wrap: wrap; }
}
@media (max-width: 640px) {
  .summary-blocks { grid-template-columns: 1fr; }
  .timeline-content { flex-direction: column; align-items: flex-start; gap: 16px; }
  .content-right { align-items: flex-start; }
}
</style>
