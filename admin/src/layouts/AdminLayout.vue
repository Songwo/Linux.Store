<template>
  <div class="admin-layout">
    <aside class="sidebar admin-panel">
      <div class="logo-block">
        <div class="logo-mark">
          <svg viewBox="0 0 24 24" fill="none" class="w-6 h-6" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div class="logo-text">
          <div class="logo-title">DevStore</div>
          <div class="logo-sub">Operating Console</div>
        </div>
      </div>

      <nav class="menu-list">
        <RouterLink v-for="item in coreMenu" :key="item.path" :to="item.path" class="menu-link">
          <span class="icon-shell" :class="item.tone">
            <component :is="item.icon" class="icon-svg" />
          </span>
          <span class="link-label">{{ $t(item.labelKey) }}</span>
        </RouterLink>

        <div class="menu-divider"></div>
        <div class="menu-label">{{ $t('sidebar.operations') }}</div>

        <RouterLink v-for="item in opsMenu" :key="item.path" :to="item.path" class="menu-link">
          <span class="icon-shell" :class="item.tone">
            <component :is="item.icon" class="icon-svg" />
          </span>
          <span class="link-label">{{ $t(item.labelKey) }}</span>
        </RouterLink>

        <div class="menu-divider"></div>
        <div class="menu-label">{{ $t('sidebar.financials') }}</div>

        <RouterLink v-for="item in financeMenu" :key="item.path" :to="item.path" class="menu-link">
          <span class="icon-shell" :class="item.tone">
            <component :is="item.icon" class="icon-svg" />
          </span>
          <span class="link-label">{{ $t(item.labelKey) }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button class="locale-toggle-btn" @click="switchLocale">
          {{ locale === 'zh-CN' ? 'EN' : 'ZH' }}
        </button>
        <div class="version-tag">Admin v2.0</div>
      </div>
    </aside>

    <section class="main-area">
      <header class="topbar admin-panel">
        <div class="top-brand">
          <h1 class="top-title">{{ currentRouteName }}</h1>
        </div>

        <div class="top-actions">
          <div class="admin-user" @click="logout" title="Click to logout">
            <div class="admin-avatar">{{ admin.user?.nickname?.slice(0, 1)?.toUpperCase() || 'A' }}</div>
            <span class="admin-name">{{ admin.user?.nickname || 'Administrator' }}</span>
          </div>
        </div>
      </header>

      <main class="content-area fade-in-up">
        <router-view />
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed, markRaw, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Bell,
  Box,
  Coin,
  DataAnalysis,
  Discount,
  Document,
  Goods,
  Grid,
  Key,
  Promotion,
  Tickets,
  User,
  WalletFilled,
} from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/admin'
import { toggleLocale, currentLocale } from '@/i18n'

interface MenuItem {
  path: string
  labelKey: string
  title: string
  icon: Component
  tone: string
}

const coreMenu: MenuItem[] = [
  { path: '/', labelKey: 'sidebar.dashboard', title: 'Dashboard Overview', icon: markRaw(DataAnalysis), tone: 'tone-cyan' },
  { path: '/users', labelKey: 'sidebar.users', title: 'User Management', icon: markRaw(User), tone: 'tone-blue' },
  { path: '/products', labelKey: 'sidebar.products', title: 'Product Catalog', icon: markRaw(Goods), tone: 'tone-gold' },
  { path: '/categories', labelKey: 'sidebar.categories', title: 'Category Management', icon: markRaw(Grid), tone: 'tone-violet' },
  { path: '/inventory', labelKey: 'sidebar.inventory', title: 'Stock Control', icon: markRaw(Box), tone: 'tone-teal' },
  { path: '/card-secrets', labelKey: 'sidebar.cardSecrets', title: 'Card Secret Center', icon: markRaw(Key), tone: 'tone-amber' },
  { path: '/orders', labelKey: 'sidebar.orders', title: 'Order Processing', icon: markRaw(Tickets), tone: 'tone-coral' },
]

const opsMenu: MenuItem[] = [
  { path: '/announcements', labelKey: 'sidebar.messages', title: 'System Announcements', icon: markRaw(Bell), tone: 'tone-rose' },
  { path: '/campaigns', labelKey: 'sidebar.campaigns', title: 'Marketing Campaigns', icon: markRaw(Promotion), tone: 'tone-mint' },
  { path: '/coupons', labelKey: 'sidebar.coupons', title: 'Discount Coupons', icon: markRaw(Discount), tone: 'tone-orange' },
]

const financeMenu: MenuItem[] = [
  { path: '/balance-flows', labelKey: 'sidebar.balances', title: 'Financial Ledger', icon: markRaw(WalletFilled), tone: 'tone-emerald' },
  { path: '/points-flows', labelKey: 'sidebar.points', title: 'Points Ledger', icon: markRaw(Coin), tone: 'tone-amber' },
  { path: '/logs', labelKey: 'sidebar.logs', title: 'System Audit Logs', icon: markRaw(Document), tone: 'tone-slate' },
]

const routeTitleMap = Object.fromEntries([...coreMenu, ...opsMenu, ...financeMenu].map((item) => [item.path, item.title]))

const router = useRouter()
const route = useRoute()
const admin = useAdminStore()
const locale = ref(currentLocale())

