import { computed, onMounted, ref } from 'vue';
import http from '@/api/http';
const summary = ref({
    user_count: 0,
    order_count: 0,
    gmv: 0,
    campaign_count: 0,
    today_paid_count: 0,
    pending_pay_count: 0,
    seckill_order_count: 0,
});
const stats = computed(() => [
    { label: 'Total Users', value: String(summary.value.user_count), desc: 'Includes Linux.do OAuth', icon: '👥' },
    { label: 'Total Orders', value: String(summary.value.order_count), desc: `Paid today: ${summary.value.today_paid_count}`, icon: '📦' },
    { label: 'Gross Volume', value: `￥${Number(summary.value.gmv).toFixed(2)}`, desc: `Pending: ${summary.value.pending_pay_count}`, icon: '💳' },
    { label: 'Campaigns', value: String(summary.value.campaign_count), desc: `Seckill orders: ${summary.value.seckill_order_count}`, icon: '🎯' },
]);
const activities = [
    { module: 'Seckill', event: 'Weekend Seckill stock warming up completed.', time: '2026-03-20 18:00' },
    { module: 'Orders', event: 'Delayed order closing worker started successfully.', time: '2026-03-20 18:10' },
    { module: 'Users', event: 'Linux.do OAuth reward points mapping updated.', time: '2026-03-20 19:00' },
];
async function loadDashboard() {
    const res = await http.get('/admin/dashboard');
    summary.value = res.data;
}
onMounted(loadDashboard);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero-content']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-bento']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-bento']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "dashboard-grid fade-in-up" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dash-hero admin-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-bg" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stats-bento" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.stats))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.label),
        ...{ class: "admin-panel stat-card hover-float" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-icon" },
    });
    (item.icon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "stat-value" },
    });
    (item.value);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-sub" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "trend-up" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (item.desc);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "activity-section admin-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "top-glow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "pulse-indicator" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "dot" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "timeline-list" },
});
for (const [act, idx] of __VLS_getVForSourceType((__VLS_ctx.activities))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (idx),
        ...{ class: "timeline-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "time-col" },
    });
    (act.time.split(' ')[1]);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "track-col" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "track-dot" },
    });
    if (idx !== __VLS_ctx.activities.length - 1) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "track-line" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-col" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "module-chip" },
    });
    (act.module);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "event-text" },
    });
    (act.event);
}
/** @type {__VLS_StyleScopedClasses['dashboard-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['dash-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-bento']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-up']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['top-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-list']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-item']} */ ;
/** @type {__VLS_StyleScopedClasses['time-col']} */ ;
/** @type {__VLS_StyleScopedClasses['track-col']} */ ;
/** @type {__VLS_StyleScopedClasses['track-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['track-line']} */ ;
/** @type {__VLS_StyleScopedClasses['content-col']} */ ;
/** @type {__VLS_StyleScopedClasses['module-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['event-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            stats: stats,
            activities: activities,
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