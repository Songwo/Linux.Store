<template>
  <section class="catalog-page fade-in-up">
    <!-- Header Block -->
    <div class="catalog-header glass-panel">
      <div class="header-main">
        <div class="header-text">
           <h1 class="page-title">{{ $t('products.pageTitle') }}</h1>
           <p class="page-desc">{{ $t('products.pageDesc') }}</p>
        </div>
        <div class="header-actions">
           <el-input 
              v-model="keyword" 
              class="search-bar" 
              clearable 
              :placeholder="$t('common.search')"
              @change="resetAndLoad" 
           >
              <template #prefix><span class="search-icon">🔍</span></template>
           </el-input>
        </div>
      </div>
      
      <div class="header-filters">
        <div class="filter-group">
          <span class="filter-label">{{ $t('products.allCategories') }}</span>
          <div class="glass-tabs">
            <button :class="['tab-btn', { active: categoryId === '0' }]" @click="categoryId='0'; resetAndLoad()">{{ $t('products.allCategories') }}</button>
            <button 
              v-for="cat in app.categories" 
              :key="cat.id" 
              :class="['tab-btn', { active: categoryId === String(cat.id) }]" 
              @click="categoryId=String(cat.id); resetAndLoad()"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <div class="filter-group right">
          <span class="filter-label">{{ $t('products.allTypes') }}</span>
          <el-select v-model="selectedType" class="glass-select" @change="resetAndLoad">
            <el-option :label="$t('products.allTypes')" value="all" />
            <el-option :label="$t('products.standard')" value="normal" />
            <el-option :label="$t('products.pointsOnly')" value="points" />
            <el-option :label="$t('products.limited')" value="limited" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- Toolbar Sort -->
    <div class="sort-toolbar">
      <div class="sort-buttons">
        <button v-for="opt in sortOptions" :key="opt.value" 
          :class="['sort-btn', { active: sortKey === opt.value }]"
          @click="sortKey = opt.value; resetAndLoad()"
        >
          {{ opt.label }}
        </button>
      </div>
      <div class="result-count">{{ pagination.total }} {{ $t('products.results', { n: '' }) }}</div>
    </div>

    <!-- Product Grid -->
    <div v-if="loading" class="product-grid">
      <div v-for="index in 6" :key="index" class="skeleton-wrap glass-panel hover-float">
        <el-skeleton animated style="padding: 16px;">
          <template #template>
            <el-skeleton-item variant="image" style="width:100%;height:220px;border-radius:18px;" />
            <el-skeleton-item variant="h3" style="width:70%;margin-top:16px;" />
            <el-skeleton-item variant="text" style="width:100%;margin-top:8px;" />
          </template>
        </el-skeleton>
      </div>
    </div>
    
    <div v-else-if="products.length" class="product-grid">
      <ProductCard v-for="item in products" :key="item.id" :item="item" />
    </div>

    <div v-else class="empty-state glass-panel fade-in-up">
      <div class="empty-icon">🔎</div>
      <h3>{{ $t('products.noMatch') }}</h3>
      <p>{{ $t('products.pageDesc') }}</p>
      <button class="clear-btn" @click="keyword=''; categoryId='0'; selectedType='all'; resetAndLoad()">{{ $t('products.clearFilters') }}</button>
    </div>

    <!-- Pagination -->
    <div class="pagination-wrapper" v-if="pagination.total > 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="changePage"
        class="glass-pagination"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProductCard from '@/components/ProductCard.vue'
import { mallApi, type ProductItem } from '@/api/mall'
import { useAppStore } from '@/stores/app'

const { t } = useI18n()
const app = useAppStore()
const loading = ref(false)
const products = ref<ProductItem[]>([])
const keyword = ref('')
const categoryId = ref('0')
const selectedType = ref('all')
const sortKey = ref('default')
const pagination = ref({ page: 1, pageSize: 12, total: 0 })

const sortOptions = computed(() => [
  { label: t('products.featured'), value: 'default' },
  { label: t('products.inStock'), value: 'stock' },
  { label: t('products.popular'), value: 'sales' },
  { label: t('products.priceLow'), value: 'priceAsc' },
  { label: t('products.priceHigh'), value: 'priceDesc' },
])

