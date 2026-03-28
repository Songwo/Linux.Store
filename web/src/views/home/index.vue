<template>
  <div class="page-shell home-page fade-in-up">
    <NoticeBar :announcements="app.announcements" />

    <section class="hero-section">
      <div class="hero-orb orb-left"></div>
      <div class="hero-orb orb-right"></div>
      <div class="hero-grid"></div>

      <div class="hero-content">
        <div class="hero-copy">
          <span class="hero-kicker">{{ $t('home.kicker') }}</span>
          <h1 class="hero-title">
            {{ $t('home.heroTitle1') }}
            <span>{{ $t('home.heroTitle2') }}</span>
            {{ $t('home.heroTitle3') }}
          </h1>
          <p class="hero-subtitle">{{ $t('home.heroDesc') }}</p>
          <div class="hero-actions">
            <RouterLink to="/products" class="hero-btn hero-btn-primary">{{ $t('home.browseCatalog') }}</RouterLink>
            <RouterLink to="/seckill" class="hero-btn hero-btn-secondary">{{ $t('home.openSeckill') }}</RouterLink>
          </div>
          <div class="hero-signals">
            <span v-for="signal in heroSignals" :key="signal">{{ signal }}</span>
          </div>
        </div>

        <div class="hero-stage">
          <article class="stage-card stage-primary glass-panel hover-float">
            <div class="stage-badges">
              <span class="card-chip">{{ heroProduct.type === 'points' ? $t('home.pointsType') : $t('home.featuredType') }}</span>
              <span class="card-chip is-ghost">{{ $t('home.stockLabel', { n: heroProduct.stock }) }}</span>
            </div>
            <div class="stage-visual">
              <div class="stage-ring"></div>
              <div class="stage-shape"></div>
              <div class="stage-price">
                <strong>{{ formatPrice(heroProduct.price, heroProduct.points_price) }}</strong>
                <span v-if="heroProduct.origin_price > heroProduct.price">{{ formatPrice(heroProduct.origin_price, 0) }}</span>
              </div>
            </div>
            <div class="stage-body">
              <div>
                <h3>{{ heroProduct.name }}</h3>
                <p>{{ heroProduct.subtitle || $t('home.lowLatencyDesc') }}</p>
              </div>
              <div class="stage-meta">
                <span>{{ $t('home.soldLabel', { n: heroProduct.sales_count }) }}</span>
                <span>{{ $t('home.viewsLabel', { n: heroProduct.view_count }) }}</span>
                <span>{{ heroProduct.category_name || $t('home.digitalGoods') }}</span>
              </div>
            </div>
          </article>

          <article class="stage-card stage-secondary glass-panel">
            <div class="mini-head">
              <span class="mini-kicker">{{ $t('home.walletSync') }}</span>
              <strong>{{ auth.isLoggedIn ? $t('home.signedIn') : $t('home.guestMode') }}</strong>
            </div>
            <div class="mini-value">{{ auth.isLoggedIn ? `CNY ${Number(app.wallet?.balance || 0).toFixed(2)}` : $t('home.rewardsReady') }}</div>
            <p>
              {{ auth.isLoggedIn ? $t('home.walletInfo', { p: app.wallet?.points || 0, s: app.signStatus?.streak_days || 0 }) : $t('home.walletSignInHint') }}
            </p>
          </article>

          <article v-if="spotlightSeckill" class="stage-card stage-floating glass-panel">
            <div class="mini-head">
              <span class="mini-kicker">{{ $t('home.seckillSpotlight') }}</span>
              <strong>{{ seckillStatus(spotlightSeckill) }}</strong>
            </div>
            <div class="mini-value">CNY {{ Number(spotlightSeckill.seckill_price || 0).toFixed(2) }}</div>
            <p>{{ spotlightSeckill.product_name }}</p>
            <div class="mini-progress">
              <span>{{ $t('home.progress') }}</span>
              <strong>{{ seckillProgress(spotlightSeckill) }}%</strong>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="metrics-band">
      <article v-for="stat in overviewStats" :key="stat.label" class="metric-card glass-panel hover-float">
        <span class="metric-label">{{ stat.label }}</span>
        <strong class="metric-value">{{ stat.value }}</strong>
        <p>{{ stat.note }}</p>
      </article>
    </section>

    <section class="feature-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">{{ $t('home.whyFasterTitle') }}</span>
          <h2 class="section-title">{{ $t('home.whyFasterHeading') }}</h2>
        </div>
        <p class="section-subtitle">{{ $t('home.whyFasterDesc') }}</p>
      </div>

      <div class="feature-grid">
        <article v-for="feature in featureCards" :key="feature.title" class="feature-card glass-panel hover-float">
          <span class="feature-index">{{ feature.index }}</span>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
          <small>{{ feature.meta }}</small>
        </article>
      </div>
    </section>

    <section v-if="spotlightSeckill" class="seckill-section glass-panel">
      <div class="section-heading compact">
        <div>
          <span class="section-kicker">{{ $t('seckill.pageTitle') }}</span>
          <h2 class="section-title">{{ $t('home.flashSaleTitle') }}</h2>
        </div>
        <RouterLink to="/seckill" class="inline-link">{{ $t('home.seeAllCampaigns') }}</RouterLink>
      </div>

      <div class="seckill-layout">
        <article class="seckill-spotlight">
          <div class="spotlight-top">
            <div>
              <span class="section-kicker">{{ seckillStatus(spotlightSeckill) }}</span>
              <h3>{{ spotlightSeckill.product_name }}</h3>
            </div>
            <span class="spotlight-badge">SKU {{ spotlightSeckill.sku_id }}</span>
          </div>
          <div class="spotlight-price-row">
            <strong>CNY {{ Number(spotlightSeckill.seckill_price || 0).toFixed(2) }}</strong>
            <span>{{ spotlightSeckill.campaign_name }}</span>
          </div>
          <div class="spotlight-progress">
            <div class="progress-meta">
              <span>Available {{ Number(spotlightSeckill.available_stock || 0) }}/{{ Number(spotlightSeckill.stock || 0) }}</span>
              <span>{{ seckillProgress(spotlightSeckill) }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar" :style="{ width: `${seckillProgress(spotlightSeckill)}%` }"></div>
            </div>
          </div>
          <p class="spotlight-desc">
            Requests enter the Redis guarded seckill flow, then move through RabbitMQ consumers for smoother order creation.
          </p>
        </article>

        <div class="seckill-list">
          <article v-for="item in secondarySeckill" :key="`${item.seckill_campaign_id}-${item.sku_id}`" class="seckill-mini">
            <div>
              <strong>{{ item.product_name }}</strong>
              <p>{{ item.campaign_name }}</p>
            </div>
            <div class="seckill-mini-side">
              <span>{{ seckillStatus(item) }}</span>
              <strong>CNY {{ Number(item.seckill_price || 0).toFixed(2) }}</strong>
            </div>
          </article>
          <div class="seckill-note">
            <span>{{ $t('home.queueInsight') }}</span>
            <p>{{ $t('home.queueInsightDesc', { n: seckillGoods.length }) }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="benefit-section">
      <div class="section-heading compact">
        <div>
          <span class="section-kicker">{{ $t('home.userAssetsKicker') }}</span>
          <h2 class="section-title">{{ $t('home.userAssetsTitle') }}</h2>
        </div>
      </div>

      <div class="benefit-grid">
        <RouterLink v-for="card in benefitCards" :key="card.title" :to="card.to" class="benefit-card glass-panel hover-float">
          <span class="benefit-kicker">{{ card.kicker }}</span>
          <h3>{{ card.title }}</h3>
          <p>{{ card.desc }}</p>
          <div class="benefit-meta">
            <strong>{{ card.value }}</strong>
            <span>{{ card.linkLabel }}</span>
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="capability-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">{{ $t('home.archSurfaceKicker') }}</span>
          <h2 class="section-title">{{ $t('home.archSurfaceTitle') }}</h2>
        </div>
        <p class="section-subtitle">{{ $t('home.archSurfaceDesc') }}</p>
      </div>

      <div class="capability-grid">
        <article v-for="cap in capabilityCards" :key="cap.title" class="capability-card glass-panel hover-float">
          <div class="capability-top">
            <span class="capability-tag">{{ cap.tag }}</span>
            <strong>{{ cap.title }}</strong>
          </div>
          <p>{{ cap.desc }}</p>
          <small>{{ cap.footnote }}</small>
        </article>
      </div>
    </section>

    <section class="catalog-section">
      <div class="catalog-header">
        <div class="catalog-header-top">
          <div>
            <span class="section-kicker">{{ $t('home.catalogKicker') }}</span>
            <h2 class="section-title">{{ $t('home.catalogHeading') }}</h2>
            <p class="section-subtitle">{{ $t('home.catalogSubtitle') }}</p>
          </div>
          <el-input v-model="keyword" class="search-input" clearable :placeholder="$t('common.search')">
            <template #prefix><span class="search-prefix">/#</span></template>
          </el-input>
        </div>
        <div class="glass-tabs category-tabs">
          <button class="tab-btn" :class="{ active: categoryId === '0' }" @click="setCategory('0')">{{ $t('products.allCategories') }}</button>
          <button v-for="cat in app.categories" :key="cat.id" class="tab-btn" :class="{ active: categoryId === String(cat.id) }" @click="setCategory(String(cat.id))">
            {{ cat.name }}
          </button>
        </div>
      </div>

      <div class="filter-bar">
        <div class="sort-tabs">
          <button v-for="opt in sortOptions" :key="opt.key" :class="['sort-btn', { active: activeSort === opt.key }]" @click="changeSort(opt.key)">
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="product-grid">
        <div v-for="i in 6" :key="i" class="skeleton-item glass-panel">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="image" style="width: 100%; height: 260px;" />
              <div style="padding: 20px;">
                <el-skeleton-item variant="h3" style="width: 60%;" />
                <el-skeleton-item variant="text" style="width: 100%; margin-top: 12px;" />
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>

      <div v-else-if="products.length" class="product-grid stagger-grid">
        <ProductCard v-for="item in products" :key="item.id" :item="item" />
      </div>

      <div v-else class="empty-state glass-panel">
        <h3>No products found</h3>
        <p>Try adjusting your filters or search query.</p>
      </div>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="prev, pager, next"
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          @current-change="handlePageChange"
        />
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ProductCard from '@/components/ProductCard.vue'
import NoticeBar from '@/components/NoticeBar.vue'
import { mallApi, type ProductItem, type SeckillItem } from '@/api/mall'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const app = useAppStore()
const auth = useAuthStore()
const loading = ref(false)
const products = ref<ProductItem[]>([])
const seckillGoods = ref<SeckillItem[]>([])
const keyword = ref('')
const categoryId = ref('0')
const activeSort = ref('default')
const pagination = ref({ page: 1, pageSize: 9, total: 0 })

const sortOptions = computed(() => [
  { key: 'default', label: t('products.featured') },
  { key: 'stock', label: t('products.inStock') },
  { key: 'sales', label: t('products.popular') },
  { key: 'priceAsc', label: t('products.priceLow') },
  { key: 'priceDesc', label: t('products.priceHigh') },
])

const heroSignals = computed(() => ['Redis catalog cache', 'MQ seckill queue', 'Wallet + points sync', 'Faster order detail view'])

const heroProduct = computed<ProductItem>(() => {
  return products.value.find((item) => item.is_recommend) || products.value[0] || {
    id: 0,
    category_id: 0,
    category_name: 'Starter bundle',
    default_sku_id: 0,
    name: 'Developer starter kit',
    subtitle: 'A polished entry point for digital goods, activities, and reward flows.',
    type: 'normal',
    cover: '',
    price: 199,
    origin_price: 299,
    points_price: 0,
    stock: 32,
    status: 1,
    is_hot: 1,
    is_recommend: 1,
    sales_count: 218,
    view_count: 1880,
  }
})

const spotlightSeckill = computed(() => seckillGoods.value[0] || null)
const secondarySeckill = computed(() => seckillGoods.value.slice(1, 4))

const summary = computed(() => ({
  total: pagination.value.total,
  stock: products.value.reduce((sum, item) => sum + Number(item.stock || 0), 0),
  sales: products.value.reduce((sum, item) => sum + Number(item.sales_count || 0), 0),
}))

const overviewStats = computed(() => [
  {
    label: t('home.overviewProducts'),
    value: String(summary.value.total),
    note: t('home.overviewProductsNote'),
  },
  {
    label: t('home.overviewCategories'),
    value: String(app.categories.length),
    note: t('home.overviewCategoriesNote'),
  },
  {
    label: t('home.overviewSeckill'),
    value: String(seckillGoods.value.length),
    note: t('home.overviewSeckillNote'),
  },
  {
    label: t('home.overviewCoupons'),
    value: String(app.announcements.length),
    note: t('home.overviewCouponsNote'),
  },
])

const featureCards = computed(() => [
  {
    index: t('home.feat1Index'),
    title: t('home.feat1Title'),
    desc: t('home.feat1Desc'),
    meta: t('home.feat1Meta'),
  },
  {
    index: t('home.feat2Index'),
    title: t('home.feat2Title'),
    desc: t('home.feat2Desc'),
    meta: t('home.feat2Meta'),
  },
  {
    index: t('home.feat3Index'),
    title: t('home.feat3Title'),
    desc: t('home.feat3Desc'),
    meta: t('home.feat3Meta'),
  },
  {
    index: t('home.feat4Index'),
    title: t('home.feat4Title'),
    desc: t('home.feat4Desc'),
    meta: t('home.feat4Meta'),
  },
])

const benefitCards = computed(() => [
  {
    kicker: t('home.benefitWalletKicker'),
    title: auth.isLoggedIn ? t('home.benefitWalletTitle') : t('home.benefitWalletTitle'),
    desc: auth.isLoggedIn
      ? t('home.benefitWalletDesc')
      : t('home.benefitWalletDesc'),
    value: auth.isLoggedIn ? `CNY ${Number(app.wallet?.balance || 0).toFixed(2)}` : t('home.benefitWalletLink'),
    linkLabel: auth.isLoggedIn ? `Points ${app.wallet?.points || 0}` : t('home.benefitWalletLink'),
    to: auth.isLoggedIn ? '/balance' : '/login',
  },
  {
    kicker: t('home.benefitSignKicker'),
    title: auth.isLoggedIn ? t('home.benefitSignTitleLoggedIn') : t('home.benefitSignTitle'),
    desc: auth.isLoggedIn
      ? t('home.benefitSignDesc')
      : t('home.benefitSignDescGuest'),
    value: auth.isLoggedIn ? t('home.benefitSignValue', { n: app.signStatus?.streak_days || 0 }) : t('home.benefitSignValueGuest'),
    linkLabel: auth.isLoggedIn ? t('home.benefitSignLink', { n: app.signStatus?.today_reward || 0 }) : t('home.benefitSignLinkGuest'),
    to: '/sign',
  },
  {
    kicker: t('home.benefitCouponKicker'),
    title: t('home.benefitCouponTitle'),
    desc: t('home.benefitCouponDesc'),
    value: t('home.benefitCouponValue', { n: app.announcements.length }),
    linkLabel: t('home.benefitCouponLink'),
    to: '/coupons',
  },
])

const capabilityCards = computed(() => [
  {
    tag: t('home.capCatalogTag'),
    title: t('home.capCatalogTitle'),
    desc: t('home.capCatalogDesc'),
    footnote: t('home.capCatalogNote'),
  },
  {
    tag: t('home.capSeckillTag'),
    title: t('home.capSeckillTitle'),
    desc: t('home.capSeckillDesc'),
    footnote: t('home.capSeckillNote'),
  },
  {
    tag: t('home.capOrderTag'),
    title: t('home.capOrderTitle'),
    desc: t('home.capOrderDesc'),
    footnote: t('home.capOrderNote'),
  },
  {
    tag: t('home.capAssetTag'),
    title: t('home.capAssetTitle'),
    desc: t('home.capAssetDesc'),
    footnote: t('home.capAssetNote'),
  },
])

let keywordTimer: number | undefined
let loadSequence = 0

function resolveSort() {
  switch (activeSort.value) {
    case 'stock':
      return { sort: 'stock', order: 'desc' }
    case 'sales':
      return { sort: 'sales', order: 'desc' }
    case 'priceAsc':
      return { sort: 'price', order: 'asc' }
    case 'priceDesc':
      return { sort: 'price', order: 'desc' }
    default:
      return { sort: '', order: '' }
  }
}

function formatPrice(price: number, pointsPrice: number) {
  if (price > 0) {
    return `CNY ${Number(price).toFixed(2)}`
  }
  return `${Number(pointsPrice || 0)} Pts`
}

function seckillStatus(item: SeckillItem) {
  if (item.campaign_status !== 1) return t('seckill.ended')
  const now = Date.now()
  const start = item.start_at ? new Date(item.start_at).getTime() : 0
  const end = item.end_at ? new Date(item.end_at).getTime() : 0
  if (start && now < start) return t('seckill.upcoming')
  if (end && now > end) return t('seckill.ended')
  return t('seckill.ongoing')
}

function seckillProgress(item: SeckillItem) {
  const value = Number(item.progress || 0)
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}
async function loadProducts() {
  const currentSequence = ++loadSequence
  loading.value = true
  try {
    const sortQuery = resolveSort()
    const result = await mallApi.getProducts({
      keyword: keyword.value,
      category_id: Number(categoryId.value),
      page: pagination.value.page,
      page_size: pagination.value.pageSize,
      ...sortQuery,
    })
    if (currentSequence !== loadSequence) {
      return
    }
    products.value = result.list
    pagination.value.total = result.total
  } finally {
    if (currentSequence === loadSequence) {
      loading.value = false
    }
  }
}

async function loadSeckillGoods() {
  try {
    seckillGoods.value = await mallApi.getSeckillGoods()
  } catch {
    seckillGoods.value = []
  }
}

function handlePageChange(page: number) {
  pagination.value.page = page
  void loadProducts()
}

function resetAndLoad() {
  pagination.value.page = 1
  void loadProducts()
}

function changeSort(sortKey: string) {
  activeSort.value = sortKey
  resetAndLoad()
}

function setCategory(nextCategory: string) {
  if (categoryId.value === nextCategory) return
  categoryId.value = nextCategory
  resetAndLoad()
}

watch(keyword, () => {
  if (keywordTimer) {
    window.clearTimeout(keywordTimer)
  }
  keywordTimer = window.setTimeout(() => {
    resetAndLoad()
  }, 260)
})

onMounted(async () => {
  const tasks: Promise<unknown>[] = []
  if (!app.categories.length || !app.announcements.length) {
    tasks.push(app.loadPublicData().catch(() => undefined))
  }
  if (auth.isLoggedIn && (!app.wallet || !app.signStatus)) {
    tasks.push(app.refreshUserAssets().catch(() => undefined))
  }
  tasks.push(loadProducts())
  tasks.push(loadSeckillGoods())
  await Promise.all(tasks)
})

onUnmounted(() => {
  if (keywordTimer) {
    window.clearTimeout(keywordTimer)
  }
})
</script>
<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 88px;
  padding-bottom: 120px;
}

.hero-section {
  position: relative;
  overflow: hidden;
  padding: 36px 0 0;
  min-height: calc(100vh - 180px);
}

.hero-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.65;
  pointer-events: none;
}

