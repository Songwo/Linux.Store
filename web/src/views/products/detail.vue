<template>
  <section v-if="loading" class="detail-loading glass-panel">
    <el-skeleton animated>
      <template #template>
        <el-skeleton-item variant="image" style="width:100%;height:520px;border-radius:24px;" />
      </template>
    </el-skeleton>
  </section>

  <div v-else-if="detail" class="detail-page fade-in-up">
    <!-- Seckill Banner -->
    <div v-if="detail.seckill_info" class="seckill-banner glass-panel">
      <div class="seckill-event">
        <span class="flash-icon">⚡</span>
        <div class="event-text">
          <strong class="event-name">{{ detail.seckill_info.campaign_name }}</strong>
          <span class="event-timer">{{ countdownText || (isUpcoming ? '即将开始' : $t('seckill.ongoing')) }}</span>
        </div>
      </div>
      <div class="seckill-price-area">
        <span class="price-label">Seckill Price</span>
        <strong class="price-value">¥{{ detail.seckill_info.seckill_price.toFixed(2) }}</strong>
      </div>
    </div>

    <!-- Hero Section Split Layout -->
    <section class="product-hero">
      
      <!-- Left: Visual Gallery -->
      <div class="gallery-panel glass-panel">
        <div class="main-image">
          <img :src="activeImage" :alt="detail.product.name" />
        </div>
        <div class="thumb-row" v-if="detail.product.gallery && detail.product.gallery.length > 1">
          <button 
            v-for="image in detail.product.gallery" 
            :key="image" 
            type="button" 
            :class="['thumb-btn', { active: image === activeImage }]" 
            @click="activeImage = image"
          >
            <img :src="image" :alt="detail.product.name" />
          </button>
        </div>
      </div>

      <!-- Right: Info & CTA -->
      <div class="info-panel">
        <div class="info-header">
          <span class="category-kicker">{{ detail.product.category_name }}</span>
          <h1 class="product-title">{{ detail.product.name }}</h1>
          <p class="product-subtitle">{{ detail.product.subtitle }}</p>
        </div>
        
        <div class="tag-row" v-if="detail.product.tags && detail.product.tags.length">
          <span v-for="tag in detail.product.tags" :key="tag" class="card-chip">{{ tag }}</span>
        </div>
        
        <div class="stats-row">
          <div class="stat-box hover-float glass-panel">
            <span class="label">{{ $t('detail.rating') || 'Rating' }}</span>
            <strong class="value">{{ detail.product.rating ? detail.product.rating.toFixed(1) : '5.0' }} <span style="font-size:14px;color:var(--text-muted);font-weight:normal;">({{ detail.product.review_count || 0 }} reviews)</span></strong>
          </div>
          <div class="stat-box hover-float glass-panel">

            <span class="label">{{ $t('detail.inStock') }}</span>
            <strong class="value">{{ activeSku?.stock ?? detail.product.stock }}</strong>
          </div>
          <div class="stat-box hover-float glass-panel">
            <span class="label">{{ $t('detail.sales') }}</span>
            <strong class="value">{{ detail.product.sales_count }}</strong>
          </div>
        </div>

        <div class="price-block glass-panel">
          <div class="price-display">
            <strong class="current-price" v-if="priceValue > 0">
              <span class="symbol">¥</span>{{ priceValue.toFixed(2) }}
            </strong>
            <strong class="current-price" v-else>
              {{ pointsValue }} <span class="symbol">Pts</span>
            </strong>
            <span v-if="detail.product.origin_price > priceValue" class="origin-price">¥{{ detail.product.origin_price.toFixed(2) }}</span>
          </div>
          <div class="wallet-tip">
            <span>{{ $t('detail.yourBalance') }}:</span>
            <strong>¥{{ walletBalance }} / {{ walletPoints }} Pts</strong>
          </div>
        </div>

        <div class="buy-box glass-panel">
          <div class="buy-row">
            <span class="row-label">{{ $t('detail.variant') }}</span>
            <div class="sku-selector">
              <button 
                v-for="sku in detail.skus" 
                :key="sku.id" 
                :class="['sku-btn', { 'is-active': skuId === sku.id }]"
                @click="skuId = sku.id"
              >
                {{ sku.title }}
              </button>
            </div>
          </div>
          <div class="buy-row">
            <span class="row-label">{{ $t('common.quantity') }}</span>
            <div class="qty-and-points">
              <el-input-number v-model="quantity" :min="1" :max="maxQuantity" class="amount-input" />
              <el-checkbox v-model="usePoints" class="points-checker">
                {{ $t('cart.usePoints') }}
              </el-checkbox>
            </div>
          </div>
          <div class="buy-row notes">
            <span class="row-label">{{ $t('detail.deliveryNote') }}</span>
            <span class="note-text">{{ detail.product.delivery_note || $t('detail.instantDelivery') }}</span>
          </div>
          <div class="buy-actions">
            <button class="wish-glass-btn hover-float" @click="toggleWishlist">
              <svg v-if="liked" viewBox="0 0 24 24" fill="#10b981" stroke="#10b981" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" class="text-secondary" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
            <el-button type="primary" class="main-buy-btn hover-float" :disabled="maxQuantity <= 0 || isUpcoming" @click="handlePurchase">
              <span v-if="detail.seckill_info">{{ isUpcoming ? '即将开始' : $t('seckill.grabNow') }}</span>
              <span v-else>{{ $t('common.buyNow') }}</span>
              &rarr;
            </el-button>
            <el-button v-if="!detail.seckill_info" type="warning" class="cart-btn-large hover-float" @click="addToCart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </el-button>
          </div>
        </div>
      </div>
    </section>

    <!-- Details Grid -->
    <section class="content-grid">
      <article class="glass-panel content-card">
        <h2>{{ $t('detail.about') }}</h2>
        <div class="markdown-body">
          <p>{{ detail.product.description || $t('common.empty') }}</p>
        </div>
      </article>
      <article class="glass-panel content-card">
        <h2>{{ $t('detail.terms') }}</h2>
        <ul class="styled-list">
          <li>{{ detail.product.purchase_note || $t('detail.purchaseTermsDefault') }}</li>
          <li>{{ detail.product.service_note || $t('detail.serviceNoteDefault') }}</li>
          <li>{{ $t('detail.instantDelivery') }}</li>
        </ul>
      </article>
    </section>

    <!-- Reviews Section -->
    <section class="reviews-section">
      <div class="section-head" style="margin-bottom: 24px;">
        <h2 class="section-title">{{ $t('detail.reviews') || 'Reviews' }} ({{ detail.product.review_count || 0 }})</h2>
        <el-button type="primary" round plain @click="openReviewDialog" v-if="auth.isLoggedIn">
          {{ $t('detail.writeReview') }}
        </el-button>
      </div>
      
      <div v-if="reviews.length" class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review-item glass-panel">
          <div class="review-header">
            <div class="reviewer-info">
              <img v-if="review.avatar" :src="review.avatar" class="reviewer-avatar" />
              <div v-else class="reviewer-avatar text-avatar">{{ review.nickname.charAt(0).toUpperCase() }}</div>
              <span class="reviewer-name">{{ review.nickname }}</span>
            </div>
            <div class="review-meta">
              <el-rate v-model="review.rating" disabled text-color="#ff9900" />
              <span class="review-date">{{ new Date(review.created_at).toLocaleDateString() }}</span>
            </div>
          </div>
          <div class="review-content">
            <p>{{ review.content }}</p>
          </div>
        </div>
        
        <div class="pagination-wrapper" v-if="reviewTotal > reviewPageSize" style="margin-top:24px;display:flex;justify-content:center;">
          <el-pagination 
            v-model:current-page="reviewPage" 
            :page-size="reviewPageSize" 
            :total="reviewTotal" 
            layout="prev, pager, next"
            @current-change="loadReviews"
          />
        </div>
      </div>
      <div v-else class="empty-state glass-panel">
        No reviews yet. Be the first to review this product!
      </div>
    </section>

    <!-- Related Products -->
    <section class="related-section">
      <div class="section-head">
        <h2 class="section-title">{{ $t('detail.related') }}</h2>
      </div>
      <div class="related-grid" v-if="detail.related_products?.length">
        <ProductCard v-for="item in detail.related_products.slice(0,4)" :key="item.id" :item="item" />
      </div>
      <div v-else class="empty-state glass-panel">
        No related products available.
      </div>
    </section>
  </div>

  <div v-else class="empty-state glass-panel fade-in-up" style="margin-top:80px;">
    <h3>{{ $t('detail.unavailable') }}</h3>
    <p>{{ $t('detail.unavailableDesc') }}</p>
    <el-button @click="$router.push('/products')" round>{{ $t('detail.backToCatalog') }}</el-button>
  </div>

  <!-- Review Dialog -->
  <el-dialog v-model="reviewDialogVisible" :title="$t('detail.writeReview') || 'Write a Review'" width="500px" destroy-on-close>
    <div class="review-form">
      <div style="margin-bottom: 20px;">
        <span style="display:block;margin-bottom:8px;font-weight:600;">{{ $t('detail.ratingLabel') || 'Rating' }}</span>
        <el-rate v-model="newReview.rating" :colors="['#409eff', '#67c23a', '#FF9900']"></el-rate>
      </div>
      <div>
        <span style="display:block;margin-bottom:8px;font-weight:600;">{{ $t('detail.reviewContent') || 'Content' }}</span>
        <el-input
          v-model="newReview.content"
          type="textarea"
          :rows="4"
          :placeholder="$t('detail.reviewPlaceholder')"
          maxlength="1000"
          show-word-limit
        />
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="reviewDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submittingReview" :disabled="!newReview.content || newReview.rating === 0" @click="submitReview">
          {{ $t('detail.writeReview') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { mallApi, type ProductDetailResult, type ReviewItem } from '@/api/mall'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useCartStore } from '@/stores/cart'
import http from '@/api/http'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const app = useAppStore()
const cart = useCartStore()

const loading = ref(false)
const detail = ref<ProductDetailResult | null>(null)
const activeImage = ref('')
const skuId = ref<number>()
const quantity = ref(1)
const liked = ref(false)
const usePoints = ref(false)
const isSeckill = computed(() => !!detail.value?.seckill_info)
const isUpcoming = computed(() => {
  if (!detail.value?.seckill_info?.start_at) return false
  return Date.now() < new Date(detail.value.seckill_info.start_at).getTime()
})

const countdownText = ref('')
let timerId: number | undefined

// Review state
const reviews = ref<ReviewItem[]>([])
const reviewTotal = ref(0)
const reviewPage = ref(1)
const reviewPageSize = ref(5)
const reviewDialogVisible = ref(false)
const submittingReview = ref(false)
const newReview = ref({ rating: 5, content: '' })

async function loadReviews() {
  try {
    const res = await mallApi.getProductReviews(route.params.id as string, {
      page: reviewPage.value,
      page_size: reviewPageSize.value
    })
    reviews.value = res.list
    reviewTotal.value = res.total
  } catch (err) {
    console.error('Failed to load reviews', err)
  }
}

function openReviewDialog() {
  newReview.value = { rating: 5, content: '' }
  reviewDialogVisible.value = true
}

async function submitReview() {
  submittingReview.value = true
  try {
    await mallApi.submitProductReview(route.params.id as string, newReview.value.rating, newReview.value.content)
    ElMessage.success(t('detail.reviewSuccess'))
    reviewDialogVisible.value = false
    // Reload detail for updated average rating and count
    await loadDetail(false) 
    await loadReviews()
  } catch (err) {
    ElMessage.error(t('detail.reviewFail'))
  } finally {
    submittingReview.value = false
  }
}

function formatTime(ms: number) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (d > 0) return t('detail.timeDay', { d, h, m, s })
  return t('detail.timeHour', { h, m, s })
}

