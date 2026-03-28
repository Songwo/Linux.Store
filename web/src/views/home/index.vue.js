import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import ProductCard from '@/components/ProductCard.vue';
import NoticeBar from '@/components/NoticeBar.vue';
import { mallApi } from '@/api/mall';
import { useAppStore } from '@/stores/app';
import { useAuthStore } from '@/stores/auth';
const app = useAppStore();
const auth = useAuthStore();
const loading = ref(false);
const products = ref([]);
const seckillGoods = ref([]);
const keyword = ref('');
const categoryId = ref('0');
const activeSort = ref('default');
const pagination = ref({ page: 1, pageSize: 9, total: 0 });
const sortOptions = [
    { key: 'default', label: 'Featured' },
    { key: 'stock', label: 'In Stock' },
    { key: 'sales', label: 'Popular' },
    { key: 'priceAsc', label: 'Price: Low' },
    { key: 'priceDesc', label: 'Price: High' },
];
const heroSignals = ['Redis catalog cache', 'MQ seckill queue', 'Wallet + points sync', 'Faster order detail view'];
const heroProduct = computed(() => {
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
    };
});
const spotlightSeckill = computed(() => seckillGoods.value[0] || null);
const secondarySeckill = computed(() => seckillGoods.value.slice(1, 4));
const summary = computed(() => ({
    total: pagination.value.total,
    stock: products.value.reduce((sum, item) => sum + Number(item.stock || 0), 0),
    sales: products.value.reduce((sum, item) => sum + Number(item.sales_count || 0), 0),
}));
const overviewStats = computed(() => [
    {
        label: 'Products live',
        value: String(summary.value.total),
        note: 'Paginated list results keep the catalog responsive while filters stay active.',
    },
    {
        label: 'Visible stock',
        value: String(summary.value.stock),
        note: 'Current page inventory remains visible and easier to compare at a glance.',
    },
    {
        label: 'Sales exposed',
        value: String(summary.value.sales),
        note: 'Popular goods now surface faster through cleaner sorting and card actions.',
    },
    {
        label: 'Seckill lanes',
        value: String(seckillGoods.value.length),
        note: 'Campaign stock is synchronized with Redis-backed realtime availability reads.',
    },
]);
const featureCards = [
    {
        index: '01',
        title: 'High-concurrency entry protection',
        desc: 'Redis sliding-window throttling and guarded seckill endpoints reduce burst pressure before order creation.',
        meta: 'Global limiter + user limiter + burst control',
    },
    {
        index: '02',
        title: 'RabbitMQ traffic shaping',
        desc: 'Seckill purchase traffic is decoupled through channel pooling, worker consumers, and queue-first order creation.',
        meta: 'Producer pooling + multi-worker consume',
    },
    {
        index: '03',
        title: 'Lower catalog query cost',
        desc: 'Product list, detail, and seckill stock reads now hit cache paths first to trim repeated database pressure.',
        meta: 'Redis cache + MGET stock sync',
    },
    {
        index: '04',
        title: 'Cleaner purchase visibility',
        desc: 'The order page keeps the active detail pinned so users no longer lose the order context while scrolling.',
        meta: 'Desktop master-detail + mobile quick entry',
    },
];
const benefitCards = computed(() => [
    {
        kicker: 'Wallet ledger',
        title: auth.isLoggedIn ? 'Spendable balance' : 'Wallet rewards ready',
        desc: auth.isLoggedIn
            ? 'Balance and points stay synced after sign-in rewards and balance payments.'
            : 'Sign in to unlock wallet overview, balance spending, and reward tracking.',
        value: auth.isLoggedIn ? `CNY ${Number(app.wallet?.balance || 0).toFixed(2)}` : 'Quick login',
        linkLabel: auth.isLoggedIn ? `Points ${app.wallet?.points || 0}` : 'Open login',
        to: auth.isLoggedIn ? '/balance' : '/login',
    },
    {
        kicker: 'Daily growth',
        title: auth.isLoggedIn ? 'Sign-in streak' : 'Daily sign-in center',
        desc: auth.isLoggedIn
            ? 'Users can read current streak, today reward, and growth rhythm without leaving the homepage flow.'
            : 'Turn daily visits into points and balance rewards with a clearer growth mechanic.',
        value: auth.isLoggedIn ? `${app.signStatus?.streak_days || 0} days` : 'Reward path',
        linkLabel: auth.isLoggedIn ? `Today +${app.signStatus?.today_reward || 0} pts` : 'Open sign-in',
        to: '/sign',
    },
    {
        kicker: 'Activity value',
        title: 'Coupon and activity lane',
        desc: 'Campaigns, coupons, flash sales, and points goods now read like part of one connected system.',
        value: `${app.announcements.length} notices`,
        linkLabel: 'Open coupons',
        to: '/coupons',
    },
]);
const capabilityCards = [
    {
        tag: 'Catalog',
        title: 'Cache-backed product list and detail',
        desc: 'Frequently visited product reads are served through Redis cache layers to shrink repeated database hits.',
        footnote: 'Lower latency for homepage, list, and detail access.',
    },
    {
        tag: 'Seckill',
        title: 'Inventory guard and async order pipeline',
        desc: 'Burst traffic is controlled before consumption, then processed through queued order workers for smoother spikes.',
        footnote: 'Redis guard + RabbitMQ queue + consumer workers.',
    },
    {
        tag: 'Order',
        title: 'Order detail stays visible',
        desc: 'Users can compare multiple orders without losing the currently selected order context during long scroll sessions.',
        footnote: 'Pinned detail view on desktop, quick access on mobile.',
    },
    {
        tag: 'Asset',
        title: 'Wallet, points, and delivery stay connected',
        desc: 'Payments, sign-in rewards, coupons, and card delivery all feed into one clearer front-end narrative.',
        footnote: 'Good for both product demo and portfolio presentation.',
    },
];
let keywordTimer;
let loadSequence = 0;
function resolveSort() {
    switch (activeSort.value) {
        case 'stock':
            return { sort: 'stock', order: 'desc' };
        case 'sales':
            return { sort: 'sales', order: 'desc' };
        case 'priceAsc':
            return { sort: 'price', order: 'asc' };
        case 'priceDesc':
            return { sort: 'price', order: 'desc' };
        default:
            return { sort: '', order: '' };
    }
}
function formatPrice(price, pointsPrice) {
    if (price > 0) {
        return `CNY ${Number(price).toFixed(2)}`;
    }
    return `${Number(pointsPrice || 0)} Pts`;
}
function seckillStatus(item) {
    if (item.campaign_status !== 1)
        return 'Closed';
    const now = Date.now();
    const start = item.start_at ? new Date(item.start_at).getTime() : 0;
    const end = item.end_at ? new Date(item.end_at).getTime() : 0;
    if (start && now < start)
        return 'Upcoming';
    if (end && now > end)
        return 'Ended';
    return 'Live';
}
function seckillProgress(item) {
    const value = Number(item.progress || 0);
    if (!Number.isFinite(value))
        return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
}
async function loadProducts() {
    const currentSequence = ++loadSequence;
    loading.value = true;
    try {
        const sortQuery = resolveSort();
        const result = await mallApi.getProducts({
            keyword: keyword.value,
            category_id: Number(categoryId.value),
            page: pagination.value.page,
            page_size: pagination.value.pageSize,
            ...sortQuery,
        });
        if (currentSequence !== loadSequence) {
            return;
        }
        products.value = result.list;
        pagination.value.total = result.total;
    }
    finally {
        if (currentSequence === loadSequence) {
            loading.value = false;
        }
    }
}
async function loadSeckillGoods() {
    try {
        seckillGoods.value = await mallApi.getSeckillGoods();
    }
    catch {
        seckillGoods.value = [];
    }
}
function handlePageChange(page) {
    pagination.value.page = page;
    void loadProducts();
}
function resetAndLoad() {
    pagination.value.page = 1;
    void loadProducts();
}
function changeSort(sortKey) {
    activeSort.value = sortKey;
    resetAndLoad();
}
function setCategory(nextCategory) {
    if (categoryId.value === nextCategory)
        return;
    categoryId.value = nextCategory;
    resetAndLoad();
}
watch(keyword, () => {
    if (keywordTimer) {
        window.clearTimeout(keywordTimer);
    }
    keywordTimer = window.setTimeout(() => {
        resetAndLoad();
    }, 260);
});
onMounted(async () => {
    const tasks = [];
    if (!app.categories.length || !app.announcements.length) {
        tasks.push(app.loadPublicData().catch(() => undefined));
    }
    if (auth.isLoggedIn && (!app.wallet || !app.signStatus)) {
        tasks.push(app.refreshUserAssets().catch(() => undefined));
    }
    tasks.push(loadProducts());
    tasks.push(loadSeckillGoods());
    await Promise.all(tasks);
});
onUnmounted(() => {
    if (keywordTimer) {
        window.clearTimeout(keywordTimer);
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-link']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-link']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-signals']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-shape']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-price']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-price-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-price']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-price-row']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-price']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-price-row']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-body']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-card']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-card']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-top']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-body']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-card']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-note']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-head']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-head']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-floating']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['metrics-band']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-card']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-card']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-card']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-note']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-index']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-spotlight']} */ ;
/** @type {__VLS_StyleScopedClasses['section-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-spotlight']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-spotlight']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-spotlight']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-spotlight']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-price-row']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-spotlight']} */ ;
/** @type {__VLS_StyleScopedClasses['section-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-spotlight']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-spotlight']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-price-row']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-note']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-note']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-mini-side']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-card']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['product-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stagger-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stagger-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stagger-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stagger-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stagger-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-content']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-header']} */ ;
/** @type {__VLS_StyleScopedClasses['metrics-band']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stage']} */ ;
/** @type {__VLS_StyleScopedClasses['home-page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-section']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stage']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-floating']} */ ;
/** @type {__VLS_StyleScopedClasses['product-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['home-page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-link']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stage']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metrics-band']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['product-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-badges']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-top']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-top']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-price-row']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-tabs']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-shell home-page fade-in-up" },
});
/** @type {[typeof NoticeBar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(NoticeBar, new NoticeBar({
    announcements: (__VLS_ctx.app.announcements),
}));
const __VLS_1 = __VLS_0({
    announcements: (__VLS_ctx.app.announcements),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "hero-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-orb orb-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-orb orb-right" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "hero-kicker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "hero-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "hero-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-actions" },
});
const __VLS_3 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({
    to: "/products",
    ...{ class: "hero-btn hero-btn-primary" },
}));
const __VLS_5 = __VLS_4({
    to: "/products",
    ...{ class: "hero-btn hero-btn-primary" },
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
__VLS_6.slots.default;
var __VLS_6;
const __VLS_7 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
    to: "/seckill",
    ...{ class: "hero-btn hero-btn-secondary" },
}));
const __VLS_9 = __VLS_8({
    to: "/seckill",
    ...{ class: "hero-btn hero-btn-secondary" },
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
__VLS_10.slots.default;
var __VLS_10;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-signals" },
});
for (const [signal] of __VLS_getVForSourceType((__VLS_ctx.heroSignals))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        key: (signal),
    });
    (signal);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-stage" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "stage-card stage-primary glass-panel hover-float" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stage-badges" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "card-chip" },
});
(__VLS_ctx.heroProduct.type === 'points' ? 'Points' : 'Featured');
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "card-chip is-ghost" },
});
(__VLS_ctx.heroProduct.stock);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stage-visual" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stage-ring" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stage-shape" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stage-price" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.formatPrice(__VLS_ctx.heroProduct.price, __VLS_ctx.heroProduct.points_price));
if (__VLS_ctx.heroProduct.origin_price > __VLS_ctx.heroProduct.price) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.formatPrice(__VLS_ctx.heroProduct.origin_price, 0));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stage-body" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.heroProduct.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.heroProduct.subtitle || 'Low latency discovery with a cleaner purchase path.');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stage-meta" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.heroProduct.sales_count);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.heroProduct.view_count);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.heroProduct.category_name || 'Digital goods');
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "stage-card stage-secondary glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mini-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "mini-kicker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.auth.isLoggedIn ? 'Signed in' : 'Guest mode');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mini-value" },
});
(__VLS_ctx.auth.isLoggedIn ? `CNY ${Number(__VLS_ctx.app.wallet?.balance || 0).toFixed(2)}` : 'Rewards ready');
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.auth.isLoggedIn ? `Points ${__VLS_ctx.app.wallet?.points || 0}  |  Streak ${__VLS_ctx.app.signStatus?.streak_days || 0} days` : 'Sign in to unlock wallet, points, and sign-in rewards.');
if (__VLS_ctx.spotlightSeckill) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "stage-card stage-floating glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mini-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "mini-kicker" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.seckillStatus(__VLS_ctx.spotlightSeckill));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mini-value" },
    });
    (Number(__VLS_ctx.spotlightSeckill.seckill_price || 0).toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.spotlightSeckill.product_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mini-progress" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.seckillProgress(__VLS_ctx.spotlightSeckill));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "metrics-band" },
});
for (const [stat] of __VLS_getVForSourceType((__VLS_ctx.overviewStats))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (stat.label),
        ...{ class: "metric-card glass-panel hover-float" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "metric-label" },
    });
    (stat.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "metric-value" },
    });
    (stat.value);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (stat.note);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "feature-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-heading" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-kicker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "section-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "feature-grid" },
});
for (const [feature] of __VLS_getVForSourceType((__VLS_ctx.featureCards))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (feature.title),
        ...{ class: "feature-card glass-panel hover-float" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "feature-index" },
    });
    (feature.index);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (feature.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (feature.desc);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (feature.meta);
}
if (__VLS_ctx.spotlightSeckill) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "seckill-section glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-heading compact" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "section-kicker" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "section-title" },
    });
    const __VLS_11 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
        to: "/seckill",
        ...{ class: "inline-link" },
    }));
    const __VLS_13 = __VLS_12({
        to: "/seckill",
        ...{ class: "inline-link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    __VLS_14.slots.default;
    var __VLS_14;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "seckill-layout" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "seckill-spotlight" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spotlight-top" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "section-kicker" },
    });
    (__VLS_ctx.seckillStatus(__VLS_ctx.spotlightSeckill));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.spotlightSeckill.product_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "spotlight-badge" },
    });
    (__VLS_ctx.spotlightSeckill.sku_id);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spotlight-price-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (Number(__VLS_ctx.spotlightSeckill.seckill_price || 0).toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.spotlightSeckill.campaign_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spotlight-progress" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "progress-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (Number(__VLS_ctx.spotlightSeckill.available_stock || 0));
    (Number(__VLS_ctx.spotlightSeckill.stock || 0));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.seckillProgress(__VLS_ctx.spotlightSeckill));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "progress-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "progress-bar" },
        ...{ style: ({ width: `${__VLS_ctx.seckillProgress(__VLS_ctx.spotlightSeckill)}%` }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "spotlight-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "seckill-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.secondarySeckill))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (`${item.seckill_campaign_id}-${item.sku_id}`),
            ...{ class: "seckill-mini" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.product_name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (item.campaign_name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "seckill-mini-side" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.seckillStatus(item));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (Number(item.seckill_price || 0).toFixed(2));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "seckill-note" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.seckillGoods.length);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "benefit-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-heading compact" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-kicker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "benefit-grid" },
});
for (const [card] of __VLS_getVForSourceType((__VLS_ctx.benefitCards))) {
    const __VLS_15 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
        key: (card.title),
        to: (card.to),
        ...{ class: "benefit-card glass-panel hover-float" },
    }));
    const __VLS_17 = __VLS_16({
        key: (card.title),
        to: (card.to),
        ...{ class: "benefit-card glass-panel hover-float" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_18.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "benefit-kicker" },
    });
    (card.kicker);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (card.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (card.desc);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "benefit-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (card.value);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (card.linkLabel);
    var __VLS_18;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "capability-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-heading" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-kicker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "section-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "capability-grid" },
});
for (const [cap] of __VLS_getVForSourceType((__VLS_ctx.capabilityCards))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (cap.title),
        ...{ class: "capability-card glass-panel hover-float" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "capability-top" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "capability-tag" },
    });
    (cap.tag);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (cap.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (cap.desc);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (cap.footnote);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "catalog-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "catalog-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-kicker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "section-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "catalog-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "glass-tabs" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.setCategory('0');
        } },
    ...{ class: "tab-btn" },
    ...{ class: ({ active: __VLS_ctx.categoryId === '0' }) },
});
(__VLS_ctx.$t('products.allCategories'));
for (const [cat] of __VLS_getVForSourceType((__VLS_ctx.app.categories))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.setCategory(String(cat.id));
            } },
        key: (cat.id),
        ...{ class: "tab-btn" },
        ...{ class: ({ active: __VLS_ctx.categoryId === String(cat.id) }) },
    });
    (cat.name);
}
const __VLS_19 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    modelValue: (__VLS_ctx.keyword),
    ...{ class: "search-input" },
    clearable: true,
    placeholder: (__VLS_ctx.$t('common.search')),
}));
const __VLS_21 = __VLS_20({
    modelValue: (__VLS_ctx.keyword),
    ...{ class: "search-input" },
    clearable: true,
    placeholder: (__VLS_ctx.$t('common.search')),
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_22.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_22.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "search-prefix" },
    });
}
var __VLS_22;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sort-tabs" },
});
for (const [opt] of __VLS_getVForSourceType((__VLS_ctx.sortOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.changeSort(opt.key);
            } },
        key: (opt.key),
        ...{ class: (['sort-btn', { active: __VLS_ctx.activeSort === opt.key }]) },
    });
    (opt.label);
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-grid" },
    });
    for (const [i] of __VLS_getVForSourceType((6))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (i),
            ...{ class: "skeleton-item glass-panel" },
        });
        const __VLS_23 = {}.ElSkeleton;
        /** @type {[typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, ]} */ ;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
            animated: true,
        }));
        const __VLS_25 = __VLS_24({
            animated: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        __VLS_26.slots.default;
        {
            const { template: __VLS_thisSlot } = __VLS_26.slots;
            const __VLS_27 = {}.ElSkeletonItem;
            /** @type {[typeof __VLS_components.ElSkeletonItem, typeof __VLS_components.elSkeletonItem, ]} */ ;
            // @ts-ignore
            const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
                variant: "image",
                ...{ style: {} },
            }));
            const __VLS_29 = __VLS_28({
                variant: "image",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_28));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            const __VLS_31 = {}.ElSkeletonItem;
            /** @type {[typeof __VLS_components.ElSkeletonItem, typeof __VLS_components.elSkeletonItem, ]} */ ;
            // @ts-ignore
            const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
                variant: "h3",
                ...{ style: {} },
            }));
            const __VLS_33 = __VLS_32({
                variant: "h3",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_32));
            const __VLS_35 = {}.ElSkeletonItem;
            /** @type {[typeof __VLS_components.ElSkeletonItem, typeof __VLS_components.elSkeletonItem, ]} */ ;
            // @ts-ignore
            const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
                variant: "text",
                ...{ style: {} },
            }));
            const __VLS_37 = __VLS_36({
                variant: "text",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        }
        var __VLS_26;
    }
}
else if (__VLS_ctx.products.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-grid stagger-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.products))) {
        /** @type {[typeof ProductCard, ]} */ ;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(ProductCard, new ProductCard({
            key: (item.id),
            item: (item),
        }));
        const __VLS_40 = __VLS_39({
            key: (item.id),
            item: (item),
        }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pagination-wrap" },
});
const __VLS_42 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    ...{ 'onCurrentChange': {} },
    background: true,
    layout: "prev, pager, next",
    currentPage: (__VLS_ctx.pagination.page),
    pageSize: (__VLS_ctx.pagination.pageSize),
    total: (__VLS_ctx.pagination.total),
}));
const __VLS_44 = __VLS_43({
    ...{ 'onCurrentChange': {} },
    background: true,
    layout: "prev, pager, next",
    currentPage: (__VLS_ctx.pagination.page),
    pageSize: (__VLS_ctx.pagination.pageSize),
    total: (__VLS_ctx.pagination.total),
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
let __VLS_46;
let __VLS_47;
let __VLS_48;
const __VLS_49 = {
    onCurrentChange: (__VLS_ctx.handlePageChange)
};
var __VLS_45;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['home-page']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-section']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['orb-left']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['orb-right']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-content']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-signals']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stage']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-badges']} */ ;
/** @type {__VLS_StyleScopedClasses['card-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['card-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['is-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-visual']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-shape']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-price']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-body']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-head']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stage-floating']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-head']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-value']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['metrics-band']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['section-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-index']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-section']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['section-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-link']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-spotlight']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-top']} */ ;
/** @type {__VLS_StyleScopedClasses['section-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-price-row']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-track']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-list']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-mini-side']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-note']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['section-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['section-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-top']} */ ;
/** @type {__VLS_StyleScopedClasses['capability-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-section']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['search-prefix']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['product-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-item']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['product-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stagger-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-wrap']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ProductCard: ProductCard,
            NoticeBar: NoticeBar,
            app: app,
            auth: auth,
            loading: loading,
            products: products,
            seckillGoods: seckillGoods,
            keyword: keyword,
            categoryId: categoryId,
            activeSort: activeSort,
            pagination: pagination,
            sortOptions: sortOptions,
            heroSignals: heroSignals,
            heroProduct: heroProduct,
            spotlightSeckill: spotlightSeckill,
            secondarySeckill: secondarySeckill,
            overviewStats: overviewStats,
            featureCards: featureCards,
            benefitCards: benefitCards,
            capabilityCards: capabilityCards,
            formatPrice: formatPrice,
            seckillStatus: seckillStatus,
            seckillProgress: seckillProgress,
            handlePageChange: handlePageChange,
            changeSort: changeSort,
            setCategory: setCategory,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map