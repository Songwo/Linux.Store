<template>
  <article class="product-card glass-panel hover-float">
    <RouterLink :to="`/products/${item.id}`" class="cover-wrap">
      <img v-if="item.cover" :src="item.cover" :alt="item.name" class="cover-image" loading="lazy" />
      <div v-else class="cover-fallback">{{ item.name.slice(0, 2) }}</div>

      <div class="cover-tags">
        <span class="card-chip">{{ item.category_name || 'Featured' }}</span>
        <span class="card-chip is-ghost">{{ stockText }}</span>
      </div>

      <div class="hover-overlay fade-in-up">
        <button v-if="showWishlist" class="wish-glass-btn" :disabled="wishlistLoading" @click.prevent="toggleWishlist">
          <svg v-if="likedState" viewBox="0 0 24 24" fill="#10b981" stroke="#10b981" stroke-width="2" class="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
        <button class="wish-glass-btn" :disabled="addingToCart" @click.prevent="addToCart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </button>
        <el-button type="primary" size="small" class="explore-btn" @click.prevent="$router.push(`/products/${item.id}`)">
          {{ addingToCart ? 'Processing' : 'View Details' }}
        </el-button>
      </div>
    </RouterLink>

    <div class="card-body">
      <div class="title-row">
        <RouterLink :to="`/products/${item.id}`" class="title-link">{{ item.name }}</RouterLink>
        <span v-if="item.is_hot" class="mini-badge">HOT</span>
      </div>
      <p class="subtitle">{{ item.subtitle || 'Digital goods for builders.' }}</p>

      <div class="meta-row">
        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg> {{ item.sales_count }} sold</span>
        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> {{ item.view_count }}</span>
        <span>{{ typeText }}</span>
      </div>

      <div class="price-row">
        <div class="price-box">
          <strong v-if="item.price > 0">￥{{ item.price.toFixed(2) }}</strong>
          <strong v-else>{{ item.points_price }} Pts</strong>
          <span v-if="item.origin_price > item.price" class="origin-price">￥{{ item.origin_price.toFixed(2) }}</span>
        </div>
        <button class="quick-buy-btn" :disabled="addingToCart || item.stock <= 0" @click.prevent="addToCart">
          {{ addingToCart ? 'Adding...' : item.stock > 0 ? 'Quick Add' : 'Sold Out' }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { mallApi, type ProductItem } from '@/api/mall'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import http from '@/api/http'

const props = withDefaults(
  defineProps<{
    item: ProductItem
    liked?: boolean
    showWishlist?: boolean
  }>(),
  {
    liked: false,
    showWishlist: true,
  },
)

const emit = defineEmits<{
  (e: 'wishlist-change', value: boolean): void
}>()

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const likedState = ref(props.liked)
const wishlistLoading = ref(false)
const addingToCart = ref(false)

watch(
  () => props.liked,
  (value) => {
    likedState.value = value
  },
)

const stockText = computed(() => (props.item.stock > 0 ? `Stock ${props.item.stock}` : 'Out of Stock'))
const typeText = computed(() => {
  switch (props.item.type) {
    case 'points':
      return 'Points Item'
    case 'limited':
      return 'Limited Edition'
    default:
      return 'Standard'
  }
})

async function toggleWishlist() {
  if (wishlistLoading.value) return
  if (!auth.isLoggedIn) {
    ElMessage.warning('Please sign in to add to wishlist')
    router.push('/login')
    return
  }
  wishlistLoading.value = true
  const next = !likedState.value
  try {
    await mallApi.setWishlist(props.item.id, next)
    likedState.value = next
    emit('wishlist-change', next)
    ElMessage.success(next ? 'Added to wishlist' : 'Removed from wishlist')
  } finally {
    wishlistLoading.value = false
  }
}

async function addToCart() {
  if (addingToCart.value) return
  if (!auth.isLoggedIn) {
    ElMessage.warning('Please sign in to add to cart')
    router.push('/login')
    return
  }
  if (!props.item.default_sku_id) {
    router.push(`/products/${props.item.id}`)
    return
  }
  addingToCart.value = true
  try {
    await http.post('/user/cart/items', { sku_id: props.item.default_sku_id, quantity: 1 })
    ElMessage.success('Added to cart')
    await cart.refresh()
  } catch {
    ElMessage.error('Failed to add to cart')
  } finally {
    addingToCart.value = false
  }
}
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 16px;
  overflow: hidden;
}

.cover-wrap {
  position: relative;
  display: block;
  border-radius: var(--radius-xl);
  height: 240px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(4, 120, 87, 0.04));
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.cover-image,
.cover-fallback {
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.cover-image {
  object-fit: cover;
}

.cover-fallback {
  display: grid;
  place-items: center;
  font-size: 42px;
  font-weight: 800;
  color: var(--primary);
  opacity: 0.6;
}

.cover-tags {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  z-index: 2;
  pointer-events: none;
}

.hover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(4, 8, 14, 0.15), rgba(4, 8, 14, 0.55));
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.cover-wrap:hover .hover-overlay {
  opacity: 1;
}

.cover-wrap:hover .cover-image,
.cover-wrap:hover .cover-fallback {
  transform: scale(1.05);
}

.wish-glass-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.12);
  color: white;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.wish-glass-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.22);
  color: var(--primary-strong);
  transform: scale(1.05);
}

.wish-glass-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.wish-glass-btn .w-5 {
  width: 20px;
  height: 20px;
}

.explore-btn {
  border-radius: 999px !important;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 8px 8px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.title-link {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.01em;
  transition: color 0.2s;
}

.title-link:hover {
  color: var(--primary-strong);
}

.mini-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 42px;
}

.meta-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
}

.meta-row span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.w-3 {
  width: 14px;
  height: 14px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-top: 6px;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-box strong {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-main);
  line-height: 1;
}

.origin-price {
  color: var(--text-muted);
  text-decoration: line-through;
  font-size: 14px;
}

.quick-buy-btn {
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  background: var(--text-main);
  color: white;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.quick-buy-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(17, 24, 39, 0.18);
}

.quick-buy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