.orb-left {
  width: 420px;
  height: 420px;
  top: 40px;
  left: -80px;
  background: rgba(16, 185, 129, 0.16);
}

.orb-right {
  width: 360px;
  height: 360px;
  right: -40px;
  bottom: 30px;
  background: rgba(56, 189, 248, 0.12);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 88%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(380px, 0.95fr);
  gap: 48px;
  align-items: center;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-kicker,
.section-kicker,
.benefit-kicker,
.mini-kicker {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  background: rgba(236, 253, 245, 0.7);
  color: var(--primary-strong);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-title {
  margin: 0;
  font-size: clamp(52px, 7vw, 88px);
  line-height: 0.97;
  font-weight: 800;
  letter-spacing: -0.05em;
  color: var(--text-main);
}

.hero-title span {
  display: block;
  color: transparent;
  background: linear-gradient(135deg, #10b981, #0f172a 82%);
  -webkit-background-clip: text;
  background-clip: text;
}

.hero-subtitle {
  margin: 0;
  max-width: 620px;
  font-size: 18px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-btn,
.inline-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 26px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
}

.hero-btn:hover,
.inline-link:hover {
  transform: translateY(-2px);
}

.hero-btn-primary,
.inline-link {
  background: var(--text-main);
  color: #fff;
  box-shadow: 0 18px 28px -20px rgba(15, 23, 42, 0.7);
}

.hero-btn-secondary {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--border);
  color: var(--text-main);
}

.hero-signals {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-signals span {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.07);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
}

.hero-stage {
  position: relative;
  min-height: 560px;
}

.stage-card {
  position: absolute;
  border-radius: 30px;
}

.stage-primary {
  inset: 36px 48px 70px 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  animation: floatMain 7s ease-in-out infinite;
}

.stage-secondary {
  right: 0;
  top: 24px;
  width: 260px;
  padding: 22px;
  animation: floatSecondary 7.5s ease-in-out infinite;
}

.stage-floating {
  right: 24px;
  bottom: 16px;
  width: 280px;
  padding: 22px;
  animation: floatSecondary 8s ease-in-out infinite 1s;
}

@keyframes floatMain {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}

@keyframes floatSecondary {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.stage-badges,
.stage-meta,
.mini-progress,
.spotlight-top,
.spotlight-price-row,
.progress-meta,
.seckill-mini,
.capability-top,
.catalog-header,
.catalog-actions,
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.stage-visual {
  position: relative;
  min-height: 240px;
  border-radius: 28px;
  overflow: hidden;
  background: radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.28), rgba(15, 23, 42, 0.08) 48%, rgba(15, 23, 42, 0.88));
}

.stage-ring,
.stage-shape {
  position: absolute;
  border-radius: 999px;
}

.stage-ring {
  width: 260px;
  height: 260px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  top: -30px;
  right: -20px;
}

.stage-shape {
  width: 180px;
  height: 180px;
  left: 34px;
  bottom: 24px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.22), rgba(16, 185, 129, 0.18));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.stage-price {
  position: absolute;
  right: 22px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.stage-price strong,
.mini-value,
.metric-value,
.spotlight-price-row strong {
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
}

.stage-price strong,
.spotlight-price-row strong,
.mini-value {
  color: #fff;
}

.stage-price span,
.spotlight-price-row span,
.seckill-mini p,
.metric-card p,
.feature-card p,
.benefit-card p,
.capability-card p,
.seckill-note p,
.section-subtitle {
  color: var(--text-secondary);
  line-height: 1.7;
}

.stage-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stage-body h3,
.feature-card h3,
.benefit-card h3,
.capability-card strong,
.spotlight-top h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-main);
}

