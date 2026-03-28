import { onMounted, ref } from 'vue';
import { mallApi } from '@/api/mall';
const currentPoints = ref(0);
const flows = ref([]);
async function loadPoints() {
    try {
        const wallet = await mallApi.getWalletSummary();
        currentPoints.value = wallet.points;
    }
    catch {
        // fallback
    }
}
async function loadFlows() {
    try {
        const result = await mallApi.getWalletFlows({ type: 'points', page: 1, page_size: 20 });
        flows.value = result.list;
    }
    catch {
        // fallback
    }
}
onMounted(async () => {
    await loadPoints();
    await loadFlows();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['flow-item']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-info']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['income']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['expense']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['points-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-section']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-value']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "points-page fade-in-up" },
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
(__VLS_ctx.$t('points.pageTitle'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-desc" },
});
(__VLS_ctx.$t('points.pageDesc'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "points-hero glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-glow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "hero-label" },
});
(__VLS_ctx.$t('points.currentPoints'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-value" },
});
(__VLS_ctx.currentPoints);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flow-section glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
(__VLS_ctx.$t('points.flowHistory'));
if (__VLS_ctx.flows.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flow-list" },
    });
    for (const [flow, idx] of __VLS_getVForSourceType((__VLS_ctx.flows))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (idx),
            ...{ class: "flow-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flow-icon" },
            ...{ class: (flow.direction > 0 ? 'income' : 'expense') },
        });
        (flow.direction > 0 ? '+' : '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flow-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (flow.description || flow.biz_type);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "flow-time" },
        });
        (flow.created_at);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flow-amount" },
            ...{ class: (flow.direction > 0 ? 'income' : 'expense') },
        });
        (flow.direction > 0 ? '+' : '-');
        (flow.points);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('common.empty'));
}
/** @type {__VLS_StyleScopedClasses['points-page']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['header-text']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['points-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-content']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-label']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-value']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-section']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-list']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-item']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-info']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-time']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            currentPoints: currentPoints,
            flows: flows,
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