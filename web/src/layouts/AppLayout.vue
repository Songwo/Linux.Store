<template>
  <div class="app-layout">
    <!-- Immersive Header -->
    <header :class="['site-header', { 'is-scrolled': isScrolled }]">
      <div class="header-inner">
        <!-- Logo -->
        <RouterLink to="/" class="brand">
          <div class="brand-mark">DS</div>
          <span class="brand-name">DevStore</span>
        </RouterLink>

        <!-- Centered Nav (Suspended) -->
        <nav class="main-nav">
          <RouterLink to="/">{{ $t('nav.explore') }}</RouterLink>
          <RouterLink to="/products">{{ $t('nav.products') }}</RouterLink>
          <RouterLink to="/seckill">{{ $t('seckill.pageTitle') || 'Seckill' }}</RouterLink>
          <RouterLink to="/coupons">{{ $t('coupons.pageTitle') || 'Coupons' }}</RouterLink>
          <RouterLink to="/balance">{{ $t('nav.wallet') }}</RouterLink>
        </nav>

        <!-- Right Actions -->
        <div class="header-actions">
          <button class="icon-btn locale-toggle" @click="switchLocale" :title="locale === 'zh-CN' ? 'Switch to English' : '切换中文'">
            <span class="locale-label">{{ locale === 'zh-CN' ? 'EN' : '中' }}</span>
          </button>
          <button class="icon-btn theme-toggle" @click="app.toggleTheme()" :title="app.theme === 'light' ? 'Dark Mode' : 'Light Mode'">
            <svg v-if="app.theme === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </button>
          
          <RouterLink to="/cart" class="icon-btn cart-btn">
            <el-badge :value="cart.count" :hidden="cart.count === 0" :max="99" class="cart-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </el-badge>
          </RouterLink>
          
          <template v-if="auth.isLoggedIn">
            <div class="balance-pill">
              <span class="currency">¥</span>
              <span class="value">{{ walletBalance }}</span>
            </div>
            <el-dropdown>
              <button class="user-trigger" type="button">
                <div class="avatar">
                  <img v-if="auth.profile?.avatar" :src="auth.profile.avatar" class="avatar-img" />
                  <span v-else>{{ nicknameInitial }}</span>
                </div>
              </button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/profile')">{{ $t('nav.dashboard') }}</el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/orders')">{{ $t('nav.orders') }}</el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/cards')">{{ $t('nav.cards') }}</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">{{ $t('nav.logOut') }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <RouterLink v-else to="/login">
            <el-button type="primary" size="small">{{ $t('nav.signIn') }}</el-button>
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="page-content">
      <router-view />
    </main>

    <!-- Mobile Bottom Nav -->
    <nav class="mobile-nav" v-if="auth.isLoggedIn || true">
      <RouterLink to="/" class="mobile-nav-item" :class="{ active: $route.path === '/' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>首页</span>
      </RouterLink>
      <RouterLink to="/products" class="mobile-nav-item" :class="{ active: $route.path.startsWith('/products') }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        <span>商品</span>
      </RouterLink>
      <RouterLink to="/seckill" class="mobile-nav-item" :class="{ active: $route.path === '/seckill' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span>秒杀</span>
      </RouterLink>
      <RouterLink to="/cart" class="mobile-nav-item cart-nav" :class="{ active: $route.path === '/cart' }">
        <el-badge :value="cart.count" :hidden="cart.count === 0" :max="99">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </el-badge>
        <span>购物车</span>
      </RouterLink>
      <RouterLink v-if="auth.isLoggedIn" to="/profile" class="mobile-nav-item" :class="{ active: $route.path === '/profile' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>我的</span>
      </RouterLink>
      <RouterLink v-else to="/login" class="mobile-nav-item" :class="{ active: $route.path === '/login' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        <span>登录</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toggleLocale, currentLocale } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const auth = useAuthStore()
const app = useAppStore()
const cart = useCartStore()
const { t } = useI18n()
const locale = ref(currentLocale())

function switchLocale() {
  toggleLocale()
  locale.value = currentLocale()
}

const isScrolled = ref(false)

const walletBalance = computed(() => Number(app.wallet?.balance || auth.profile?.balance || 0).toFixed(2))
const nicknameInitial = computed(() => (auth.profile?.nickname || 'D').slice(0, 1).toUpperCase())

async function bootstrap() {
  if (auth.isLoggedIn) {
    await auth.fetchProfile().catch(() => undefined)
  }
  await app.initialize().catch(() => undefined)
  if (auth.isLoggedIn) {
    await cart.refresh().catch(() => undefined)
  }
}

function handleLogout() {
  auth.logout()
  app.refreshUserAssets().catch(() => undefined)
  router.push('/')
}

function onScroll() {
  isScrolled.value = window.scrollY > 20
}

watch(() => auth.token, async (token) => {
  if (token) {
    await auth.fetchProfile().catch(() => undefined)
    await app.refreshUserAssets().catch(() => undefined)
    return
  }
  app.refreshUserAssets().catch(() => undefined)
})

onMounted(() => {
  bootstrap()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 24px 0;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  justify-content: center;
}

.site-header.is-scrolled {
  padding: 12px 0;
}

.header-inner {
  width: min(1100px, calc(100% - 40px));
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.site-header.is-scrolled .header-inner {
  background: var(--bg-elevated);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border);
  box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 var(--border-glow);
  transform: scale(0.98);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--text-main);
  color: white;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.05em;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.main-nav {
  display: flex;
  gap: 8px;
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  padding: 4px;
  border-radius: 999px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.main-nav a {
  padding: 6px 16px;
  border-radius: 999px;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
}

.main-nav a:hover {
  color: var(--text-main);
  background: rgba(0,0,0,0.04);
}

.main-nav a.router-link-exact-active {
  background: var(--bg-page);
  color: var(--text-main);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-glass);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}
.locale-label {
  font-size: 12px; font-weight: 800; letter-spacing: 0.02em;
}

.icon-btn:hover {
  background: var(--bg-elevated);
  color: var(--text-main);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}
.icon-btn svg {
  width: 16px; height: 16px;
}

.balance-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  font-size: 14px;
  font-weight: 600;
}
.balance-pill .currency {
  color: var(--text-muted);
  font-size: 12px;
}

.user-trigger {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s;
}
.user-trigger:hover {
  transform: translateY(-1px);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #10b981, #047857);
  color: white;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-content {
  flex: 1;
  padding-top: 120px;
}

@media (max-width: 768px) {
  .site-header { padding: 12px 0; }
  .header-inner { width: calc(100% - 24px); padding: 8px 12px; }
  .main-nav { display: none; }
  .brand-name { display: none; }
  .page-content { padding-bottom: 72px; }
}

.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: var(--bg-elevated);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid var(--border);
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
  flex: 1;
}

.mobile-nav-item svg {
  width: 22px;
  height: 22px;
}

.mobile-nav-item.active {
  color: var(--text-main);
}

.mobile-nav-item:not(.active):hover {
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .mobile-nav {
    display: flex;
    justify-content: space-around;
  }
}
</style>