function updateTimer() {
  if (!detail.value?.seckill_info) return
  const now = Date.now()
  const start = new Date(detail.value.seckill_info.start_at).getTime()
  const end = new Date(detail.value.seckill_info.end_at).getTime()

  if (now < start) {
    countdownText.value = t('detail.countdownStart', { t: formatTime(start - now) })
  } else if (now <= end) {
    countdownText.value = t('detail.countdownEnd', { t: formatTime(end - now) })
  } else {
    detail.value.seckill_info = undefined
    countdownText.value = ''
  }
}

const activeSku = computed(() => detail.value?.skus.find((sku) => sku.id === skuId.value))
const priceValue = computed(() => Number(activeSku.value?.price ?? detail.value?.product.price ?? 0))
const pointsValue = computed(() => Number(activeSku.value?.points_price ?? detail.value?.product.points_price ?? 0))
const maxQuantity = computed(() => {
  const stock = Number(activeSku.value?.stock ?? detail.value?.product.stock ?? 0)
  return stock > 0 ? stock : 1
})
const walletBalance = computed(() => Number(app.wallet?.balance || auth.profile?.balance || 0).toFixed(2))
const walletPoints = computed(() => app.wallet?.points || auth.profile?.points || 0)

async function loadDetail(withLoading = true) {
  if (withLoading) loading.value = true
  try {
    const result = await mallApi.getProductDetail(Number(route.params.id))
    detail.value = result
    activeImage.value = result.product.gallery?.[0] || result.product.cover || ''
    skuId.value = result.skus[0]?.id
    if (auth.isLoggedIn) {
      const status = await mallApi.getWishlistStatus(route.params.id as string)
      liked.value = status.liked
    }
    updateTimer()
    if (!timerId) timerId = window.setInterval(updateTimer, 1000)
  } finally {
    if (withLoading) loading.value = false
  }
}

