<template>
  <section class="dashboard-grid fade-in-up">
    <!-- Highlight Dashboard Title -->
    <div class="dash-hero admin-panel">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h2>System Overview</h2>
        <p>Real-time metrics for DevStore operations, sales, and user activity.</p>
      </div>
    </div>

    <!-- Data Bento -->
    <div class="stats-bento">
      <article v-for="item in stats" :key="item.label" class="admin-panel stat-card hover-float">
        <div class="stat-meta">
          <span class="stat-label">{{ item.label }}</span>
          <div class="stat-icon">{{ item.icon }}</div>
        </div>
        <strong class="stat-value">{{ item.value }}</strong>
        <div class="stat-sub">
          <span class="trend-up">↗</span>
          <small>{{ item.desc }}</small>
        </div>
      </article>
    </div>

    <!-- Live Activity Timeline -->
    <div class="activity-section admin-panel">
      <!-- Glow effect -->
      <div class="top-glow"></div>
      
      <div class="section-head">
        <h3>Live Event Stream</h3>
        <span class="pulse-indicator"><span class="dot"></span> Online</span>
      </div>
      
      <div class="timeline-list">
        <div v-for="(act, idx) in activities" :key="idx" class="timeline-item">
          <div class="time-col">{{ act.time.split(' ')[1] }}</div>
          <div class="track-col">
            <div class="track-dot"></div>
            <div class="track-line" v-if="idx !== activities.length - 1"></div>
          </div>
          <div class="content-col">
            <span class="module-chip">{{ act.module }}</span>
            <span class="event-text">{{ act.event }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import http from '@/api/http'

const summary = ref({
  user_count: 0,
  order_count: 0,
  gmv: 0,
  campaign_count: 0,
  today_paid_count: 0,
  pending_pay_count: 0,
  seckill_order_count: 0,
})

const stats = computed(() => [
  { label: 'Total Users', value: String(summary.value.user_count), desc: 'Includes Linux.do OAuth', icon: '👥' },
  { label: 'Total Orders', value: String(summary.value.order_count), desc: `Paid today: ${summary.value.today_paid_count}`, icon: '📦' },
  { label: 'Gross Volume', value: `￥${Number(summary.value.gmv).toFixed(2)}`, desc: `Pending: ${summary.value.pending_pay_count}`, icon: '💳' },
  { label: 'Campaigns', value: String(summary.value.campaign_count), desc: `Seckill orders: ${summary.value.seckill_order_count}`, icon: '🎯' },
])

interface ActivityItem {
  module: string
  event: string
  time: string
}

const activities = ref<ActivityItem[]>([])

function buildActivities(data: typeof summary.value) {
  const now = new Date()
  const fmt = (d: Date) => d.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  const list: ActivityItem[] = []
  if (data.today_paid_count > 0) {
    list.push({ module: 'Orders', event: `今日已支付订单 ${data.today_paid_count} 笔`, time: fmt(now) })
  }
  if (data.pending_pay_count > 0) {
    list.push({ module: 'Orders', event: `待支付订单 ${data.pending_pay_count} 笔，等待用户付款`, time: fmt(now) })
  }
  if (data.seckill_order_count > 0) {
    list.push({ module: 'Seckill', event: `秒杀订单累计 ${data.seckill_order_count} 笔`, time: fmt(now) })
  }
  if (data.campaign_count > 0) {
    list.push({ module: 'Campaign', event: `活动总数 ${data.campaign_count} 个，秒杀系统运行中`, time: fmt(now) })
  }
  list.push({ module: 'Users', event: `注册用户总量 ${data.user_count} 人`, time: fmt(now) })
  activities.value = list
}

async function loadDashboard() {
  const res = await http.get('/admin/dashboard')
  summary.value = res.data
  buildActivities(res.data)
}

onMounted(loadDashboard)
</script>

<style scoped>
.dashboard-grid { 
  display: flex; flex-direction: column; gap: 24px; 
}

/* HERO */
.dash-hero {
  position: relative; overflow: hidden;
  padding: 40px; 
}
.hero-bg {
  position: absolute; top: -50%; right: -10%;
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 60%);
  border-radius: 50%; filter: blur(40px);
}
.hero-content { position: relative; z-index: 1; }
.hero-content h2 { font-size: 28px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.02em; }
.hero-content p { color: var(--admin-text-secondary); margin: 0; font-size: 15px; }

/* BENTO */
.stats-bento { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.stat-card { 
  display: flex; flex-direction: column; gap: 16px; 
  padding: 24px; transition: transform 0.2s, border-color 0.2s;
  cursor: default;
}
.hover-float:hover { transform: translateY(-4px); }

.stat-meta { display: flex; justify-content: space-between; align-items: center; }
.stat-label { color: var(--admin-text-secondary); font-size: 13px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
.stat-icon { width: 32px; height: 32px; background: rgba(255,255,255,0.05); border-radius: 8px; display: grid; place-items: center; font-size: 14px; }

.stat-value { font-size: 36px; font-weight: 800; letter-spacing: -0.02em; line-height: 1; }
.stat-sub { display: flex; align-items: center; gap: 6px; }
.trend-up { color: var(--admin-accent); font-weight: 800; font-size: 12px; }
.stat-sub small { color: var(--admin-text-muted); font-size: 13px; font-weight: 500; }

/* TIMELINE */
.activity-section {
  position: relative; overflow: hidden; padding: 32px;
}
.top-glow {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 40%; height: 1px; box-shadow: 0 0 20px 4px var(--admin-accent);
  opacity: 0.3;
}
.section-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 32px;
}
.section-head h3 { font-size: 20px; font-weight: 700; }
.pulse-indicator {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: var(--admin-accent);
}
.pulse-indicator .dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--admin-accent);
  box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.7);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(20, 184, 166, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(20, 184, 166, 0); }
}

.timeline-list { display: flex; flex-direction: column; }
.timeline-item { display: flex; gap: 24px; min-height: 60px; }
.time-col { 
  width: 48px; font-family: monospace; font-size: 13px; color: var(--admin-text-muted); 
  padding-top: 2px; text-align: right;
}
.track-col { display: flex; flex-direction: column; align-items: center; width: 16px; }
.track-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--admin-text-secondary); box-shadow: 0 0 0 4px var(--admin-bg); z-index: 2; margin-top: 4px; }
.track-line { flex: 1; width: 2px; background: var(--admin-border); margin-top: -6px; margin-bottom: -10px; z-index: 1; }

.content-col { padding-bottom: 24px; display: flex; align-items: flex-start; gap: 12px; flex: 1; }
.module-chip {
  padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,0.05); border: 1px solid var(--admin-border);
  font-size: 12px; font-weight: 600; color: var(--admin-text-main);
}
.event-text { font-size: 14px; color: var(--admin-text-secondary); line-height: 1.6; padding-top: 2px; }

@media (max-width: 1024px) { 
  .stats-bento { grid-template-columns: repeat(2, 1fr); } 
}
@media (max-width: 640px) { 
  .stats-bento { grid-template-columns: 1fr; } 
  .timeline-item { gap: 12px; }
}
</style>