.stage-body p,
.feature-card small,
.capability-card small,
.metric-label,
.spotlight-desc,
.seckill-note span,
.benefit-meta span,
.seckill-mini span,
.seckill-mini-side span,
.spotlight-badge,
.progress-meta span,
.mini-head strong,
.mini-head span,
.stage-meta span,
.search-prefix {
  font-size: 13px;
  color: var(--text-secondary);
}

.stage-meta {
  flex-wrap: wrap;
}

.stage-meta span,
.spotlight-badge,
.capability-tag {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.mini-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stage-secondary p,
.stage-floating p {
  margin: 12px 0 0;
  line-height: 1.7;
  color: var(--text-secondary);
}

.mini-progress {
  margin-top: 14px;
}

.metrics-band,
.feature-grid,
.benefit-grid,
.capability-grid,
.product-grid {
  display: grid;
  gap: 24px;
}

.metrics-band {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-card,
.feature-card,
.benefit-card,
.capability-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.metric-label,
.feature-index,
.capability-tag {
  width: fit-content;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-card p,
.feature-card p,
.benefit-card p,
.capability-card p,
.seckill-note p,
.spotlight-desc {
  margin: 0;
  font-size: 14px;
}
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
}

.section-heading.compact {
  align-items: center;
}

.feature-grid,
.benefit-grid,
.capability-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.feature-card {
  min-height: 240px;
}

.feature-index {
  color: rgba(15, 23, 42, 0.24);
  font-size: 36px;
}

.seckill-section {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.seckill-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(260px, 0.95fr);
  gap: 24px;
}

.seckill-spotlight {
  padding: 26px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.92));
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.seckill-spotlight .section-kicker,
.seckill-spotlight .spotlight-badge,
.seckill-spotlight .progress-meta span,
.seckill-spotlight .spotlight-desc,
.seckill-spotlight .spotlight-price-row span {
  color: rgba(255, 255, 255, 0.72);
}

.seckill-spotlight .section-kicker,
.seckill-spotlight .spotlight-badge {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
}

.seckill-spotlight h3 {
  color: #fff;
}

.spotlight-price-row {
  align-items: flex-end;
}

.progress-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #10b981, #f59e0b);
}

