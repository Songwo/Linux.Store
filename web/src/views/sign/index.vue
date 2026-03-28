<template>
  <section class="sign-page fade-in-up">
    <!-- Hero / Action Area -->
    <div class="sign-hero glass-panel">
      <div class="hero-bg-glow"></div>
      
      <div class="hero-content">
        <div class="title-block">
          <span class="hero-kicker">{{ $t('sign.pageTitle') }}</span>
          <h1 class="page-title">{{ $t('sign.pageTitle') }}</h1>
          <p class="page-desc">{{ $t('sign.todayReward') }}</p>
        </div>

        <button 
          class="checkin-btn hover-float" 
          :class="{ 'is-disabled': status?.today_signed }"
          :disabled="status?.today_signed" 
          @click="doSign"
        >
          <span v-if="status?.today_signed">{{ $t('sign.alreadySigned') }}</span>
          <span v-else>{{ $t('sign.signNow') }}</span>
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="stats-row" v-if="status">
        <div class="stat-item">
          <span class="label">{{ $t('sign.streak') }}</span>
          <strong>{{ status.streak_days }} <small>{{ $t('sign.days') }}</small></strong>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="label">{{ $t('sign.todayReward') }}</span>
          <strong>+{{ status.today_reward }} <small>Pts</small></strong>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="label">{{ $t('balance.signReward') }}</span>
          <strong>+{{ status.reward_balance }} <small>CNY</small></strong>
        </div>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="workspace-grid">
      <!-- Calendar Board -->
      <div class="calendar-board glass-panel">
        <div class="board-header">
          <h2>{{ currentMonth }}</h2>
          <div class="legend">
            <span class="dot done"></span> Signed
            <span class="dot missed"></span> Missed
          </div>
        </div>

        <div class="calendar-grid">
          <div class="weekday" v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d">{{ d }}</div>
          
          <!-- Empty slots for alignment -->
          <div v-for="empty in padStartDays" :key="'e'+empty" class="cell empty-cell"></div>
          
          <div 
            v-for="day in calendarDays" 
            :key="day.date" 
            class="calendar-cell"
            :class="{ 
              'is-signed': day.signed, 
              'is-today': day.isToday,
              'in-future': day.isFuture
            }"
          >
            <span class="day-num">{{ day.day }}</span>
            <div class="reward-pill" v-if="day.reward">+{{ day.reward }}</div>
          </div>
        </div>
      </div>

      <!-- Rules & Info -->
      <div class="rules-board glass-panel">
        <div class="rules-icon">📜</div>
        <h3>Reward Mechanics</h3>
        <ul class="rules-list">
          <li><strong>Base Reward:</strong> Earn 10 points daily.</li>
          <li><strong>3-Day Streak:</strong> Multiplier activates! Earn 20 points.</li>
          <li><strong>7-Day Streak+:</strong> Max tier reached! Earn 50 points daily.</li>
          <li><strong>Auto-sync:</strong> Rewards are pushed instantly to your wallet balance and points ledger.</li>
        </ul>
        
        <div class="streak-visual">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <div class="progress-markers">
            <span>Day 1</span>
            <span :class="{'active': (status?.streak_days||0) >= 3}">Day 3 (x2)</span>
            <span :class="{'active': (status?.streak_days||0) >= 7}">Day 7 (x5)</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { mallApi, type SignStatus } from '@/api/mall'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const app = useAppStore()
const auth = useAuthStore()
const status = ref<SignStatus | null>(null)
const history = ref<any[]>([])

const currentMonth = computed(() => dayjs().format('MMMM YYYY'))
const padStartDays = computed(() => dayjs().startOf('month').day())

const progressPercent = computed(() => {
  const streak = status.value?.streak_days || 0
  if (streak >= 7) return 100
  return (streak / 7) * 100
})

const calendarDays = computed(() => {
  const base = dayjs()
  const start = base.startOf('month')
  const total = base.daysInMonth()
  const signedMap = new Map(history.value.map((item) => [item.sign_date, item.reward_points]))
  
  return Array.from({ length: total }, (_, index) => {
    const current = start.add(index, 'day')
    const key = current.format('YYYY-MM-DD')
    
    return {
      date: key,
      day: current.date(),
      signed: signedMap.has(key),
      reward: signedMap.get(key) || 0,
      isToday: key === dayjs().format('YYYY-MM-DD'),
      isFuture: current.isAfter(dayjs(), 'day')
    }
  })
})

