<template>
  <section class="points-page fade-in-up">
    <!-- Header -->
    <div class="page-header glass-panel">
      <div class="header-text">
        <h1 class="page-title">{{ $t('points.pageTitle') }}</h1>
        <p class="page-desc">{{ $t('points.pageDesc') }}</p>
      </div>
    </div>

    <!-- Points Display -->
    <div class="points-hero glass-panel">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <span class="hero-label">{{ $t('points.currentPoints') }}</span>
        <div class="hero-value">{{ currentPoints }}</div>
      </div>
    </div>

    <!-- Flow History -->
    <div class="flow-section glass-panel">
      <h2 class="section-title">{{ $t('points.flowHistory') }}</h2>
      <div v-if="flows.length" class="flow-list">
        <div v-for="(flow, idx) in flows" :key="idx" class="flow-item">
          <div class="flow-icon" :class="flow.direction > 0 ? 'income' : 'expense'">
            {{ flow.direction > 0 ? '+' : '-' }}
          </div>
          <div class="flow-info">
            <strong>{{ flow.description || flow.biz_type }}</strong>
            <span class="flow-time">{{ flow.created_at }}</span>
          </div>
          <div class="flow-amount" :class="flow.direction > 0 ? 'income' : 'expense'">
            {{ flow.direction > 0 ? '+' : '-' }}{{ flow.points }}
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>{{ $t('common.empty') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { mallApi, type WalletFlowItem } from '@/api/mall'

const currentPoints = ref(0)
const flows = ref<WalletFlowItem[]>([])

async function loadPoints() {
  try {
    const wallet = await mallApi.getWalletSummary()
    currentPoints.value = wallet.points
  } catch {
    // fallback
  }
}

async function loadFlows() {
  try {
    const result = await mallApi.getWalletFlows({ type: 'points', page: 1, page_size: 20 })
    flows.value = result.list
  } catch {
    // fallback
  }
}

onMounted(async () => {
  await loadPoints()
  await loadFlows()
})
</script>

<style scoped>
.points-page { display: flex; flex-direction: column; gap: 32px; padding-bottom: 80px; }

.page-header { padding: 32px 40px; }
.page-title { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
.page-desc { margin: 8px 0 0; color: var(--text-secondary); font-size: 15px; }

.points-hero {
  position: relative; overflow: hidden; padding: 48px 40px;
  text-align: center;
}
.hero-glow {
  position: absolute; top: -60%; left: 50%; transform: translateX(-50%);
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%);
  border-radius: 50%; filter: blur(40px);
}
.hero-content { position: relative; z-index: 1; }
.hero-label { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); }
.hero-value { font-size: 64px; font-weight: 800; letter-spacing: -0.04em; margin-top: 8px; line-height: 1; }

.flow-section { padding: 32px 40px; }
.section-title { margin: 0 0 24px; font-size: 20px; font-weight: 800; letter-spacing: -0.01em; }

.flow-list { display: flex; flex-direction: column; }
.flow-item {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 0; border-bottom: 1px solid var(--border);
}
.flow-item:last-child { border-bottom: none; }

.flow-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: grid; place-items: center; font-weight: 800; font-size: 18px;
}
.flow-icon.income { background: rgba(16, 185, 129, 0.1); color: var(--primary-strong); }
.flow-icon.expense { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.flow-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.flow-info strong { font-size: 15px; font-weight: 600; }
.flow-time { font-size: 13px; color: var(--text-muted); }

.flow-amount { font-size: 18px; font-weight: 800; }
.flow-amount.income { color: var(--primary-strong); }
.flow-amount.expense { color: #ef4444; }

.empty-state { text-align: center; padding: 40px; color: var(--text-muted); }

@media (max-width: 768px) {
  .page-header, .points-hero, .flow-section { padding: 24px; }
  .hero-value { font-size: 48px; }
}
</style>
