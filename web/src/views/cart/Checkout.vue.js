import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import http from '@/api/http';
const router = useRouter();
const loading = ref(false);
const submitting = ref(false);
const items = ref([]);
const coupons = ref([]);
const selectedCouponId = ref(null);
const usePoints = ref(false);
const remark = ref('');
const totalAmount = computed(() => items.value.reduce((sum, item) => sum + (item.price || item.Price || 0) * item.quantity, 0));
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
async function loadData() {
    loading.value = true;
    try {
        const [cartRes, couponRes] = await Promise.all([
            http.get('/user/cart'),
            http.get('/user/coupons')
        ]);
        // Only items that were checked in the cart
        items.value = cartRes.data.filter((i) => (i.checked === 1 || i.Checked === 1));
        coupons.value = couponRes.data;
        if (items.value.length === 0) {
            ElMessage.warning('No items selected for checkout');
            router.replace('/cart');
        }
    }
    finally {
        loading.value = false;
    }
}
async function confirmOrder() {
    submitting.value = true;
    try {
        const res = await http.post('/user/orders', {
            submit_token: crypto.randomUUID().replace(/-/g, ''),
            items: items.value.map((item) => ({
                sku_id: item.sku_id || item.SKUID,
                quantity: item.quantity || item.Quantity
            })),
            coupon_id: selectedCoupon.value?.id,
            use_points: usePoints.value,
            remark: remark.value || 'Web checkout',
        });
        ElMessage.success('Order created successfully');
        router.push({ path: '/orders', query: { focus: res.data.order_no } });
    }
    finally {
        submitting.value = false;
    }
}
onMounted(loadData);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['item-img-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['shipping-text']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-row']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-row']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-container']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "checkout-page fade-in-up" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "checkout-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "checkout-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.router.back();
        } },
    ...{ class: "back-link" },
});
(__VLS_ctx.$t('common.back'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "page-title" },
});
(__VLS_ctx.$t('cart.checkoutTitle'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "glass-panel checkout-box" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "box-title" },
});
(__VLS_ctx.$t('cart.orderReview'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "checkout-items" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.items))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.sku_id),
        ...{ class: "checkout-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-img-mini" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (item.cover || item.Cover),
        alt: (item.product_name || item.ProductName),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "item-name" },
    });
    (item.product_name || item.ProductName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "item-sku" },
    });
    (item.sku_title || item.SKUTitle);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-price-qty" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "item-qty" },
    });
    (item.quantity);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "item-total" },
    });
    (((item.price || item.Price || 0) * (item.quantity || 0)).toFixed(2));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "checkout-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "box-title" },
});
(__VLS_ctx.$t('cart.shippingInfo'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "shipping-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "shipping-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "shipping-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.$t('cart.instantDigital'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.$t('detail.instantDelivery'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "checkout-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "box-title" },
});
(__VLS_ctx.$t('cart.remark'));
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.remark),
    type: "textarea",
    rows: (2),
    placeholder: (__VLS_ctx.$t('cart.placeholderRemark')),
    ...{ class: "glass-textarea" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.remark),
    type: "textarea",
    rows: (2),
    placeholder: (__VLS_ctx.$t('cart.placeholderRemark')),
    ...{ class: "glass-textarea" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "checkout-sidebar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "glass-panel summary-box sticky-top" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "box-title" },
});
(__VLS_ctx.$t('common.total'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-rows" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.$t('cart.standardTotal'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
((__VLS_ctx.totalAmount || 0).toFixed(2));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-row highlight" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.$t('cart.discount'));
const __VLS_4 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    modelValue: (__VLS_ctx.selectedCouponId),
    placeholder: (__VLS_ctx.$t('cart.noCoupon')),
    clearable: true,
    ...{ class: "glass-select-mini" },
}));
const __VLS_6 = __VLS_5({
    modelValue: (__VLS_ctx.selectedCouponId),
    placeholder: (__VLS_ctx.$t('cart.noCoupon')),
    clearable: true,
    ...{ class: "glass-select-mini" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
for (const [coupon] of __VLS_getVForSourceType((__VLS_ctx.availableCoupons))) {
    const __VLS_8 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (coupon.id),
        label: (`${coupon.template_name} (-¥${coupon.amount})`),
        value: (coupon.id),
    }));
    const __VLS_10 = __VLS_9({
        key: (coupon.id),
        label: (`${coupon.template_name} (-¥${coupon.amount})`),
        value: (coupon.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_7;
if (__VLS_ctx.discountAmount > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-row text-green" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('cart.saved'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    ((__VLS_ctx.discountAmount || 0).toFixed(2));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-row" },
});
const __VLS_12 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.usePoints),
    size: "large",
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.usePoints),
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
(__VLS_ctx.$t('cart.usePoints'));
var __VLS_15;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-divider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-row final" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.$t('cart.totalIncluded'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
    ...{ class: "final-amount" },
});
((__VLS_ctx.payAmount || 0).toFixed(2));
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.confirmOrder) },
    ...{ class: "submit-btn" },
    disabled: (__VLS_ctx.submitting || __VLS_ctx.items.length === 0),
});
(__VLS_ctx.submitting ? '...' : __VLS_ctx.$t('cart.confirmOrder'));
/** @type {__VLS_StyleScopedClasses['checkout-page']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-container']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-main']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['back-link']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-box']} */ ;
/** @type {__VLS_StyleScopedClasses['box-title']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-items']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-img-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['item-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['item-name']} */ ;
/** @type {__VLS_StyleScopedClasses['item-sku']} */ ;
/** @type {__VLS_StyleScopedClasses['item-price-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['item-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['item-total']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-section']} */ ;
/** @type {__VLS_StyleScopedClasses['box-title']} */ ;
/** @type {__VLS_StyleScopedClasses['shipping-card']} */ ;
/** @type {__VLS_StyleScopedClasses['shipping-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['shipping-text']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-section']} */ ;
/** @type {__VLS_StyleScopedClasses['box-title']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-box']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-top']} */ ;
/** @type {__VLS_StyleScopedClasses['box-title']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-rows']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-row']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-row']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-select-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-row']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-row']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-row']} */ ;
/** @type {__VLS_StyleScopedClasses['final']} */ ;
/** @type {__VLS_StyleScopedClasses['final-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            submitting: submitting,
            items: items,
            selectedCouponId: selectedCouponId,
            usePoints: usePoints,
            remark: remark,
            totalAmount: totalAmount,
            availableCoupons: availableCoupons,
            discountAmount: discountAmount,
            payAmount: payAmount,
            confirmOrder: confirmOrder,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=Checkout.vue.js.map