async function loadData() {
  const month = dayjs().format('YYYY-MM')
  try {
    const [statusResult, historyResult] = await Promise.all([
      mallApi.getSignStatus(), 
      mallApi.getSignHistory(month)
    ])
    status.value = statusResult
    history.value = historyResult.list
  } catch(e) { /* silent fail */ }
}

async function doSign() {
  if (status.value?.today_signed) return
  await mallApi.signIn()
  await Promise.all([
    loadData(), 
    auth.fetchProfile().catch(() => undefined), 
    app.refreshUserAssets().catch(() => undefined)
  ])
  ElMessage({ message: 'Check-in successful! Rewards synced.', type: 'success', customClass: 'premium-toast' })
}

onMounted(loadData)
</script>

<style scoped>
.sign-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 80px;
}

/* HERO AREA */
.sign-hero {
  position: relative;
  overflow: hidden;
  padding: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 40px;
}

.hero-bg-glow {
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
  filter: blur(60px);
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.title-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.hero-kicker {
  padding: 6px 16px;
  background: rgba(245, 158, 11, 0.1);
  color: var(--accent);
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.page-title {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
}

.page-desc {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  max-width: 480px;
}

.checkin-btn {
  background: linear-gradient(135deg, var(--text-main), #374151);
  color: white;
  border: none;
  border-radius: 999px;
  padding: 18px 48px;
  font-size: 18px;
  font-weight: 700;
  box-shadow: 0 12px 32px rgba(0,0,0,0.2);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.checkin-btn.is-disabled {
  background: rgba(0,0,0,0.05);
  color: var(--text-muted);
  box-shadow: none;
  cursor: not-allowed;
}

/* STATS ROW */
.stats-row {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 24px 48px;
  background: rgba(255,255,255,0.6);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: 0 8px 32px rgba(0,0,0,0.04);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-item .label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  font-weight: 600;
}

.stat-item strong {
  font-size: 28px;
  font-weight: 800;
  font-family: 'Inter', sans-serif;
  color: var(--text-main);
  line-height: 1;
}

.stat-item small {
  font-size: 14px;
  opacity: 0.6;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border);
}

/* WORKSPACE GRID */
.workspace-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
}

/* CALENDAR */
.calendar-board {
  padding: 32px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.board-header h2 {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.legend {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
.dot.done { background: var(--primary); }
.dot.missed { background: rgba(0,0,0,0.1); }

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: var(--text-muted);
  padding-bottom: 12px;
}

.calendar-cell {
  aspect-ratio: 1/1;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: rgba(255,255,255,0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s;
}

.empty-cell { background: transparent; border: none; }

.day-num {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
}

.reward-pill {
  position: absolute;
  bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: var(--accent);
  padding: 2px 8px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

/* Cell States */
.is-signed {
  background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(4,120,87,0.05));
  border-color: rgba(16,185,129,0.3);
}
.is-signed .day-num { color: var(--primary-strong); }

.is-today {
  border-color: var(--text-main);
  box-shadow: inset 0 0 0 1px var(--text-main);
}

.in-future {
  opacity: 0.5;
  background: transparent;
}

/* RULES BOARD */
.rules-board {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rules-icon {
  font-size: 40px;
  background: rgba(0,0,0,0.03);
  width: 72px; height: 72px;
  display: grid; place-items: center;
  border-radius: 20px;
}

.rules-board h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.rules-list {
  padding-left: 20px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  display: flex; flex-direction: column; gap: 8px;
}
.rules-list strong { color: var(--text-main); }

.streak-visual {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.progress-bar {
  height: 8px;
  background: rgba(0,0,0,0.05);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  transition: width 1s ease-out;
}

.progress-markers {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}
.progress-markers .active { color: var(--primary-strong); }

@media (max-width: 1024px) {
  .workspace-grid { grid-template-columns: 1fr; }
  .stats-row { flex-direction: column; gap: 16px; padding: 24px; }
  .stat-divider { width: 40px; height: 1px; }
  .calendar-board, .rules-board { padding: 20px; }
}
@media (max-width: 640px) {
  .page-title { font-size: 36px; }
  .checkin-btn { width: 100%; }
}
</style>
<style>
/* Premium Element Plus Toast Override */
.premium-toast {
  background: rgba(255,255,255,0.85) !important;
  backdrop-filter: blur(12px) !important;
  color: var(--text-main) !important;
  border: 1px solid rgba(0,0,0,0.1) !important;
  box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important;
  border-radius: 16px !important;
}
</style>