.seckill-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.seckill-mini,
.seckill-note {
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.seckill-mini strong,
.benefit-meta strong {
  font-size: 18px;
  color: var(--text-main);
}

.seckill-mini p,
.seckill-note p {
  margin: 6px 0 0;
}

.seckill-mini-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.benefit-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.benefit-card {
  min-height: 230px;
  text-decoration: none;
}

.benefit-meta {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.capability-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.catalog-section {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.catalog-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.catalog-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.category-tabs {
  border-radius: 16px;
  flex-wrap: wrap;
}

.glass-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px;
  border-radius: 999px;
  background: var(--bg-glass);
  border: 1px solid var(--border);
  backdrop-filter: blur(14px);
}

.tab-btn,
.sort-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn {
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
}

.tab-btn.active,
.tab-btn:hover {
  background: var(--bg-page);
  color: var(--text-main);
  box-shadow: 0 10px 20px -18px rgba(15, 23, 42, 0.35);
}

.search-input {
  max-width: 290px;
}

.filter-bar {
  justify-content: flex-start;
}

.sort-tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid var(--border);
}

.sort-btn {
  padding: 12px 0;
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-muted);
}

.sort-btn.active,
.sort-btn:hover {
  color: var(--text-main);
  border-bottom-color: var(--text-main);
}

