<template>
  <section class="cart-page fade-in-up">
    <!-- Header -->
    <div class="page-header glass-panel">
      <div class="header-text">
        <h1 class="page-title">{{ $t('cart.pageTitle') }}</h1>
        <p class="page-desc">{{ $t('cart.pageDesc') }}</p>
      </div>
      <div class="header-actions">
        <button class="action-btn outline hover-float" @click="seedDemoItem">{{ $t('cart.addDemo') }}</button>
      </div>
    </div>

    <!-- Product List -->
    <div class="cart-list" v-loading="loading">
      <div v-if="items.length === 0" class="empty-state glass-panel">
        <div class="empty-icon">🛒</div>
        <h3>{{ $t('cart.emptyTitle') }}</h3>
        <p>{{ $t('cart.emptyDesc') }}</p>
        <RouterLink to="/products"><el-button type="primary" round>{{ $t('cart.browseCatalog') }}</el-button></RouterLink>
      </div>
      
      <article v-for="item in items" :key="item.sku_id" class="cart-item glass-panel">
        <div class="item-checkbox">
          <el-checkbox :model-value="(item.checked || item.Checked) === 1" @change="onCheckChange(item, $event)" size="large" />
        </div>
        
        <div class="item-cover">
          <img :src="item.cover || item.Cover" :alt="item.product_name || item.ProductName" class="cover-img" />
        </div>
        
        <div class="item-info">
          <strong class="item-name">{{ item.product_name || item.ProductName }}</strong>
          <span class="item-sku">{{ item.sku_title || item.SKUTitle }}</span>
        </div>
        
        <div class="item-price">
          <span class="label">{{ $t('common.price') }}</span>
          <strong>¥{{ (item.price || item.Price || 0).toFixed(2) }}</strong>
        </div>
        
        <div class="item-qty">
          <span class="label">{{ $t('common.quantity') }}</span>
          <el-input-number v-model="item.quantity" :min="1" size="small" @change="updateQty(item)" />
        </div>
        
        <div class="item-subtotal">
          <span class="label">{{ $t('cart.subtotal') }}</span>
          <strong>¥{{ ((item.price || item.Price || 0) * (item.quantity || 0)).toFixed(2) }}</strong>
        </div>
        
        <div class="item-actions">
          <button class="icon-btn danger hover-float" @click="remove(item.sku_id)" title="Remove item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </article>
    </div>

    <!-- Floating Checkout Bar -->
    <div class="checkout-bar glass-panel hover-float" :class="{ 'is-visible': items.length > 0 }">
      <div class="checkout-left">
        <div class="summary-stat">
          <span class="label">{{ $t('cart.standardTotal') }}</span>
          <strong class="value">¥{{ (totalAmount || 0).toFixed(2) }}</strong>
        </div>
      </div>
      
      <div class="checkout-right">
        <div class="final-price">
          <span class="label">{{ $t('cart.standardTotal') }}</span>
          <strong class="amount">¥{{ (totalAmount || 0).toFixed(2) }}</strong>
        </div>
        <button class="checkout-btn" :disabled="effectiveItems.length === 0" @click="router.push('/checkout')">
          {{ $t('cart.checkout', { n: effectiveItems.length }) }} &rarr;
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import http from '@/api/http'

const { t } = useI18n()

interface CartItem {
  id: number
  sku_id: number
  quantity: number
  checked: number
  Checked?: number
  product_name: string
  ProductName?: string
  sku_title: string
  SKUTitle?: string
  price: number
  Price?: number
  cover?: string
  Cover?: string
}

interface UserCoupon {
  id: number
  status: number
  amount: number
  threshold_amount: number
  template_name: string
  expired_at: string
}

const router = useRouter()
const loading = ref(false)
const items = ref<CartItem[]>([])
const coupons = ref<UserCoupon[]>([])
const selectedCouponId = ref<number | null>(null)
const usePoints = ref(false)