function resolveSort() {
  switch (sortKey.value) {
    case 'stock': return { sort: 'stock', order: 'desc' }
    case 'sales': return { sort: 'sales', order: 'desc' }
    case 'priceAsc': return { sort: 'price', order: 'asc' }
    case 'priceDesc': return { sort: 'price', order: 'desc' }
    default: return { sort: '', order: '' }
  }
}

async function loadProducts() {
  loading.value = true
  try {
    const result = await mallApi.getProducts({
      keyword: keyword.value,
      category_id: Number(categoryId.value),
      type: selectedType.value,
      page: pagination.value.page,
      page_size: pagination.value.pageSize,
      ...resolveSort(),
    })
    products.value = result.list
    pagination.value.total = result.total
  } finally {
    loading.value = false
  }
}

function resetAndLoad() {
  pagination.value.page = 1
  loadProducts()
}

function changePage(page: number) {
  pagination.value.page = page
  loadProducts()
}

onMounted(async () => {
  if (!app.categories.length) {
    await app.loadPublicData().catch(() => undefined)
  }
  await loadProducts()
})
</script>

<style scoped>
.catalog-page { display: flex; flex-direction: column; gap: 32px; padding-bottom: 80px; }

/* HEADER */
.catalog-header { display: flex; flex-direction: column; gap: 24px; padding: 32px 40px; }

.header-main { display: flex; justify-content: space-between; align-items: flex-start; }
.header-text { display: flex; flex-direction: column; gap: 8px; }
.page-title { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; }
.page-desc { margin: 0; color: var(--text-secondary); font-size: 15px; }

.search-bar { width: 320px; }
.search-icon { padding-left: 10px; font-size: 16px; opacity: 0.8; }

.header-filters {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 24px; border-top: 1px solid var(--border);
}

.filter-group { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.filter-label { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }

.glass-tabs {
  display: flex; background: rgba(0,0,0,0.03); padding: 6px; border-radius: 999px;
  border: 1px solid var(--border);
}
.tab-btn {
  border: none; background: transparent; padding: 8px 20px; border-radius: 999px;
  font-weight: 600; font-size: 13px; color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
}
.tab-btn:hover { color: var(--text-main); }
.tab-btn.active {
  background: var(--bg-page); color: var(--text-main); box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.glass-select { width: 160px; }

/* SORT & STATS */
.sort-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 0 8px; border-bottom: 1px solid var(--border); }
.sort-buttons { display: flex; gap: 24px; }
.sort-btn {
  border: none; background: transparent; padding: 12px 0; border-bottom: 2px solid transparent;
  font-size: 14px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.2s; margin-bottom: -1px;
}
.sort-btn:hover { color: var(--text-main); }
.sort-btn.active { color: var(--text-main); border-bottom-color: var(--text-main); }

.result-count { font-size: 14px; color: var(--text-secondary); font-weight: 500; }

/* GRID */
.product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }

.skeleton-wrap { padding: 0; overflow: hidden; }

.empty-state {
  padding: 80px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.empty-icon { font-size: 64px; opacity: 0.8; filter: grayscale(1); }
.empty-state h3 { font-size: 24px; font-weight: 800; margin: 0; }
.empty-state p { color: var(--text-secondary); margin: 0; }
.clear-btn {
  margin-top: 16px; padding: 10px 24px; border-radius: 999px; background: rgba(0,0,0,0.05); border: none; font-weight: 600; color: var(--text-main); cursor: pointer; transition: all 0.2s;
}
.clear-btn:hover { background: rgba(0,0,0,0.1); }

/* PAGINATION */
.pagination-wrapper { display: flex; justify-content: center; margin-top: 24px; padding: 24px; background: var(--bg-card); border-radius: 999px; border: 1px solid var(--border); width: max-content; margin-inline: auto; }

@media (max-width: 1024px) {
  .header-main { flex-direction: column; gap: 24px; align-items: stretch; }
  .search-bar { width: 100%; }
  .header-filters { flex-direction: column; align-items: flex-start; gap: 24px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .sort-toolbar { flex-direction: column; align-items: flex-start; gap: 16px; padding-bottom: 16px; }
  .sort-buttons { flex-wrap: wrap; gap: 16px; }
}
@media (max-width: 640px) {
  .product-grid { grid-template-columns: 1fr; }
  .catalog-header { padding: 24px; }
  .glass-tabs { overflow-x: auto; width: calc(100vw - 48px); justify-content: flex-start; }
}
</style>
