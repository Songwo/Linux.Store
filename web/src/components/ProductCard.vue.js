import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { mallApi } from '@/api/mall';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import http from '@/api/http';
const props = withDefaults(defineProps(), {
    liked: false,
    showWishlist: true,
});
const emit = defineEmits();
const auth = useAuthStore();
const cart = useCartStore();
const router = useRouter();
const likedState = ref(props.liked);
const wishlistLoading = ref(false);
const addingToCart = ref(false);
watch(() => props.liked, (value) => {
    likedState.value = value;
});
const stockText = computed(() => (props.item.stock > 0 ? `Stock ${props.item.stock}` : 'Out of Stock'));
const typeText = computed(() => {
    switch (props.item.type) {
        case 'points':
            return 'Points Item';
        case 'limited':
            return 'Limited Edition';
        default:
            return 'Standard';
    }
});
async function toggleWishlist() {
    if (wishlistLoading.value)
        return;
    if (!auth.isLoggedIn) {
        ElMessage.warning('Please sign in to add to wishlist');
        router.push('/login');
        return;
    }
    wishlistLoading.value = true;
    const next = !likedState.value;
    try {
        await mallApi.setWishlist(props.item.id, next);
        likedState.value = next;
        emit('wishlist-change', next);
        ElMessage.success(next ? 'Added to wishlist' : 'Removed from wishlist');
    }
    finally {
        wishlistLoading.value = false;
    }
}
async function addToCart() {
    if (addingToCart.value)
        return;
    if (!auth.isLoggedIn) {
        ElMessage.warning('Please sign in to add to cart');
        router.push('/login');
        return;
    }
    if (!props.item.default_sku_id) {
        router.push(`/products/${props.item.id}`);
        return;
    }
    addingToCart.value = true;
    try {
        await http.post('/user/cart/items', { sku_id: props.item.default_sku_id, quantity: 1 });
        ElMessage.success('Added to cart');
        await cart.refresh();
    }
    catch {
        ElMessage.error('Failed to add to cart');
    }
    finally {
        addingToCart.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    liked: false,
    showWishlist: true,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['cover-image']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-fallback']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-image']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-fallback']} */ ;
/** @type {__VLS_StyleScopedClasses['wish-glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['wish-glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['wish-glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['title-link']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-row']} */ ;
/** @type {__VLS_StyleScopedClasses['price-box']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-buy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-buy-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "product-card glass-panel hover-float" },
});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: (`/products/${__VLS_ctx.item.id}`),
    ...{ class: "cover-wrap" },
}));
const __VLS_2 = __VLS_1({
    to: (`/products/${__VLS_ctx.item.id}`),
    ...{ class: "cover-wrap" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.item.cover) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.item.cover),
        alt: (__VLS_ctx.item.name),
        ...{ class: "cover-image" },
        loading: "lazy",
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cover-fallback" },
    });
    (__VLS_ctx.item.name.slice(0, 2));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cover-tags" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "card-chip" },
});
(__VLS_ctx.item.category_name || 'Featured');
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "card-chip is-ghost" },
});
(__VLS_ctx.stockText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hover-overlay fade-in-up" },
});
if (__VLS_ctx.showWishlist) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleWishlist) },
        ...{ class: "wish-glass-btn" },
        disabled: (__VLS_ctx.wishlistLoading),
    });
    if (__VLS_ctx.likedState) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            viewBox: "0 0 24 24",
            fill: "#10b981",
            stroke: "#10b981",
            'stroke-width': "2",
            ...{ class: "w-5 h-5" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
            d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            ...{ class: "w-5 h-5" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
            d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.addToCart) },
    ...{ class: "wish-glass-btn" },
    disabled: (__VLS_ctx.addingToCart),
});
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
const __VLS_4 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
    ...{ class: "explore-btn" },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
    ...{ class: "explore-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.push(`/products/${__VLS_ctx.item.id}`);
    }
};
__VLS_7.slots.default;
(__VLS_ctx.addingToCart ? 'Processing' : 'View Details');
var __VLS_7;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-body" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-row" },
});
const __VLS_12 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    to: (`/products/${__VLS_ctx.item.id}`),
    ...{ class: "title-link" },
}));
const __VLS_14 = __VLS_13({
    to: (`/products/${__VLS_ctx.item.id}`),
    ...{ class: "title-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
(__VLS_ctx.item.name);
var __VLS_15;
if (__VLS_ctx.item.is_hot) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "mini-badge" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "subtitle" },
});
(__VLS_ctx.item.subtitle || 'Digital goods for builders.');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meta-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    ...{ class: "w-3 h-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
    d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
});
(__VLS_ctx.item.sales_count);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    ...{ class: "w-3 h-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
    d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.circle, __VLS_intrinsicElements.circle)({
    cx: "12",
    cy: "12",
    r: "3",
});
(__VLS_ctx.item.view_count);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.typeText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "price-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "price-box" },
});
if (__VLS_ctx.item.price > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.item.price.toFixed(2));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.item.points_price);
}
if (__VLS_ctx.item.origin_price > __VLS_ctx.item.price) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "origin-price" },
    });
    (__VLS_ctx.item.origin_price.toFixed(2));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.addToCart) },
    ...{ class: "quick-buy-btn" },
    disabled: (__VLS_ctx.addingToCart || __VLS_ctx.item.stock <= 0),
});
(__VLS_ctx.addingToCart ? 'Adding...' : __VLS_ctx.item.stock > 0 ? 'Quick Add' : 'Sold Out');
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-image']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-fallback']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['card-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['card-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['is-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['wish-glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['wish-glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['explore-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['title-link']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-row']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['price-row']} */ ;
/** @type {__VLS_StyleScopedClasses['price-box']} */ ;
/** @type {__VLS_StyleScopedClasses['origin-price']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-buy-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            likedState: likedState,
            wishlistLoading: wishlistLoading,
            addingToCart: addingToCart,
            stockText: stockText,
            typeText: typeText,
            toggleWishlist: toggleWishlist,
            addToCart: addToCart,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ProductCard.vue.js.map