const effectiveItems = computed(() => items.value.filter((item: any) => item.checked === 1 || item.Checked === 1))

const totalAmount = computed(() => effectiveItems.value.reduce((sum, item) => sum + (item.price || item.Price || 0) * item.quantity, 0))

const availableCoupons = computed(() =>
  coupons.value.filter((coupon) => coupon.status === 10 && new Date(coupon.expired_at).getTime() > Date.now()),
)

const selectedCoupon = computed(() => availableCoupons.value.find((coupon) => coupon.id === selectedCouponId.value) || null)

const discountAmount = computed(() => {
  if (!selectedCoupon.value) return 0
  if (totalAmount.value < selectedCoupon.value.threshold_amount) return 0
  return Math.min(selectedCoupon.value.amount, totalAmount.value)
})

const payAmount = computed(() => Math.max(totalAmount.value - discountAmount.value, 0))

async function onCheckChange(item: any, val: boolean | string | number) {
  const status = val ? 1 : 0
  if (item.Checked !== undefined) item.Checked = status
  else item.checked = status
  
  try {
    const skuId = item.sku_id || item.SKUID
    await http.put(`/user/cart/items/${skuId}/checked`, { checked: status })
  } catch (err) {
    ElMessage.error(t('cart.syncCheckedFail'))
  }
}
async function updateQty(item: CartItem) {
  try {
    const skuId = item.sku_id || (item as any).SKUID
    await http.put(`/user/cart/items/${skuId}/quantity`, { quantity: item.quantity })
  } catch (err) {
    ElMessage.error(t('cart.syncQtyFail'))
  }
}

async function loadCart() {
  loading.value = true
  try {
    const res = await http.get('/user/cart')
    items.value = res.data
    // auto select all on load if unselected
    if(items.value.length > 0 && items.value.every((i: any) => (i.checked || i.Checked) === 0)) {
      items.value.forEach((i: any) => {
        if (i.Checked !== undefined) i.Checked = 1
        else i.checked = 1
      })
      // Sync all to backend to ensure checkout works
      Promise.all(items.value.map(i => {
        const skuId = i.sku_id
        return http.put(`/user/cart/items/${skuId}/checked`, { checked: 1 })
      })).catch(err => console.error('Failed to sync auto-checked items', err))
    }
  } finally {
    loading.value = false
  }
}

async function loadCoupons() {
  const res = await http.get('/user/coupons')
  coupons.value = res.data
}

async function seedDemoItem() {
  await http.post('/user/cart/items', { sku_id: 1, quantity: 1, checked: 1 })
  ElMessage.success(t('cart.itemAdded'))
  await loadCart()
}

async function remove(skuId: number) {
  await http.delete(`/user/cart/items/${skuId}`)
  ElMessage.success(t('cart.itemRemoved'))
  await loadCart()
}

async function submitOrder() {
  router.push('/checkout')
}

onMounted(async () => {
  await loadCart()
  await loadCoupons()
})
</script>

<style scoped>
.cart-page {
  display: flex; flex-direction: column; gap: 24px;
  padding-bottom: 140px; /* Space for checkout bar */
}

