<template>
  <section class="wishlist-page fade-in-up">
    <!-- Header -->
    <div class="page-header glass-panel">
      <div class="header-text">
        <h1 class="page-title">{{ $t('wishlist.pageTitle') }}</h1>
        <p class="page-desc">{{ $t('wishlist.pageDesc') }}</p>
      </div>
      <div class="header-actions">
        <button class="action-btn outline hover-float" @click="loadWishlist">{{ $t('wishlist.sync') }}</button>
      </div>
    </div>

    <!-- Product Grid -->
    <div v-if="items.length" class="wishlist-grid">
      <ProductCard 
        v-for="item in items" 
        :key="item.id" 
        :item="item" 
        :liked="true" 
        @wishlist-change="loadWishlist" 
      />
    </div>
    
    <div v-else class="empty-state glass-panel fade-in-up">
      <div class="empty-icon">❤️</div>
      <h3>{{ $t('wishlist.emptyTitle') }}</h3>
      <p>{{ $t('wishlist.emptyDesc') }}</p>
      <RouterLink to="/products"><el-button type="primary" round style="margin-top:20px;">{{ $t('wishlist.exploreCatalog') }}</el-button></RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import { mallApi, type ProductItem } from '@/api/mall'

const items = ref<ProductItem[]>([])

async function loadWishlist() {
  items.value = await mallApi.getWishlist()
}

onMounted(loadWishlist)
</script>

<style scoped>
.wishlist-page {
  display: flex; flex-direction: column; gap: 32px; padding-bottom: 80px;
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

/* GRID */
.wishlist-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
}

.empty-state {
  padding: 80px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.empty-icon { font-size: 64px; opacity: 0.8; filter: grayscale(1); }
.empty-state h3 { font-size: 24px; font-weight: 800; margin: 0; }
.empty-state p { color: var(--text-secondary); margin: 0; max-width: 400px; }

@media (max-width: 1024px) {
  .wishlist-grid { grid-template-columns: repeat(2, 1fr); }
  .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
}
@media (max-width: 640px) {
  .wishlist-grid { grid-template-columns: 1fr; }
}
</style>
