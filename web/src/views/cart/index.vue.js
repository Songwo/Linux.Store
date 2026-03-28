import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import http from '@/api/http';
const router = useRouter();
const loading = ref(false);
const items = ref([]);
const coupons = ref([]);
const selectedCouponId = ref(null);
const usePoints = ref(false);
const effectiveItems = computed(() => items.value.filter((item) => item.checked === 1 || item.Checked === 1));
const totalAmount = computed(() => effectiveItems.value.reduce((sum, item) => sum + (item.price || item.Price || 0) * item.quantity, 0));
const availableCoupons = computed(() => coupons.value.filter((coupon) => coupon.status === 10 && new Date(coupon.expired_at).getTime() > Date.now()));
const selectedCoupon = computed(() => availableCoupons.value.find((coupon) => coupon.id === selectedCouponId.value) || null);
const discountAmount = computed(() => {
    if (!selectedCoupon.value)
        return 0;
    if (totalAmount.value < selectedCoupon.value.threshold_amount)
        return 0;
    return Math.min(selectedCoupon.value.amount, totalAmount.value);
});
const payAmount = computed(() => Math.max(totalAmount.value - discountAmount.value, 0));
async function onCheckChange(item, val) {
    const status = val ? 1 : 0;
    if (item.Checked !== undefined)
        item.Checked = status;
    else
        item.checked = status;
    try {
        const skuId = item.sku_id || item.SKUID;
        await http.put(`/user/cart/items/${skuId}/checked`, { checked: status });
    }
    catch (err) {
        ElMessage.error('Failed to sync checked status');
    }
}
async function updateQty(item) {
    try {
        const skuId = item.sku_id || item.SKUID;
        await http.put(`/user/cart/items/${skuId}/quantity`, { quantity: item.quantity });
    }
    catch (err) {
        ElMessage.error('Failed to sync quantity');
    }
}
async function loadCart() {
    loading.value = true;
    try {
        const res = await http.get('/user/cart');
        items.value = res.data;
        // auto select all on load if unselected
        if (items.value.length > 0 && items.value.every((i) => (i.checked || i.Checked) === 0)) {
            items.value.forEach((i) => {
                if (i.Checked !== undefined)
                    i.Checked = 1;
                else
                    i.checked = 1;
            });
            // Sync all to backend to ensure checkout works
            Promise.all(items.value.map(i => {
                const skuId = i.sku_id;
                return http.put(`/user/cart/items/${skuId}/checked`, { checked: 1 });
            })).catch(err => console.error('Failed to sync auto-checked items', err));
        }
    }
    finally {
        loading.value = false;
    }
}
async function loadCoupons() {
    const res = await http.get('/user/coupons');
    coupons.value = res.data;
}
async function seedDemoItem() {
    await http.post('/user/cart/items', { sku_id: 1, quantity: 1, checked: 1 });
    ElMessage.success('Demo item added to cart');
    await loadCart();
}
async function remove(skuId) {
    await http.delete(`/user/cart/items/${skuId}`);
    ElMessage.success('Item removed');
    await loadCart();
}
async function submitOrder() {
    router.push('/checkout');
}
onMounted(async () => {
    await loadCart();
    await loadCoupons();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['outline']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-price']} */ ;
/** @type {__VLS_StyleScopedClasses['item-subtotal']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['final-price']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-left']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-right']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-price']} */ ;
/** @type {__VLS_StyleScopedClasses['item-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['item-subtotal']} */ ;
/** @type {__VLS_StyleScopedClasses['item-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "cart-page fade-in-up" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "page-title" },
});
(__VLS_ctx.$t('cart.pageTitle'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-desc" },
});
(__VLS_ctx.$t('cart.pageDesc'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.seedDemoItem) },
    ...{ class: "action-btn outline hover-float" },
});
(__VLS_ctx.$t('cart.addDemo'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cart-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
if (__VLS_ctx.items.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.$t('cart.emptyTitle'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('cart.emptyDesc'));
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: "/products",
    }));
    const __VLS_2 = __VLS_1({
        to: "/products",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        type: "primary",
        round: true,
    }));
    const __VLS_6 = __VLS_5({
        type: "primary",
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    (__VLS_ctx.$t('cart.browseCatalog'));
    var __VLS_7;
    var __VLS_3;
}
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.items))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.sku_id),
        ...{ class: "cart-item glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-checkbox" },
    });
    const __VLS_8 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onChange': {} },
        modelValue: ((item.checked || item.Checked) === 1),
        size: "large",
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onChange': {} },
        modelValue: ((item.checked || item.Checked) === 1),
        size: "large",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onChange: (...[$event]) => {
            __VLS_ctx.onCheckChange(item, $event);
        }
    };
    var __VLS_11;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-cover" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (item.cover || item.Cover),
        alt: (item.product_name || item.ProductName),
        ...{ class: "cover-img" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "item-name" },
    });
    (item.product_name || item.ProductName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "item-sku" },
    });
    (item.sku_title || item.SKUTitle);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-price" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    (__VLS_ctx.$t('common.price'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    ((item.price || item.Price || 0).toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-qty" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    (__VLS_ctx.$t('common.quantity'));
    const __VLS_16 = {}.ElInputNumber;
    /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onChange': {} },
        modelValue: (item.quantity),
        min: (1),
        size: "small",
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onChange': {} },
        modelValue: (item.quantity),
        min: (1),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onChange: (...[$event]) => {
            __VLS_ctx.updateQty(item);
        }
    };
    var __VLS_19;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-subtotal" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    (__VLS_ctx.$t('cart.subtotal'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (((item.price || item.Price || 0) * (item.quantity || 0)).toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.remove(item.sku_id);
            } },
        ...{ class: "icon-btn danger hover-float" },
        title: "Remove item",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        ...{ class: "w-5 h-5" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polyline, __VLS_intrinsicElements.polyline)({
        points: "3 6 5 6 21 6",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
        d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "checkout-bar glass-panel hover-float" },
    ...{ class: ({ 'is-visible': __VLS_ctx.items.length > 0 }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "checkout-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-stat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
(__VLS_ctx.$t('cart.standardTotal'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
    ...{ class: "value" },
});
((__VLS_ctx.totalAmount || 0).toFixed(2));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "checkout-right" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "final-price" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
(__VLS_ctx.$t('cart.standardTotal'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
    ...{ class: "amount" },
});
((__VLS_ctx.totalAmount || 0).toFixed(2));
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.router.push('/checkout');
        } },
    ...{ class: "checkout-btn" },
    disabled: (__VLS_ctx.effectiveItems.length === 0),
});
(__VLS_ctx.$t('cart.checkout', { n: __VLS_ctx.effectiveItems.length }));
/** @type {__VLS_StyleScopedClasses['cart-page']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['header-text']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['outline']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-list']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['item-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['item-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-img']} */ ;
/** @type {__VLS_StyleScopedClasses['item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['item-name']} */ ;
/** @type {__VLS_StyleScopedClasses['item-sku']} */ ;
/** @type {__VLS_StyleScopedClasses['item-price']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['item-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['item-subtotal']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-left']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-right']} */ ;
/** @type {__VLS_StyleScopedClasses['final-price']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['amount']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            loading: loading,
            items: items,
            effectiveItems: effectiveItems,
            totalAmount: totalAmount,
            onCheckChange: onCheckChange,
            updateQty: updateQty,
            seedDemoItem: seedDemoItem,
            remove: remove,
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