<template>
  <section class="dashboard-page fade-in-up">
    <!-- Top Bento Grid -->
    <div class="bento-top" v-if="center">
      
      <!-- 1. User Identity -->
      <div class="bento-item glass-panel identity-card hover-float">
        <div class="avatar-glow"></div>
        <div class="avatar">
          <img v-if="center.user.avatar" :src="center.user.avatar" class="avatar-img" />
          <span v-else>{{ center.user.nickname.slice(0, 1).toUpperCase() }}</span>
        </div>
        <div class="user-meta">
          <h1 class="user-name">{{ center.user.nickname }}</h1>
          <div class="user-sub">
            <span class="uid">UID: {{ center.user.id }}</span>
            <span v-if="center.user.email" class="email">{{ center.user.email }}</span>
          </div>
        </div>
        <div class="badges">
          <span class="card-chip">{{ center.stats.sign_days }} {{ $t('sign.days') }}</span>
          <span class="card-chip is-ghost">Level 1</span>
        </div>
      </div>

      <!-- 2. Wallet Overview -->
      <div class="bento-item glass-panel wallet-card hover-float">
        <div class="wallet-header">
          <h2 class="bento-title">{{ $t('profile.balance') }}</h2>
          <RouterLink to="/balance" class="view-all">{{ $t('common.details') }} &rarr;</RouterLink>
        </div>
        <div class="balance-display">
          <div class="currency">¥</div>
          <div class="amount">{{ Number(center.wallet.balance).toFixed(2) }}</div>
        </div>
        <div class="secondary-balances">
          <div class="sec-balance">
            <span>{{ $t('profile.points') }}</span>
            <strong>{{ center.wallet.points }}</strong>
          </div>
          <div class="sec-balance">
            <span>{{ $t('profile.totalSpend') }}</span>
            <strong>¥{{ Number(center.stats.total_spend).toFixed(2) }}</strong>
          </div>
        </div>
      </div>

      <!-- 3. Quick Actions -->
      <div class="bento-item glass-panel actions-card hover-float">
        <h2 class="bento-title">{{ $t('common.actions') || 'Quick Actions' }}</h2>
        <div class="grid-actions">
          <RouterLink to="/sign" class="action-btn">
            <span class="icon">📅</span>
            <span>{{ $t('sign.pageTitle') }}</span>
          </RouterLink>
          <RouterLink to="/products" class="action-btn">
            <span class="icon">🛍️</span>
            <span>{{ $t('nav.products') }}</span>
          </RouterLink>
          <RouterLink to="/wishlist" class="action-btn">
            <span class="icon">❤️</span>
            <span>{{ $t('wishlist.pageTitle') }}</span>
          </RouterLink>
          <RouterLink to="/orders" class="action-btn">
            <span class="icon">📦</span>
            <span>{{ $t('nav.orders') }}</span>
          </RouterLink>
          <RouterLink to="/cards" class="action-btn">
            <span class="icon">🔐</span>
            <span>{{ $t('nav.cards') }}</span>
          </RouterLink>
          <RouterLink to="/coupons" class="action-btn">
            <span class="icon">🎟️</span>
            <span>{{ $t('coupons.pageTitle') || 'Coupons' }}</span>
          </RouterLink>
        </div>
      </div>

      <!-- 4. Linked Accounts -->
      <div class="bento-item glass-panel linked-card hover-float">
        <h2 class="bento-title">Linked Accounts</h2>
        <div class="linked-list">
          <div class="linked-item">
            <div class="linked-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="provider-icon"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
              <span>Linux.do</span>
            </div>
            <div class="linked-action">
              <span v-if="hasLinuxDo" class="bound-status">
                <span class="status-dot"></span> {{ linuxDoUsername }}
              </span>
              <button v-else class="bind-btn" @click="handleLinuxDoBind">Bind Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Lists -->
    <div class="bento-bottom" v-if="center">
      
      <!-- Recent Orders -->
      <div class="bento-item glass-panel list-card">
        <div class="bento-header">
          <h2 class="bento-title">{{ $t('profile.recentOrders') }}</h2>
          <RouterLink to="/orders" class="view-all">{{ $t('common.all') }}</RouterLink>
        </div>
        <div v-if="center.recent_orders.length" class="list-wrapper">
          <article v-for="item in center.recent_orders" :key="item.order_no" class="list-row hover-row">
            <div class="row-main">
              <strong>Order #{{ item.order_no.slice(-8) }}</strong>
              <span class="row-time">{{ formatDate(item.created_at) }}</span>
            </div>
            <div class="row-side">
              <strong class="row-amount">¥{{ Number(item.pay_amount).toFixed(2) }}</strong>
              <span class="status-badge">{{ statusText(item.status) }}</span>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">{{ $t('orders.noOrders') }}</div>
      </div>

      <!-- Recent Transactions -->
      <div class="bento-item glass-panel list-card">
        <div class="bento-header">
          <h2 class="bento-title">Recent Transactions</h2>
          <RouterLink to="/balance" class="view-all">All</RouterLink>
        </div>
        <div v-if="center.recent_flows.length" class="list-wrapper">
          <article v-for="item in center.recent_flows" :key="`${item.type}-${item.created_at}-${item.biz_type}`" class="list-row hover-row">
            <div class="row-main">
              <strong>{{ item.biz_type }}</strong>
              <span class="row-time">{{ formatDate(item.created_at) }}</span>
            </div>
            <div class="row-side">
              <strong class="row-amount" :class="{'is-plus': Number(item.amount) > 0 || Number(item.points) > 0}">
                <span v-if="item.type === 'balance'">¥{{ Number(item.amount).toFixed(2) }}</span>
                <span v-else>{{ item.points }} Pts</span>
              </strong>
              <span class="remark">{{ item.remark || item.type }}</span>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">No recent transactions</div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import dayjs from 'dayjs'
