<template>
  <section class="checkout-page fade-in-up">
    <div class="checkout-container">
      <!-- Left: Order Review -->
      <div class="checkout-main">
        <header class="section-header">
          <button class="back-link" @click="router.back()">← {{ $t('common.back') }}</button>
          <h1 class="page-title">{{ $t('cart.checkoutTitle') }}</h1>
        </header>

        <div class="glass-panel checkout-box">
          <h3 class="box-title">{{ $t('cart.orderReview') }}</h3>
          <div class="checkout-items">
            <div v-for="item in items" :key="item.sku_id" class="checkout-item">
              <div class="item-img-mini">
                <img :src="item.cover || item.Cover" :alt="item.product_name || item.ProductName" />
              </div>
              <div class="item-meta">
                <span class="item-name">{{ item.product_name || item.ProductName }}</span>
                <span class="item-sku">{{ item.sku_title || item.SKUTitle }}</span>
              </div>
              <div class="item-price-qty">
                <span class="item-qty">x{{ item.quantity }}</span>
                <strong class="item-total">¥{{ ((item.price || item.Price || 0) * (item.quantity || 0)).toFixed(2) }}</strong>
              </div>
            </div>
          </div>

          <div class="checkout-section">
            <h3 class="box-title">{{ $t('cart.shippingInfo') }}</h3>
            <div class="shipping-card">
              <div class="shipping-icon">🚚</div>
              <div class="shipping-text">
                <strong>{{ $t('cart.instantDigital') }}</strong>
                <p>{{ $t('detail.instantDelivery') }}</p>
              </div>
            </div>
          </div>

          <div class="checkout-section">
            <h3 class="box-title">{{ $t('cart.remark') }}</h3>
            <el-input
              v-model="remark"
              type="textarea"
              :rows="2"
              :placeholder="$t('cart.placeholderRemark')"
              class="glass-textarea"
            />
          </div>
        </div>
      </div>

      <!-- Right: Summary & Payment -->
      <aside class="checkout-sidebar">
        <div class="glass-panel summary-box sticky-top">
          <h3 class="box-title">{{ $t('common.total') }}</h3>
          
          <div class="summary-rows">
            <div class="summary-row">
              <span>{{ $t('cart.standardTotal') }}</span>
              <span>¥{{ (totalAmount || 0).toFixed(2) }}</span>
            </div>
            
            <div class="summary-row highlight">
              <span>{{ $t('cart.discount') }}</span>
              <el-select v-model="selectedCouponId" :placeholder="$t('cart.noCoupon')" clearable class="glass-select-mini">
                <el-option
                  v-for="coupon in availableCoupons"
                  :key="coupon.id"
                  :label="`${coupon.template_name} (-¥${coupon.amount})`"
                  :value="coupon.id"
                />
              </el-select>
            </div>

            <div v-if="discountAmount > 0" class="summary-row text-green">
              <span>{{ $t('cart.saved') }}</span>
              <span>-¥{{ (discountAmount || 0).toFixed(2) }}</span>
            </div>

            <div class="summary-row">
              <el-checkbox v-model="usePoints" size="large">
                <span class="label">{{ $t('cart.usePoints') }}</span>
              </el-checkbox>
            </div>

            <div class="summary-divider"></div>
            
            <div class="summary-row final">
              <span>{{ $t('cart.totalIncluded') }}</span>
              <strong class="final-amount">¥{{ (payAmount || 0).toFixed(2) }}</strong>
            </div>
          </div>

          <button class="submit-btn" :disabled="submitting || items.length === 0" @click="confirmOrder">
            {{ submitting ? '...' : $t('cart.confirmOrder') }}
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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
const submitting = ref(false)
const items = ref<CartItem[]>([])
const coupons = ref<UserCoupon[]>([])
const selectedCouponId = ref<number | null>(null)
const usePoints = ref(false)
const remark = ref('')

const totalAmount = computed(() => items.value.reduce((sum, item) => sum + (item.price || item.Price || 0) * item.quantity, 0))

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