function switchLocale() {
  toggleLocale()
  locale.value = currentLocale()
}

const currentRouteName = computed(() => routeTitleMap[route.path] || 'Operating Console')

function logout() {
  admin.clear()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  background: var(--admin-bg);
}

.sidebar {
  position: fixed;
  top: 24px;
  bottom: 24px;
  left: 24px;
  width: 280px;
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
  z-index: 100;
}

.logo-block {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
}

.logo-mark {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--admin-text-main), var(--admin-text-muted));
  display: grid;
  place-items: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.02em;
  color: white;
  line-height: 1.1;
}

.logo-sub {
  font-size: 12px;
  color: var(--admin-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
}

.menu-label {
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--admin-text-muted);
  letter-spacing: 0.08em;
  padding: 12px 14px 4px;
}

.menu-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--admin-border-highlight), transparent);
  margin: 10px 0 6px;
}

.menu-list a {
  color: var(--admin-text-secondary);
  padding: 11px 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.menu-list a::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent 58%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.menu-list a:hover {
  color: var(--admin-text-main);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  transform: translateX(2px);
}

.menu-list a:hover::before,
.menu-list a.router-link-exact-active::before {
  opacity: 1;
}

.menu-list a.router-link-exact-active {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 8px 20px rgba(0, 0, 0, 0.22);
}

.link-label,
.icon-shell {
  position: relative;
  z-index: 1;
}

.icon-shell {
  width: 38px;
  min-width: 38px;
  height: 38px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 8px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.menu-list a:hover .icon-shell,
.menu-list a.router-link-exact-active .icon-shell {
  transform: translateY(-1px) scale(1.02);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 10px 22px rgba(0, 0, 0, 0.24);
}

.icon-svg {
  width: 18px;
  height: 18px;
}

.tone-cyan { color: #8be9fd; background: linear-gradient(135deg, rgba(34, 211, 238, 0.22), rgba(14, 116, 144, 0.08)); }
.tone-blue { color: #93c5fd; background: linear-gradient(135deg, rgba(59, 130, 246, 0.24), rgba(30, 41, 59, 0.08)); }
.tone-gold { color: #fcd34d; background: linear-gradient(135deg, rgba(245, 158, 11, 0.24), rgba(120, 53, 15, 0.08)); }
.tone-violet { color: #c4b5fd; background: linear-gradient(135deg, rgba(139, 92, 246, 0.24), rgba(76, 29, 149, 0.08)); }
.tone-teal { color: #5eead4; background: linear-gradient(135deg, rgba(20, 184, 166, 0.24), rgba(17, 94, 89, 0.08)); }
.tone-coral { color: #fda4af; background: linear-gradient(135deg, rgba(244, 63, 94, 0.24), rgba(136, 19, 55, 0.08)); }
.tone-rose { color: #f9a8d4; background: linear-gradient(135deg, rgba(236, 72, 153, 0.24), rgba(131, 24, 67, 0.08)); }
.tone-mint { color: #86efac; background: linear-gradient(135deg, rgba(34, 197, 94, 0.24), rgba(20, 83, 45, 0.08)); }
.tone-orange { color: #fdba74; background: linear-gradient(135deg, rgba(249, 115, 22, 0.24), rgba(124, 45, 18, 0.08)); }
.tone-emerald { color: #6ee7b7; background: linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(6, 78, 59, 0.08)); }
.tone-amber { color: #fcd34d; background: linear-gradient(135deg, rgba(251, 191, 36, 0.24), rgba(120, 53, 15, 0.08)); }
.tone-slate { color: #cbd5e1; background: linear-gradient(135deg, rgba(100, 116, 139, 0.24), rgba(30, 41, 59, 0.08)); }

.sidebar-footer {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid var(--admin-border);
}

.locale-toggle-btn {
  background: var(--admin-panel-hover);
  border: 1px solid var(--admin-border);
  color: var(--admin-text-main);
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.02em;
}

.locale-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--admin-border-highlight);
}

.version-tag {
  font-size: 12px;
  color: var(--admin-text-muted);
  font-family: monospace;
}

.main-area {
  flex: 1;
  margin-left: 328px;
  padding: 24px 24px 24px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100vh;
}

.topbar {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 24px;
  z-index: 90;
}

.top-brand {
  display: flex;
  flex-direction: column;
}

.top-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: white;
  letter-spacing: -0.01em;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 16px 6px 6px;
  border-radius: 999px;
  background: var(--admin-bg-secondary);
  border: 1px solid var(--admin-border);
  transition: all 0.2s;
}

.admin-user:hover {
  background: var(--admin-panel-hover);
  border-color: var(--admin-border-highlight);
}

.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  color: black;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 14px;
}

.admin-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--admin-text-main);
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 1024px) {
  .admin-layout { flex-direction: column; }
  .sidebar { position: relative; width: auto; top: 0; left: 0; bottom: 0; margin: 16px; padding: 20px; }
  .main-area { margin-left: 0; padding: 0 16px 16px 16px; }
  .topbar { position: relative; top: 0; }
  .menu-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .menu-label, .menu-divider { display: none; }
}

@media (max-width: 640px) {
  .menu-list { grid-template-columns: 1fr; }
}
</style>