import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

async function toggleWishlist() {
  if (!auth.isLoggedIn) {
    ElMessage.warning(t('detail.addWishlistSignIn'))
    router.push('/login')
    return
  }
  liked.value = !liked.value
  await mallApi.setWishlist(route.params.id as string, liked.value)
  ElMessage.success(liked.value ? t('detail.addedWishlist') : t('detail.removedWishlist'))
}

async function handlePurchase() {
  if (isSeckill.value) {
    router.push('/seckill')
    return
  }
  await buyNow()
}

async function addToCart() {
  if (!auth.isLoggedIn) {
    ElMessage.warning('Please sign in to add to cart')
    router.push('/login')
    return
  }
  if (!skuId.value) {
    ElMessage.warning('Please select a variant')
    return
  }
  try {
    await http.post('/user/cart/items', { sku_id: skuId.value, quantity: quantity.value })
    ElMessage.success('Added to cart')
    cart.refresh()
  } catch {
    ElMessage.error('Failed to add to cart')
  }
}

async function buyNow() {
  if (!auth.isLoggedIn) {
    ElMessage.warning('Please sign in to purchase')
    router.push('/login')
    return
  }
  if (!skuId.value) {
    ElMessage.warning('Please select a variant')
    return
  }
  await ElMessageBox.confirm('Proceed with creating the order and payment?', 'Confirm Purchase', {
    confirmButtonText: 'Pay Now',
    cancelButtonText: 'Cancel',
    type: 'info',
  })
  const order = await mallApi.createOrder({
    submit_token: crypto.randomUUID().replace(/-/g, ''),
    items: [{ sku_id: skuId.value, quantity: quantity.value }],
    use_points: usePoints.value,
    remark: 'Direct buy',
  })
  await mallApi.payOrder(order.order_no)
  await Promise.all([
    auth.fetchProfile().catch(() => undefined),
    app.refreshUserAssets().catch(() => undefined),
  ])
  ElMessage.success('Order paid and assets delivered.')
  router.push({ path: '/orders', query: { focus: order.order_no } })
}

