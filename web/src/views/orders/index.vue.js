import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { mallApi } from '@/api/mall';
import OrderDetailPanel from '@/components/OrderDetailPanel.vue';
import { useAppStore } from '@/stores/app';
import { useAuthStore } from '@/stores/auth';
const route = useRoute();
const router = useRouter();
const app = useAppStore();
const auth = useAuthStore();
const loading = ref(false);
const orders = ref([]);
const activeStatus = ref(route.query.status || 'all');
const selectedOrderNo = ref(typeof route.query.focus === 'string' ? route.query.focus : '');
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref(null);
const detailPanelRef = ref(null);
const isDesktop = ref(true);
const tabs = [
    { label: 'All Orders', val: 'all' },
    { label: 'Pending', val: '10' },
    { label: 'Paid', val: '20' },
    { label: 'Completed', val: '50' },
    { label: 'Canceled', val: '30' },
];
const selectedOrder = computed(() => orders.value.find((order) => order.order_no === selectedOrderNo.value) || null);
const pendingCount = computed(() => orders.value.filter((order) => order.status === 10).length);
const completedCount = computed(() => orders.value.filter((order) => order.status === 50 || order.status === 20).length);
function statusText(status) {
    return { 10: 'Pending pay', 20: 'Paid', 30: 'Canceled', 40: 'Closed', 50: 'Completed' }[status] || 'Unknown';
}
function formatDate(value) {
    return value ? dayjs(value).format('MMM D, YYYY  |  HH:mm') : '-';
}
function initials(value) {
    return (value || 'IT').slice(0, 2).toUpperCase();
}
function handleResize() {
    isDesktop.value = window.innerWidth >= 1080;
    if (isDesktop.value) {
        detailVisible.value = false;
    }
}
async function syncSelectedOrder(preferredOrderNo) {
    if (!orders.value.length) {
        selectedOrderNo.value = '';
        detailData.value = null;
        detailVisible.value = false;
        return;
    }
    const preferred = preferredOrderNo && orders.value.some((order) => order.order_no === preferredOrderNo) ? preferredOrderNo : '';
    const current = selectedOrderNo.value && orders.value.some((order) => order.order_no === selectedOrderNo.value) ? selectedOrderNo.value : '';
    const nextOrderNo = preferred || current || orders.value[0].order_no;
    await selectOrder(nextOrderNo, {
        openDrawer: false,
        forceReload: detailData.value?.order?.order_no !== nextOrderNo,
    });
}
async function loadOrders() {
    loading.value = true;
    try {
        orders.value = await mallApi.getOrders(activeStatus.value);
        await syncSelectedOrder(typeof route.query.focus === 'string' ? route.query.focus : '');
    }
    finally {
        loading.value = false;
    }
}
async function selectOrder(orderNo, options = {}) {
    if (!orderNo) {
        return;
    }
    const { openDrawer = !isDesktop.value, forceReload = false } = options;
    selectedOrderNo.value = orderNo;
    if (openDrawer && !isDesktop.value) {
        detailVisible.value = true;
    }
    if (!forceReload && detailData.value?.order?.order_no === orderNo) {
        return;
    }
    detailLoading.value = true;
    try {
        detailData.value = await mallApi.getOrderDetail(orderNo);
    }
    finally {
        detailLoading.value = false;
    }
}
async function viewDetail(orderNo) {
    await selectOrder(orderNo, { openDrawer: true, forceReload: true });
}
async function pay(orderNo) {
    await mallApi.payOrder(orderNo);
    await Promise.all([auth.fetchProfile().catch(() => undefined), app.refreshUserAssets().catch(() => undefined)]);
    ElMessage.success({ message: 'Order paid successfully', customClass: 'premium-toast' });
    await loadOrders();
    await selectOrder(orderNo, { openDrawer: !isDesktop.value, forceReload: true });
}
async function cancel(orderNo) {
    await mallApi.cancelOrder(orderNo);
    ElMessage.success({ message: 'Order canceled', customClass: 'premium-toast' });
    await loadOrders();
}
async function openCurrentDetail() {
    if (!selectedOrderNo.value) {
        return;
    }
    if (isDesktop.value) {
        await nextTick();
        detailPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }
    detailVisible.value = true;
}
function openCards(orderNo) {
    detailVisible.value = false;
    router.push({ path: '/cards', query: { order_no: orderNo } });
}
function switchStatus(status) {
    if (activeStatus.value === status) {
        return;
    }
    activeStatus.value = status;
    void loadOrders();
}
watch(() => route.query.focus, async (orderNo) => {
    if (typeof orderNo === 'string' && orderNo && orders.value.length) {
        await selectOrder(orderNo, { openDrawer: !isDesktop.value, forceReload: true });
    }
});
watch(() => route.query.status, (status) => {
    const nextStatus = typeof status === 'string' ? status : 'all';
    if (nextStatus !== activeStatus.value) {
        activeStatus.value = nextStatus;
        void loadOrders();
    }
});
onMounted(async () => {
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    await loadOrders();
});
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['summary-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['current-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['current-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['order-card']} */ ;
/** @type {__VLS_StyleScopedClasses['order-card']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['order-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['p-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['order-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['order-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['total-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-intro']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-intro']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-focus-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-focus-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-focus-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-focus-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-focus-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['orders-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-column']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-focus-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['current-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['order-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['order-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-row']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['order-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['item-price']} */ ;
/** @type {__VLS_StyleScopedClasses['order-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "orders-page fade-in-up" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "header-kicker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "page-title" },
});
(__VLS_ctx.$t('orders.pageTitle'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-desc" },
});
(__VLS_ctx.$t('orders.pageDesc'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-summary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-pill" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.orders.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-pill" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.pendingCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-pill" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.completedCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "status-tabs glass-panel" },
});
for (const [tab] of __VLS_getVForSourceType((__VLS_ctx.tabs))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.switchStatus(tab.val);
            } },
        key: (tab.val),
        ...{ class: (['tab-btn', { 'is-active': __VLS_ctx.activeStatus === tab.val }]) },
    });
    (tab.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.loadOrders) },
    ...{ class: "action-btn outline" },
});
(__VLS_ctx.$t('orders.refreshOrders'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "orders-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "orders-column" },
});
if (__VLS_ctx.selectedOrder) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "current-strip glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "strip-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.selectedOrder.order_no);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.statusText(__VLS_ctx.selectedOrder.status));
    (__VLS_ctx.formatDate(__VLS_ctx.selectedOrder.created_at));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.openCurrentDetail) },
        ...{ class: "glass-btn" },
    });
    (__VLS_ctx.isDesktop ? 'Jump to detail' : 'Open detail');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "order-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
if (__VLS_ctx.loading && __VLS_ctx.orders.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-list" },
    });
    for (const [index] of __VLS_getVForSourceType((3))) {
        const __VLS_0 = {}.ElSkeleton;
        /** @type {[typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            key: (index),
            animated: true,
            ...{ class: "glass-panel skeleton-card" },
        }));
        const __VLS_2 = __VLS_1({
            key: (index),
            animated: true,
            ...{ class: "glass-panel skeleton-card" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
}
else if (__VLS_ctx.orders.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "order-grid" },
    });
    for (const [order] of __VLS_getVForSourceType((__VLS_ctx.orders))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && __VLS_ctx.orders.length === 0))
                        return;
                    if (!(__VLS_ctx.orders.length))
                        return;
                    __VLS_ctx.selectOrder(order.order_no);
                } },
            key: (order.order_no),
            ...{ class: (['order-card', 'glass-panel', { 'is-active': __VLS_ctx.selectedOrderNo === order.order_no }]) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "order-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "order-meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "order-no" },
        });
        (order.order_no);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "order-time" },
        });
        (__VLS_ctx.formatDate(order.created_at));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "order-status-badge" },
            ...{ class: (`status-${order.status}`) },
        });
        (__VLS_ctx.statusText(order.status));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "order-items" },
        });
        for (const [item] of __VLS_getVForSourceType((order.items.slice(0, 2)))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (item.id),
                ...{ class: "item-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-visual" },
            });
            (__VLS_ctx.initials(item.product_name));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-info" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (item.product_name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (item.sku_title);
            (item.quantity);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-price" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "p-amount" },
            });
            (Number(item.total_amount).toFixed(2));
            if (item.points_price) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "p-points" },
                });
                (item.points_price);
            }
        }
        if (order.items.length > 2) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "more-items" },
            });
            (order.items.length - 2);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "order-footer" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "order-summary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
            ...{ class: "total-amount" },
        });
        (Number(order.pay_amount).toFixed(2));
        if (order.points_amount) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "total-points" },
            });
            (order.points_amount);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "order-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && __VLS_ctx.orders.length === 0))
                        return;
                    if (!(__VLS_ctx.orders.length))
                        return;
                    __VLS_ctx.viewDetail(order.order_no);
                } },
            ...{ class: "glass-btn" },
        });
        (__VLS_ctx.$t('common.details'));
        if (order.status === 10) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading && __VLS_ctx.orders.length === 0))
                            return;
                        if (!(__VLS_ctx.orders.length))
                            return;
                        if (!(order.status === 10))
                            return;
                        __VLS_ctx.cancel(order.order_no);
                    } },
                ...{ class: "glass-btn danger" },
            });
        }
        if (order.status === 10) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading && __VLS_ctx.orders.length === 0))
                            return;
                        if (!(__VLS_ctx.orders.length))
                            return;
                        if (!(order.status === 10))
                            return;
                        __VLS_ctx.pay(order.order_no);
                    } },
                ...{ class: "primary-btn" },
            });
            (__VLS_ctx.$t('orders.payNow'));
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.$t('orders.noOrders'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('orders.noOrdersDesc'));
}
if (__VLS_ctx.orders.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
        ...{ class: "detail-column" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-sticky" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-intro glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-kicker" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (__VLS_ctx.selectedOrder ? `#${__VLS_ctx.selectedOrder.order_no}` : 'Order detail');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "detailPanelRef",
        ...{ class: "detail-panel glass-panel" },
    });
    /** @type {typeof __VLS_ctx.detailPanelRef} */ ;
    /** @type {[typeof OrderDetailPanel, ]} */ ;
    // @ts-ignore
    const __VLS_4 = __VLS_asFunctionalComponent(OrderDetailPanel, new OrderDetailPanel({
        ...{ 'onOpenCards': {} },
        ...{ 'onPay': {} },
        detailData: (__VLS_ctx.detailData),
        detailLoading: (__VLS_ctx.detailLoading),
    }));
    const __VLS_5 = __VLS_4({
        ...{ 'onOpenCards': {} },
        ...{ 'onPay': {} },
        detailData: (__VLS_ctx.detailData),
        detailLoading: (__VLS_ctx.detailLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_4));
    let __VLS_7;
    let __VLS_8;
    let __VLS_9;
    const __VLS_10 = {
        onOpenCards: (__VLS_ctx.openCards)
    };
    const __VLS_11 = {
        onPay: (__VLS_ctx.pay)
    };
    var __VLS_6;
}
if (!__VLS_ctx.isDesktop && __VLS_ctx.detailData) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.openCurrentDetail) },
        ...{ class: "mobile-focus-bar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.order.order_no);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
}
if (!__VLS_ctx.isDesktop) {
    const __VLS_12 = {}.ElDrawer;
    /** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        modelValue: (__VLS_ctx.detailVisible),
        size: "92%",
        ...{ class: "premium-drawer" },
        showClose: (false),
    }));
    const __VLS_14 = __VLS_13({
        modelValue: (__VLS_ctx.detailVisible),
        size: "92%",
        ...{ class: "premium-drawer" },
        showClose: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_15.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "drawer-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "detail-kicker" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        (__VLS_ctx.detailData?.order?.order_no ? `#${__VLS_ctx.detailData.order.order_no}` : __VLS_ctx.$t('orders.orderDetail'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.isDesktop))
                        return;
                    __VLS_ctx.detailVisible = false;
                } },
            ...{ class: "close-btn" },
        });
    }
    /** @type {[typeof OrderDetailPanel, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(OrderDetailPanel, new OrderDetailPanel({
        ...{ 'onOpenCards': {} },
        ...{ 'onPay': {} },
        detailData: (__VLS_ctx.detailData),
        detailLoading: (__VLS_ctx.detailLoading),
    }));
    const __VLS_17 = __VLS_16({
        ...{ 'onOpenCards': {} },
        ...{ 'onPay': {} },
        detailData: (__VLS_ctx.detailData),
        detailLoading: (__VLS_ctx.detailLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    let __VLS_19;
    let __VLS_20;
    let __VLS_21;
    const __VLS_22 = {
        onOpenCards: (__VLS_ctx.openCards)
    };
    const __VLS_23 = {
        onPay: (__VLS_ctx.pay)
    };
    var __VLS_18;
    var __VLS_15;
}
/** @type {__VLS_StyleScopedClasses['orders-page']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['header-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['header-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['header-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['outline']} */ ;
/** @type {__VLS_StyleScopedClasses['orders-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['orders-column']} */ ;
/** @type {__VLS_StyleScopedClasses['current-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['strip-label']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['order-list']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-list']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-card']} */ ;
/** @type {__VLS_StyleScopedClasses['order-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['order-header']} */ ;
/** @type {__VLS_StyleScopedClasses['order-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['order-no']} */ ;
/** @type {__VLS_StyleScopedClasses['order-time']} */ ;
/** @type {__VLS_StyleScopedClasses['order-status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['order-items']} */ ;
/** @type {__VLS_StyleScopedClasses['item-row']} */ ;
/** @type {__VLS_StyleScopedClasses['item-visual']} */ ;
/** @type {__VLS_StyleScopedClasses['item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['item-price']} */ ;
/** @type {__VLS_StyleScopedClasses['p-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['p-points']} */ ;
/** @type {__VLS_StyleScopedClasses['more-items']} */ ;
/** @type {__VLS_StyleScopedClasses['order-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['order-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['total-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['total-points']} */ ;
/** @type {__VLS_StyleScopedClasses['order-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-column']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-intro']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-focus-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['premium-drawer']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            OrderDetailPanel: OrderDetailPanel,
            loading: loading,
            orders: orders,
            activeStatus: activeStatus,
            selectedOrderNo: selectedOrderNo,
            detailVisible: detailVisible,
            detailLoading: detailLoading,
            detailData: detailData,
            detailPanelRef: detailPanelRef,
            isDesktop: isDesktop,
            tabs: tabs,
            selectedOrder: selectedOrder,
            pendingCount: pendingCount,
            completedCount: completedCount,
            statusText: statusText,
            formatDate: formatDate,
            initials: initials,
            loadOrders: loadOrders,
            selectOrder: selectOrder,
            viewDetail: viewDetail,
            pay: pay,
            cancel: cancel,
            openCurrentDetail: openCurrentDetail,
            openCards: openCards,
            switchStatus: switchStatus,
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