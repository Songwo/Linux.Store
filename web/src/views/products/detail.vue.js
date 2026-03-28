import { computed, onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import ProductCard from '@/components/ProductCard.vue';
import { mallApi } from '@/api/mall';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
import http from '@/api/http';
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const app = useAppStore();
const cart = useCartStore();
const loading = ref(false);
const detail = ref(null);
const activeImage = ref('');
const skuId = ref();
const quantity = ref(1);
const liked = ref(false);
const usePoints = ref(false);
const isSeckill = computed(() => !!detail.value?.seckill_info);
const isUpcoming = computed(() => {
    if (!detail.value?.seckill_info?.start_at)
        return false;
    return Date.now() < new Date(detail.value.seckill_info.start_at).getTime();
});
const countdownText = ref('');
let timerId;
// Review state
const reviews = ref([]);
const reviewTotal = ref(0);
const reviewPage = ref(1);
const reviewPageSize = ref(5);
const reviewDialogVisible = ref(false);
const submittingReview = ref(false);
const newReview = ref({ rating: 5, content: '' });
async function loadReviews() {
    try {
        const res = await mallApi.getProductReviews(route.params.id, {
            page: reviewPage.value,
            page_size: reviewPageSize.value
        });
        reviews.value = res.list;
        reviewTotal.value = res.total;
    }
    catch (err) {
        console.error('Failed to load reviews', err);
    }
}
function openReviewDialog() {
    newReview.value = { rating: 5, content: '' };
    reviewDialogVisible.value = true;
}
async function submitReview() {
    submittingReview.value = true;
    try {
        await mallApi.submitProductReview(route.params.id, newReview.value.rating, newReview.value.content);
        ElMessage.success('Review submitted successfully');
        reviewDialogVisible.value = false;
        // Reload detail for updated average rating and count
        await loadDetail(false);
        await loadReviews();
    }
    catch (err) {
        ElMessage.error('Failed to submit review');
    }
    finally {
        submittingReview.value = false;
    }
}
function updateTimer() {
    if (!detail.value?.seckill_info)
        return;
    const now = Date.now();
    const start = new Date(detail.value.seckill_info.start_at).getTime();
    const end = new Date(detail.value.seckill_info.end_at).getTime();
    if (now < start) {
        countdownText.value = '距离开始 ' + formatTime(start - now);
    }
    else if (now <= end) {
        countdownText.value = '距结束 ' + formatTime(end - now);
    }
    else {
        detail.value.seckill_info = undefined;
        countdownText.value = '';
    }
}
function formatTime(ms) {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (d > 0)
        return `${d}天 ${h}小时 ${m}分 ${s}秒`;
    return `${h}小时 ${m}分 ${s}秒`;
}
const activeSku = computed(() => detail.value?.skus.find((sku) => sku.id === skuId.value));
const priceValue = computed(() => Number(activeSku.value?.price ?? detail.value?.product.price ?? 0));
const pointsValue = computed(() => Number(activeSku.value?.points_price ?? detail.value?.product.points_price ?? 0));
const maxQuantity = computed(() => {
    const stock = Number(activeSku.value?.stock ?? detail.value?.product.stock ?? 0);
    return stock > 0 ? stock : 1;
});
const walletBalance = computed(() => Number(app.wallet?.balance || auth.profile?.balance || 0).toFixed(2));
const walletPoints = computed(() => app.wallet?.points || auth.profile?.points || 0);
async function loadDetail(withLoading = true) {
    if (withLoading)
        loading.value = true;
    try {
        const result = await mallApi.getProductDetail(Number(route.params.id));
        detail.value = result;
        activeImage.value = result.product.gallery?.[0] || result.product.cover || '';
        skuId.value = result.skus[0]?.id;
        if (auth.isLoggedIn) {
            const status = await mallApi.getWishlistStatus(route.params.id);
            liked.value = status.liked;
        }
        updateTimer();
        if (!timerId)
            timerId = window.setInterval(updateTimer, 1000);
    }
    finally {
        if (withLoading)
            loading.value = false;
    }
}
import { onUnmounted } from 'vue';
onUnmounted(() => {
    if (timerId)
        clearInterval(timerId);
});
async function toggleWishlist() {
    if (!auth.isLoggedIn) {
        ElMessage.warning('Please sign in to add to wishlist');
        router.push('/login');
        return;
    }
    liked.value = !liked.value;
    await mallApi.setWishlist(route.params.id, liked.value);
    ElMessage.success(liked.value ? 'Added to Wishlist' : 'Removed from Wishlist');
}
async function handlePurchase() {
    if (isSeckill.value) {
        router.push('/seckill');
        return;
    }
    await buyNow();
}
async function addToCart() {
    if (!auth.isLoggedIn) {
        ElMessage.warning('Please sign in to add to cart');
        router.push('/login');
        return;
    }
    if (!skuId.value) {
        ElMessage.warning('Please select a variant');
        return;
    }
    try {
        await http.post('/user/cart/items', { sku_id: skuId.value, quantity: quantity.value });
        ElMessage.success('Added to cart');
        cart.refresh();
    }
    catch {
        ElMessage.error('Failed to add to cart');
    }
}
async function buyNow() {
    if (!auth.isLoggedIn) {
        ElMessage.warning('Please sign in to purchase');
        router.push('/login');
        return;
    }
    if (!skuId.value) {
        ElMessage.warning('Please select a variant');
        return;
    }
    await ElMessageBox.confirm('Proceed with creating the order and payment?', 'Confirm Purchase', {
        confirmButtonText: 'Pay Now',
        cancelButtonText: 'Cancel',
        type: 'info',
    });
    const order = await mallApi.createOrder({
        submit_token: crypto.randomUUID().replace(/-/g, ''),
        items: [{ sku_id: skuId.value, quantity: quantity.value }],
        use_points: usePoints.value,
        remark: 'Direct buy',
    });
    await mallApi.payOrder(order.order_no);
    await Promise.all([
        auth.fetchProfile().catch(() => undefined),
        app.refreshUserAssets().catch(() => undefined),
    ]);
    ElMessage.success('Order paid and assets delivered.');
    router.push({ path: '/orders', query: { focus: order.order_no } });
}
onMounted(async () => {
    if (auth.isLoggedIn) {
        await Promise.all([
            auth.fetchProfile().catch(() => undefined),
            app.refreshUserAssets().catch(() => undefined),
        ]);
    }
    await Promise.all([
        loadDetail(),
        loadReviews()
    ]);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['main-image']} */ ;
/** @type {__VLS_StyleScopedClasses['thumb-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['thumb-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['thumb-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-box']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-box']} */ ;
/** @type {__VLS_StyleScopedClasses['wallet-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['sku-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sku-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['wish-glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['wish-glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['main-buy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['related-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['related-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
/** @type {__VLS_StyleScopedClasses['buy-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['wish-glass-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "detail-loading glass-panel" },
    });
    const __VLS_0 = {}.ElSkeleton;
    /** @type {[typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        animated: true,
    }));
    const __VLS_2 = __VLS_1({
        animated: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    {
        const { template: __VLS_thisSlot } = __VLS_3.slots;
        const __VLS_4 = {}.ElSkeletonItem;
        /** @type {[typeof __VLS_components.ElSkeletonItem, typeof __VLS_components.elSkeletonItem, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            variant: "image",
            ...{ style: {} },
        }));
        const __VLS_6 = __VLS_5({
            variant: "image",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    }
    var __VLS_3;
}
else if (__VLS_ctx.detail) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-page fade-in-up" },
    });
    if (__VLS_ctx.detail.seckill_info) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "seckill-banner glass-panel" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "seckill-event" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "flash-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "event-text" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
            ...{ class: "event-name" },
        });
        (__VLS_ctx.detail.seckill_info.campaign_name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "event-timer" },
        });
        (__VLS_ctx.countdownText || (__VLS_ctx.isUpcoming ? '即将开始' : __VLS_ctx.$t('seckill.ongoing')));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "seckill-price-area" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "price-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
            ...{ class: "price-value" },
        });
        (__VLS_ctx.detail.seckill_info.seckill_price.toFixed(2));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "product-hero" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "gallery-panel glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-image" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.activeImage),
        alt: (__VLS_ctx.detail.product.name),
    });
    if (__VLS_ctx.detail.product.gallery && __VLS_ctx.detail.product.gallery.length > 1) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "thumb-row" },
        });
        for (const [image] of __VLS_getVForSourceType((__VLS_ctx.detail.product.gallery))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.detail))
                            return;
                        if (!(__VLS_ctx.detail.product.gallery && __VLS_ctx.detail.product.gallery.length > 1))
                            return;
                        __VLS_ctx.activeImage = image;
                    } },
                key: (image),
                type: "button",
                ...{ class: (['thumb-btn', { active: image === __VLS_ctx.activeImage }]) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (image),
                alt: (__VLS_ctx.detail.product.name),
            });
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "category-kicker" },
    });
    (__VLS_ctx.detail.product.category_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "product-title" },
    });
    (__VLS_ctx.detail.product.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "product-subtitle" },
    });
    (__VLS_ctx.detail.product.subtitle);
    if (__VLS_ctx.detail.product.tags && __VLS_ctx.detail.product.tags.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tag-row" },
        });
        for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.detail.product.tags))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (tag),
                ...{ class: "card-chip" },
            });
            (tag);
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stats-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-box hover-float glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    (__VLS_ctx.$t('detail.rating') || 'Rating');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "value" },
    });
    (__VLS_ctx.detail.product.rating ? __VLS_ctx.detail.product.rating.toFixed(1) : '5.0');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (__VLS_ctx.detail.product.review_count || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-box hover-float glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    (__VLS_ctx.$t('detail.inStock'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "value" },
    });
    (__VLS_ctx.activeSku?.stock ?? __VLS_ctx.detail.product.stock);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-box hover-float glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    (__VLS_ctx.$t('detail.sales'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "value" },
    });
    (__VLS_ctx.detail.product.sales_count);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "price-block glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "price-display" },
    });
    if (__VLS_ctx.priceValue > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
            ...{ class: "current-price" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "symbol" },
        });
        (__VLS_ctx.priceValue.toFixed(2));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
            ...{ class: "current-price" },
        });
        (__VLS_ctx.pointsValue);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "symbol" },
        });
    }
    if (__VLS_ctx.detail.product.origin_price > __VLS_ctx.priceValue) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "origin-price" },
        });
        (__VLS_ctx.detail.product.origin_price.toFixed(2));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "wallet-tip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('detail.yourBalance'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.walletBalance);
    (__VLS_ctx.walletPoints);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "buy-box glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "buy-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "row-label" },
    });
    (__VLS_ctx.$t('detail.variant'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sku-selector" },
    });
    for (const [sku] of __VLS_getVForSourceType((__VLS_ctx.detail.skus))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.detail))
                        return;
                    __VLS_ctx.skuId = sku.id;
                } },
            key: (sku.id),
            ...{ class: (['sku-btn', { 'is-active': __VLS_ctx.skuId === sku.id }]) },
        });
        (sku.title);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "buy-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "row-label" },
    });
    (__VLS_ctx.$t('common.quantity'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "qty-and-points" },
    });
    const __VLS_8 = {}.ElInputNumber;
    /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.quantity),
        min: (1),
        max: (__VLS_ctx.maxQuantity),
        ...{ class: "amount-input" },
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.quantity),
        min: (1),
        max: (__VLS_ctx.maxQuantity),
        ...{ class: "amount-input" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_12 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        modelValue: (__VLS_ctx.usePoints),
        ...{ class: "points-checker" },
    }));
    const __VLS_14 = __VLS_13({
        modelValue: (__VLS_ctx.usePoints),
        ...{ class: "points-checker" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (__VLS_ctx.$t('cart.usePoints'));
    var __VLS_15;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "buy-row notes" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "row-label" },
    });
    (__VLS_ctx.$t('detail.deliveryNote'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "note-text" },
    });
    (__VLS_ctx.detail.product.delivery_note || __VLS_ctx.$t('detail.instantDelivery'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "buy-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleWishlist) },
        ...{ class: "wish-glass-btn hover-float" },
    });
    if (__VLS_ctx.liked) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            viewBox: "0 0 24 24",
            fill: "#10b981",
            stroke: "#10b981",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
            d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            ...{ class: "text-secondary" },
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
            d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
        });
    }
    const __VLS_16 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "main-buy-btn hover-float" },
        disabled: (__VLS_ctx.maxQuantity <= 0 || __VLS_ctx.isUpcoming),
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "main-buy-btn hover-float" },
        disabled: (__VLS_ctx.maxQuantity <= 0 || __VLS_ctx.isUpcoming),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (__VLS_ctx.handlePurchase)
    };
    __VLS_19.slots.default;
    if (__VLS_ctx.detail.seckill_info) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.isUpcoming ? '即将开始' : __VLS_ctx.$t('seckill.grabNow'));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('common.buyNow'));
    }
    var __VLS_19;
    if (!__VLS_ctx.detail.seckill_info) {
        const __VLS_24 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            ...{ 'onClick': {} },
            type: "warning",
            ...{ class: "cart-btn-large hover-float" },
        }));
        const __VLS_26 = __VLS_25({
            ...{ 'onClick': {} },
            type: "warning",
            ...{ class: "cart-btn-large hover-float" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        let __VLS_28;
        let __VLS_29;
        let __VLS_30;
        const __VLS_31 = {
            onClick: (__VLS_ctx.addToCart)
        };
        __VLS_27.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            ...{ class: "w-5 h-5" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
            x1: "3",
            y1: "6",
            x2: "21",
            y2: "6",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M16 10a4 4 0 0 1-8 0",
        });
        var __VLS_27;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "content-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "glass-panel content-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (__VLS_ctx.$t('detail.about'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "markdown-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.detail.product.description || __VLS_ctx.$t('common.empty'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "glass-panel content-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (__VLS_ctx.$t('detail.terms'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "styled-list" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    (__VLS_ctx.detail.product.purchase_note || 'Standard purchase terms apply.');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    (__VLS_ctx.detail.product.service_note || 'Support provided via community forums.');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "reviews-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-head" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "section-title" },
    });
    (__VLS_ctx.$t('detail.reviews') || 'Reviews');
    (__VLS_ctx.detail.product.review_count || 0);
    if (__VLS_ctx.auth.isLoggedIn) {
        const __VLS_32 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            ...{ 'onClick': {} },
            type: "primary",
            round: true,
            plain: true,
        }));
        const __VLS_34 = __VLS_33({
            ...{ 'onClick': {} },
            type: "primary",
            round: true,
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        let __VLS_36;
        let __VLS_37;
        let __VLS_38;
        const __VLS_39 = {
            onClick: (__VLS_ctx.openReviewDialog)
        };
        __VLS_35.slots.default;
        (__VLS_ctx.$t('detail.writeReview') || 'Write a Review');
        var __VLS_35;
    }
    if (__VLS_ctx.reviews.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "reviews-list" },
        });
        for (const [review] of __VLS_getVForSourceType((__VLS_ctx.reviews))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (review.id),
                ...{ class: "review-item glass-panel" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "review-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "reviewer-info" },
            });
            if (review.avatar) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (review.avatar),
                    ...{ class: "reviewer-avatar" },
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "reviewer-avatar text-avatar" },
                });
                (review.nickname.charAt(0).toUpperCase());
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "reviewer-name" },
            });
            (review.nickname);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "review-meta" },
            });
            const __VLS_40 = {}.ElRate;
            /** @type {[typeof __VLS_components.ElRate, typeof __VLS_components.elRate, ]} */ ;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
                modelValue: (review.rating),
                disabled: true,
                textColor: "#ff9900",
            }));
            const __VLS_42 = __VLS_41({
                modelValue: (review.rating),
                disabled: true,
                textColor: "#ff9900",
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "review-date" },
            });
            (new Date(review.created_at).toLocaleDateString());
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "review-content" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (review.content);
        }
        if (__VLS_ctx.reviewTotal > __VLS_ctx.reviewPageSize) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "pagination-wrapper" },
                ...{ style: {} },
            });
            const __VLS_44 = {}.ElPagination;
            /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
                ...{ 'onCurrentChange': {} },
                currentPage: (__VLS_ctx.reviewPage),
                pageSize: (__VLS_ctx.reviewPageSize),
                total: (__VLS_ctx.reviewTotal),
                layout: "prev, pager, next",
            }));
            const __VLS_46 = __VLS_45({
                ...{ 'onCurrentChange': {} },
                currentPage: (__VLS_ctx.reviewPage),
                pageSize: (__VLS_ctx.reviewPageSize),
                total: (__VLS_ctx.reviewTotal),
                layout: "prev, pager, next",
            }, ...__VLS_functionalComponentArgsRest(__VLS_45));
            let __VLS_48;
            let __VLS_49;
            let __VLS_50;
            const __VLS_51 = {
                onCurrentChange: (__VLS_ctx.loadReviews)
            };
            var __VLS_47;
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state glass-panel" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "related-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "section-title" },
    });
    (__VLS_ctx.$t('detail.related'));
    if (__VLS_ctx.detail.related_products?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "related-grid" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.detail.related_products.slice(0, 4)))) {
            /** @type {[typeof ProductCard, ]} */ ;
            // @ts-ignore
            const __VLS_52 = __VLS_asFunctionalComponent(ProductCard, new ProductCard({
                key: (item.id),
                item: (item),
            }));
            const __VLS_53 = __VLS_52({
                key: (item.id),
                item: (item),
            }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state glass-panel" },
        });
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state glass-panel fade-in-up" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.$t('detail.unavailable'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('detail.unavailableDesc'));
    const __VLS_55 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
        ...{ 'onClick': {} },
        round: true,
    }));
    const __VLS_57 = __VLS_56({
        ...{ 'onClick': {} },
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    let __VLS_59;
    let __VLS_60;
    let __VLS_61;
    const __VLS_62 = {
        onClick: (...[$event]) => {
            if (!!(__VLS_ctx.loading))
                return;
            if (!!(__VLS_ctx.detail))
                return;
            __VLS_ctx.$router.push('/products');
        }
    };
    __VLS_58.slots.default;
    (__VLS_ctx.$t('detail.backToCatalog'));
    var __VLS_58;
}
const __VLS_63 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
    modelValue: (__VLS_ctx.reviewDialogVisible),
    title: (__VLS_ctx.$t('detail.writeReview') || 'Write a Review'),
    width: "500px",
    destroyOnClose: true,
}));
const __VLS_65 = __VLS_64({
    modelValue: (__VLS_ctx.reviewDialogVisible),
    title: (__VLS_ctx.$t('detail.writeReview') || 'Write a Review'),
    width: "500px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
__VLS_66.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "review-form" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
const __VLS_67 = {}.ElRate;
/** @type {[typeof __VLS_components.ElRate, typeof __VLS_components.elRate, typeof __VLS_components.ElRate, typeof __VLS_components.elRate, ]} */ ;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
    modelValue: (__VLS_ctx.newReview.rating),
    colors: (['#409eff', '#67c23a', '#FF9900']),
}));
const __VLS_69 = __VLS_68({
    modelValue: (__VLS_ctx.newReview.rating),
    colors: (['#409eff', '#67c23a', '#FF9900']),
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
const __VLS_71 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
    modelValue: (__VLS_ctx.newReview.content),
    type: "textarea",
    rows: (4),
    placeholder: "What do you think about this product?",
    maxlength: "1000",
    showWordLimit: true,
}));
const __VLS_73 = __VLS_72({
    modelValue: (__VLS_ctx.newReview.content),
    type: "textarea",
    rows: (4),
    placeholder: "What do you think about this product?",
    maxlength: "1000",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
{
    const { footer: __VLS_thisSlot } = __VLS_66.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_75 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
        ...{ 'onClick': {} },
    }));
    const __VLS_77 = __VLS_76({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    let __VLS_79;
    let __VLS_80;
    let __VLS_81;
    const __VLS_82 = {
        onClick: (...[$event]) => {
            __VLS_ctx.reviewDialogVisible = false;
        }
    };
    __VLS_78.slots.default;
    var __VLS_78;
    const __VLS_83 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submittingReview),
        disabled: (!__VLS_ctx.newReview.content || __VLS_ctx.newReview.rating === 0),
    }));
    const __VLS_85 = __VLS_84({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submittingReview),
        disabled: (!__VLS_ctx.newReview.content || __VLS_ctx.newReview.rating === 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    let __VLS_87;
    let __VLS_88;
    let __VLS_89;
    const __VLS_90 = {
        onClick: (__VLS_ctx.submitReview)
    };
    __VLS_86.slots.default;
    var __VLS_86;
}
var __VLS_66;
/** @type {__VLS_StyleScopedClasses['detail-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-page']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-event']} */ ;
/** @type {__VLS_StyleScopedClasses['flash-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['event-text']} */ ;
/** @type {__VLS_StyleScopedClasses['event-name']} */ ;
/** @type {__VLS_StyleScopedClasses['event-timer']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-price-area']} */ ;
/** @type {__VLS_StyleScopedClasses['price-label']} */ ;
/** @type {__VLS_StyleScopedClasses['price-value']} */ ;
/** @type {__VLS_StyleScopedClasses['product-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['gallery-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['main-image']} */ ;
/** @type {__VLS_StyleScopedClasses['thumb-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['info-header']} */ ;
/** @type {__VLS_StyleScopedClasses['category-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['product-title']} */ ;
/** @type {__VLS_StyleScopedClasses['product-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-row']} */ ;
/** @type {__VLS_StyleScopedClasses['card-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-box']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-box']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-box']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['price-block']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['price-display']} */ ;
/** @type {__VLS_StyleScopedClasses['current-price']} */ ;
/** @type {__VLS_StyleScopedClasses['symbol']} */ ;
/** @type {__VLS_StyleScopedClasses['current-price']} */ ;
/** @type {__VLS_StyleScopedClasses['symbol']} */ ;
/** @type {__VLS_StyleScopedClasses['origin-price']} */ ;
/** @type {__VLS_StyleScopedClasses['wallet-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['buy-box']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['buy-row']} */ ;
/** @type {__VLS_StyleScopedClasses['row-label']} */ ;
/** @type {__VLS_StyleScopedClasses['sku-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['buy-row']} */ ;
/** @type {__VLS_StyleScopedClasses['row-label']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-and-points']} */ ;
/** @type {__VLS_StyleScopedClasses['amount-input']} */ ;
/** @type {__VLS_StyleScopedClasses['points-checker']} */ ;
/** @type {__VLS_StyleScopedClasses['buy-row']} */ ;
/** @type {__VLS_StyleScopedClasses['notes']} */ ;
/** @type {__VLS_StyleScopedClasses['row-label']} */ ;
/** @type {__VLS_StyleScopedClasses['note-text']} */ ;
/** @type {__VLS_StyleScopedClasses['buy-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['wish-glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['main-buy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-btn-large']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['styled-list']} */ ;
/** @type {__VLS_StyleScopedClasses['reviews-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['reviews-list']} */ ;
/** @type {__VLS_StyleScopedClasses['review-item']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['review-header']} */ ;
/** @type {__VLS_StyleScopedClasses['reviewer-info']} */ ;
/** @type {__VLS_StyleScopedClasses['reviewer-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['reviewer-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['text-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['reviewer-name']} */ ;
/** @type {__VLS_StyleScopedClasses['review-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['review-date']} */ ;
/** @type {__VLS_StyleScopedClasses['review-content']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['related-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['related-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['review-form']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ProductCard: ProductCard,
            auth: auth,
            loading: loading,
            detail: detail,
            activeImage: activeImage,
            skuId: skuId,
            quantity: quantity,
            liked: liked,
            usePoints: usePoints,
            isUpcoming: isUpcoming,
            countdownText: countdownText,
            reviews: reviews,
            reviewTotal: reviewTotal,
            reviewPage: reviewPage,
            reviewPageSize: reviewPageSize,
            reviewDialogVisible: reviewDialogVisible,
            submittingReview: submittingReview,
            newReview: newReview,
            loadReviews: loadReviews,
            openReviewDialog: openReviewDialog,
            submitReview: submitReview,
            activeSku: activeSku,
            priceValue: priceValue,
            pointsValue: pointsValue,
            maxQuantity: maxQuantity,
            walletBalance: walletBalance,
            walletPoints: walletPoints,
            toggleWishlist: toggleWishlist,
            handlePurchase: handlePurchase,
            addToCart: addToCart,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=detail.vue.js.map