onMounted(async () => {
  if (auth.isLoggedIn) {
    await Promise.all([
      auth.fetchProfile().catch(() => undefined),
      app.refreshUserAssets().catch(() => undefined),
    ])
  }
  await Promise.all([
    loadDetail(),
    loadReviews()
  ])
})
</script>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding-bottom: 120px;
}

/* SECKILL BANNER */
.seckill-banner {
  background: linear-gradient(90deg, #f43f5e, #fb7185);
  color: white;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.seckill-event { display: flex; align-items: center; gap: 16px; }
.flash-icon { font-size: 24px; animation: pulse 1s infinite; }
.event-text { display: flex; flex-direction: column; }
.event-name { font-size: 18px; font-weight: 800; }
.event-timer { font-size: 13px; opacity: 0.9; font-weight: 600; text-transform: uppercase; }
.seckill-price-area { display: flex; flex-direction: column; align-items: flex-end; }
.price-label { font-size: 12px; font-weight: 700; text-transform: uppercase; opacity: 0.8; }
.price-value { font-size: 28px; font-weight: 900; }

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

/* HERO */
.product-hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: start;
}

.gallery-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image {
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: rgba(0,0,0,0.02);
}
.main-image img { width: 100%; height: 100%; object-fit: cover; }

.thumb-row {
  display: flex; gap: 12px; flex-wrap: wrap;
}
.thumb-btn {
  width: 80px; height: 80px;
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  padding: 0; background: transparent;
  cursor: pointer; overflow: hidden;
  opacity: 0.6; transition: all 0.2s;
}
.thumb-btn:hover { opacity: 1; }
.thumb-btn.active { border-color: var(--text-main); opacity: 1; }
.thumb-btn img { width: 100%; height: 100%; object-fit: cover; }

/* INFO */
.info-panel {
  display: flex; flex-direction: column; gap: 24px;
}

.category-kicker {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-strong);
  border-radius: 999px;
  font-weight: 700; font-size: 13px; text-transform: uppercase;
  margin-bottom: 12px;
}

.product-title {
  font-size: 40px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 12px 0;
  line-height: 1.1;
}