async function loadData() {
  loading.value = true
  try {
    const [cartRes, couponRes] = await Promise.all([
      http.get('/user/cart'),
      http.get('/user/coupons')
    ])
    // Only items that were checked in the cart
    items.value = cartRes.data.filter((i: any) => (i.checked === 1 || i.Checked === 1))
    coupons.value = couponRes.data
    
    if (items.value.length === 0) {
      ElMessage.warning(t('cart.noItemsCheckout'))
      router.replace('/cart')
    }
  } finally {
    loading.value = false
  }
}

async function confirmOrder() {
  submitting.value = true
  try {
    const res = await http.post('/user/orders', {
      submit_token: crypto.randomUUID().replace(/-/g, ''),
      items: items.value.map((item: any) => ({ 
        sku_id: item.sku_id || item.SKUID, 
        quantity: item.quantity || item.Quantity 
      })),
      coupon_id: selectedCoupon.value?.id,
      use_points: usePoints.value,
      remark: remark.value || t('cart.defaultRemark'),
    })
    ElMessage.success(t('cart.orderCreatedSuccess'))
    router.push({ path: '/orders', query: { focus: res.data.order_no } })
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.checkout-page { padding-bottom: 80px; }
.checkout-container { display: grid; grid-template-columns: 1fr 380px; gap: 40px; }

.section-header { margin-bottom: 32px; display: flex; flex-direction: column; gap: 8px; }
.back-link { border: none; background: transparent; color: var(--text-secondary); cursor: pointer; font-weight: 600; font-size: 14px; width: max-content; }
.page-title { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.04em; }

.checkout-box { padding: 40px; display: flex; flex-direction: column; gap: 40px; }
.box-title { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main); }

.checkout-items { display: flex; flex-direction: column; gap: 20px; }
.checkout-item { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.item-img-mini { width: 50px; height: 50px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: rgba(0,0,0,0.02); }
.item-img-mini img { width: 100%; height: 100%; object-fit: cover; }
.item-meta { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.item-name { font-weight: 600; color: var(--text-main); }
.item-sku { font-size: 12px; color: var(--text-secondary); background: rgba(0,0,0,0.04); padding: 2px 8px; border-radius: 4px; width: max-content; }
.item-price-qty { display: flex; align-items: center; gap: 16px; }
.item-qty { color: var(--text-muted); font-size: 14px; }

.shipping-card { display: flex; align-items: center; gap: 20px; padding: 20px; background: rgba(16, 185, 129, 0.05); border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.1); }
.shipping-icon { font-size: 32px; }
.shipping-text strong { display: block; margin-bottom: 4px; color: var(--primary-strong); }
.shipping-text p { margin: 0; font-size: 14px; color: var(--text-secondary); }

.checkout-sidebar { position: relative; }
.summary-box { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
.sticky-top { position: sticky; top: 120px; }

.summary-rows { display: flex; flex-direction: column; gap: 16px; }
.summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 15px; color: var(--text-secondary); }
.summary-row.highlight { color: var(--text-main); font-weight: 600; }
.summary-row.final { margin-top: 8px; font-size: 16px; }
.final-amount { font-size: 32px; font-weight: 800; color: var(--text-main); letter-spacing: -0.04em; }
.summary-divider { height: 1px; background: var(--border); margin: 8px 0; }
.text-green { color: var(--primary-strong); }

.glass-select-mini { width: 180px; }
.submit-btn { width: 100%; padding: 18px; border-radius: 999px; background: var(--btn-primary-bg); color: var(--btn-primary-text); border: none; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 12px 32px rgba(0,0,0,0.15); }
.submit-btn:hover:not(:disabled) { transform: translateY(-2px); background: var(--btn-primary-bg); filter: brightness(0.9); box-shadow: 0 16px 40px rgba(0,0,0,0.2); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 1024px) {
  .checkout-container { grid-template-columns: 1fr; }
}
</style>