import { mallApi, type UserCenterData } from '@/api/mall'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
const center = ref<UserCenterData | null>(null)

const hasLinuxDo = computed(() => {
  return center.value?.oauth_bindings?.some(b => b.provider === 'linux_do') || false
})

const linuxDoUsername = computed(() => {
  const b = center.value?.oauth_bindings?.find(b => b.provider === 'linux_do')
  return b ? b.provider_username : ''
})

async function handleLinuxDoBind() {
  try {
    const res = await mallApi.getOauthAuthorizeUrl('linux-do')
    window.location.href = res.authorize_url
  } catch(e) {
    console.error(e)
  }
}


function formatDate(value?: string) {
  return value ? dayjs(value).format('MM-DD HH:mm') : '-'
}

function statusText(status: number) {
  return ({ 10: 'Pending', 20: 'Paid', 30: 'Canceled', 40: 'Closed', 50: 'Done' } as Record<number, string>)[status] || 'Unknown'
}

onMounted(async () => {
  const [centerData] = await Promise.all([
    mallApi.getUserCenter(),
    app.refreshUserAssets().catch(() => undefined),
  ])
  center.value = centerData
})
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 80px;
}

.bento-top {
  display: grid;
  grid-template-columns: 320px 1fr 340px;
  gap: 24px;
}

.bento-item {
  padding: 32px;
  display: flex;
  flex-direction: column;
}

.bento-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
}
.bento-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}
.view-all {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
  transition: color 0.2s;
}
.view-all:hover { color: var(--text-main); }

/* Identity Card */
.identity-card {
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  gap: 16px;
}
.avatar-glow {
  position: absolute;
  top: -40px; left: 50%;
  transform: translateX(-50%);
  width: 160px; height: 160px;
  background: radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 60%);
  filter: blur(20px);
  z-index: 0;
}
.avatar {
  position: relative;
  z-index: 1;
  width: 80px; height: 80px;
  border-radius: 20px;
  background: var(--text-main);
  color: white;
  display: grid; place-items: center;
  font-size: 32px; font-weight: 800;
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  margin-bottom: 8px;
  overflow: hidden;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.user-name { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
.user-sub { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.uid { color: var(--text-muted); font-size: 13px; font-weight: 500; font-family: monospace; }
.email { color: var(--text-secondary); font-size: 13px; font-weight: 500; }
.badges { display: flex; gap: 8px; margin-top: 8px; position: relative; z-index: 1; }

/* Wallet Card */
.wallet-card {
  gap: 24px;
}
.wallet-header {
  display: flex; justify-content: space-between; align-items: flex-end;
}
.balance-display {
  display: flex; align-items: baseline; gap: 8px;
}
.currency { font-size: 24px; color: var(--text-muted); font-weight: 500; }
.amount { font-size: 64px; font-family: 'Inter', sans-serif; font-weight: 800; letter-spacing: -0.04em; line-height: 1; color: var(--text-main); }
.secondary-balances {
  display: flex; gap: 32px;
  margin-top: auto;
  border-top: 1px solid var(--border);
  padding-top: 24px;
}
.sec-balance { display: flex; flex-direction: column; gap: 4px; }
.sec-balance span { font-size: 13px; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; letter-spacing: 0.05em; }
.sec-balance strong { font-size: 20px; font-weight: 700; color: var(--text-main); }

/* Actions Card */
.grid-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: auto;
}
.action-btn {
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  transition: all 0.2s;
  color: var(--text-main);
  font-weight: 600;
  font-size: 14px;
}
.action-btn:hover {
  background: var(--bg-elevated);
  border-color: rgba(0,0,0,0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.04);
}
.action-btn .icon { font-size: 24px; }

/* Linked Accounts Card */
.linked-card {
  grid-column: 1 / -1;
  gap: 16px;
}
.linked-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.linked-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.linked-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: var(--text-main);
  font-size: 15px;
}
.provider-icon { width: 20px; height: 20px; color: var(--text-secondary); }
.bound-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}
.status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--primary-strong);
}
.bind-btn {
  background: var(--text-main);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.bind-btn:hover { background: #000; }

/* Bottom Grid */
.bento-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.list-wrapper {
  display: flex; flex-direction: column;
}
.list-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
  transition: background 0.2s;
}
.list-row:last-child { border-bottom: none; }
.hover-row:hover {
  background: var(--bg-glass);
  padding-left: 8px; padding-right: 8px;
  margin-left: -8px; margin-right: -8px;
  border-radius: 8px;
}
.row-main, .row-side { display: flex; flex-direction: column; gap: 4px; }
.row-side { align-items: flex-end; }
.row-main strong { font-size: 15px; font-weight: 600; color: var(--text-main); }
.row-time, .remark { font-size: 13px; color: var(--text-muted); }
.row-amount { font-size: 16px; font-family: monospace; font-weight: 600; }
.is-plus { color: var(--primary-strong); }
.status-badge {
  font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 999px;
  background: rgba(0,0,0,0.04); color: var(--text-secondary);
}

.empty-state { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; }

@media (max-width: 1024px) {
  .bento-top { grid-template-columns: 1fr; }
  .bento-bottom { grid-template-columns: 1fr; }
  .identity-card { flex-direction: row; text-align: left; align-items: center; justify-content: flex-start; }
  .avatar-glow { top: 50%; left: 0; transform: translateY(-50%); }
  .identity-card .avatar { margin: 0; }
  .identity-card .badges { justify-content: flex-start; }
}
</style>