.product-subtitle {
  font-size: 18px; color: var(--text-secondary); margin: 0; line-height: 1.5;
}

.tag-row { display: flex; gap: 8px; flex-wrap: wrap; }

.stats-row { display: flex; gap: 16px; }
.stat-box {
  flex: 1; padding: 16px 20px;
  display: flex; flex-direction: column; gap: 4px;
}
.stat-box .label { font-size: 13px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; }
.stat-box .value { font-size: 24px; font-weight: 800; }

.price-block {
  padding: 24px; display: flex; flex-direction: column; gap: 12px;
  background: var(--bg-card);
}
.price-display { display: flex; align-items: baseline; gap: 12px; }
.current-price { font-size: 48px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
.symbol { font-size: 24px; color: var(--text-muted); font-weight: 600; margin-right: 4px; }
.origin-price { font-size: 18px; color: var(--text-muted); text-decoration: line-through; }
.wallet-tip {
  display: flex; justify-content: space-between; font-size: 14px;
  color: var(--text-secondary); border-top: 1px solid var(--border); padding-top: 12px;
}
.wallet-tip strong { color: var(--text-main); }

.buy-box {
  padding: 24px; display: flex; flex-direction: column; gap: 20px;
}
.buy-row { display: flex; flex-direction: column; gap: 12px; }
.row-label { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
.sku-selector { display: flex; gap: 12px; flex-wrap: wrap; }
.sku-btn {
  padding: 10px 20px; border-radius: 999px; font-weight: 600; font-size: 14px;
  background: var(--bg-glass); border: 1px solid var(--border);
  cursor: pointer; transition: all 0.2s; color: var(--text-main);
}
.sku-btn:hover { background: var(--bg-elevated); border-color: rgba(0,0,0,0.2); }
.sku-btn.is-active { background: var(--text-main); color: white; border-color: var(--text-main); }
.note-text { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }

.buy-actions {
  display: flex; gap: 16px; margin-top: 8px;
}
.wish-glass-btn {
  width: 56px; height: 56px; border-radius: 16px; border: 1px solid var(--border);
  background: var(--bg-glass); display: grid; place-items: center; cursor: pointer; transition: all 0.2s;
}
.wish-glass-btn:hover { background: var(--bg-elevated); }
.wish-glass-btn svg { width: 24px; height: 24px; }
.text-secondary { color: var(--text-secondary); }

.main-buy-btn {
  flex: 1; border-radius: 16px !important; font-size: 18px; font-weight: 700; height: 56px;
  background: var(--text-main); color: white; border: none;
}
.main-buy-btn:hover { background: #000; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }

/* CONTENT GRID */
.content-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 32px;
}
.content-card { padding: 40px; display: flex; flex-direction: column; gap: 24px; }
.content-card h2 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
.markdown-body p { font-size: 16px; color: var(--text-secondary); line-height: 1.8; margin: 0; }
.styled-list { margin: 0; padding-left: 20px; color: var(--text-secondary); line-height: 1.8; font-size: 15px; }

/* RELATED & REVIEWS */
.related-section, .reviews-section { display: flex; flex-direction: column; gap: 24px; padding-top: 40px; border-top: 1px solid var(--border); }
.section-title { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin: 0; }
.section-head { display: flex; justify-content: space-between; align-items: center; }
.related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

/* REVIEWS SPECIFIC */
.reviews-list { display: flex; flex-direction: column; gap: 16px; }
.review-item { padding: 24px; border-radius: 16px; display: flex; flex-direction: column; gap: 16px; }
.review-header { display: flex; justify-content: space-between; align-items: flex-start; }
.reviewer-info { display: flex; align-items: center; gap: 12px; }
.reviewer-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.text-avatar { background: var(--text-main); color: white; display: grid; place-items: center; font-weight: bold; font-size: 16px; }
.reviewer-name { font-weight: 600; font-size: 15px; }
.review-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.review-date { font-size: 13px; color: var(--text-muted); }
.review-content { margin: 0; line-height: 1.6; color: var(--text-secondary); }

.empty-state { text-align: center; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: var(--text-muted); }

@media (max-width: 1024px) {
  .product-hero, .content-grid { grid-template-columns: 1fr; }
  .related-grid { grid-template-columns: repeat(2, 1fr); }
  .info-panel { padding-top: 24px; }
}
@media (max-width: 640px) {
  .related-grid { grid-template-columns: 1fr; }
  .stats-row { flex-direction: column; }
  .buy-actions { flex-direction: column; }
  .wish-glass-btn { width: 100%; }
}
</style>