.product-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stagger-grid > * {
  animation: fadeInUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.stagger-grid > *:nth-child(2) { animation-delay: 0.04s; }
.stagger-grid > *:nth-child(3) { animation-delay: 0.08s; }
.stagger-grid > *:nth-child(4) { animation-delay: 0.12s; }
.stagger-grid > *:nth-child(5) { animation-delay: 0.16s; }
.stagger-grid > *:nth-child(6) { animation-delay: 0.2s; }

.skeleton-item {
  padding: 0;
  overflow: hidden;
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.empty-state h3 {
  font-size: 24px;
  margin: 0;
  color: var(--text-main);
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 1280px) {
  .hero-content,
  .seckill-layout,
  .section-heading,
  .catalog-header-top {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .metrics-band,
  .feature-grid,
  .benefit-grid,
  .capability-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-stage {
    min-height: 520px;
  }
}
@media (max-width: 1024px) {
  .home-page {
    gap: 72px;
  }

  .hero-section {
    min-height: auto;
  }

  .hero-stage {
    min-height: 720px;
  }

  .stage-primary {
    inset: 0 0 250px 0;
  }

  .stage-secondary {
    left: 0;
    right: auto;
    top: auto;
    bottom: 112px;
    width: calc(50% - 12px);
  }

  .stage-floating {
    right: 0;
    width: calc(50% - 12px);
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .home-page {
    gap: 60px;
    padding-bottom: 96px;
  }

  .hero-title {
    font-size: clamp(40px, 14vw, 58px);
  }

  .hero-subtitle,
  .section-subtitle {
    font-size: 15px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-btn,
  .inline-link {
    width: 100%;
  }

  .hero-stage {
    min-height: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .stage-card {
    position: relative;
    inset: auto;
    width: 100%;
    animation: none;
  }

  .metrics-band,
  .feature-grid,
  .benefit-grid,
  .capability-grid,
  .product-grid {
    grid-template-columns: 1fr;
  }

  .stage-badges,
  .catalog-actions,
  .sort-tabs,
  .seckill-mini,
  .benefit-meta,
  .capability-top,
  .spotlight-top,
  .spotlight-price-row,
  .progress-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input {
    max-width: 100%;
    width: 100%;
  }

  .sort-tabs {
    gap: 14px;
    overflow-x: auto;
  }
}
</style>