/* HEADER */
.page-header {
  padding: 32px 40px; display: flex; justify-content: space-between; align-items: center;
}
.header-text { display: flex; flex-direction: column; gap: 8px; }
.page-title { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
.page-desc { margin: 0; color: var(--text-secondary); font-size: 15px; }

.action-btn {
  padding: 10px 20px; border-radius: 999px; font-weight: 600; font-size: 14px;
  cursor: pointer; transition: all 0.2s;
}
.action-btn.outline {
  background: var(--bg-glass); border: 1px solid var(--border);
  color: var(--text-main);
}
.action-btn.outline:hover { background: var(--bg-elevated); }

/* CART LIST */
.cart-list { display: flex; flex-direction: column; gap: 16px; }

.cart-item {
  padding: 24px 32px; display: flex; align-items: center; gap: 24px;
  transition: transform 0.2s;
}
.cart-item:hover { transform: translateX(4px); }

.item-checkbox { display: grid; place-items: center; }
.item-cover { width: 80px; height: 80px; border-radius: 12px; overflow: hidden; background: rgba(0,0,0,0.02); }
.cover-img { width: 100%; height: 100%; object-fit: cover; }

.item-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.item-name { font-size: 18px; font-weight: 700; color: var(--text-main); line-height: 1.3; }
.item-sku { font-size: 13px; color: var(--text-secondary); padding: 2px 8px; background: rgba(0,0,0,0.04); border-radius: 6px; width: max-content; }

.item-price, .item-qty, .item-subtotal {
  display: flex; flex-direction: column; gap: 6px; align-items: flex-end; width: 120px;
}
.label { font-size: 12px; text-transform: uppercase; font-weight: 600; color: var(--text-muted); letter-spacing: 0.05em; }
.item-price strong { font-size: 16px; font-weight: 600; }
.item-subtotal strong { font-size: 18px; font-weight: 800; color: var(--text-main); }

.item-actions { margin-left: 16px; }
.icon-btn {
  width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--border);
  background: var(--bg-glass); display: grid; place-items: center; cursor: pointer; transition: all 0.2s; color: var(--text-secondary);
}
.icon-btn.danger:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }
.icon-btn .w-5 { width: 18px; height: 18px; }

.empty-state {
  padding: 80px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.empty-icon { font-size: 64px; opacity: 0.8; }
.empty-state h3 { font-size: 24px; font-weight: 800; margin: 0; }
.empty-state p { color: var(--text-secondary); margin: 0; }

/* CHECKOUT BAR */
.checkout-bar {
  position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
  width: min(1000px, calc(100% - 48px));
  padding: 20px 32px; display: flex; justify-content: space-between; align-items: center;
  border-radius: 999px; z-index: 90;
  opacity: 0; pointer-events: none; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 24px 48px -12px rgba(0,0,0,0.15), inset 0 1px 0 var(--border-glow);
  background: var(--bg-elevated);
  backdrop-filter: blur(24px);
  border: 1px solid var(--border);
}
.checkout-bar.is-visible { opacity: 1; pointer-events: auto; }

.checkout-left { display: flex; align-items: center; gap: 24px; }
.summary-stat { display: flex; flex-direction: column; gap: 4px; }
.summary-stat .value { font-size: 18px; font-weight: 800; }
.text-green { color: var(--primary-strong); }
.summary-divider { width: 1px; height: 32px; background: var(--border); }

.coupon-selector { display: flex; flex-direction: column; gap: 4px; }
.glass-select { width: 220px; }

.checkout-right { display: flex; align-items: center; gap: 32px; }
.final-price { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.final-price .amount { font-size: 28px; font-weight: 800; line-height: 1; letter-spacing: -0.03em; color: var(--text-main); }

.checkout-btn {
  background: var(--text-main); color: white; border: none;
  padding: 16px 36px; border-radius: 999px; font-size: 16px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.checkout-btn:hover:not(:disabled) { background: #000; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.2); }
.checkout-btn:disabled { background: rgba(0,0,0,0.1); color: var(--text-muted); cursor: not-allowed; box-shadow: none; }

@media (max-width: 1024px) {
  .checkout-bar { flex-direction: column; align-items: stretch; gap: 24px; border-radius: 24px; padding: 24px; }
  .checkout-left, .checkout-right { justify-content: space-between; width: 100%; }
}
@media (max-width: 768px) {
  .cart-item { flex-direction: column; align-items: flex-start; gap: 12px; }
  .item-price, .item-qty, .item-subtotal { align-items: flex-start; width: 100%; flex-direction: row; justify-content: space-between; }
  .item-actions { margin: 0; width: 100%; display: flex; justify-content: flex-end; }
}
</style>
