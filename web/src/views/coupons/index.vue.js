import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import http from '@/api/http';
const { t } = useI18n();
const coupons = ref([]);
const templates = ref([]);
async function loadCoupons() {
    const res = await http.get('/user/coupons');
    coupons.value = res.data;
}
async function loadTemplates() {
    const res = await http.get('/coupon/templates');
    templates.value = res.data;
}
function isClaimed(templateId) {
    return coupons.value.some((c) => c.template_id === templateId);
}
async function claim(templateId) {
    await http.post('/user/coupons/claim', { template_id: templateId });
    ElMessage.success(t('coupons.claimed'));
    await loadCoupons();
}
function statusText(status) {
    return { 10: t('coupons.unused'), 20: t('coupons.locked'), 30: t('coupons.used') }[status] || t('orders.unknown');
}
onMounted(async () => {
    await loadCoupons();
    await loadTemplates();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['outline']} */ ;
/** @type {__VLS_StyleScopedClasses['template-item']} */ ;
/** @type {__VLS_StyleScopedClasses['tpl-info']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['coupon-card']} */ ;
/** @type {__VLS_StyleScopedClasses['coupon-left']} */ ;
/** @type {__VLS_StyleScopedClasses['template-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "coupons-page fade-in-up" },
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
(__VLS_ctx.$t('coupons.pageTitle'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-desc" },
});
(__VLS_ctx.$t('coupons.pageDesc'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.loadTemplates) },
    ...{ class: "action-btn outline hover-float" },
});
(__VLS_ctx.$t('coupons.refreshTemplates'));
if (__VLS_ctx.coupons.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "coupon-list" },
    });
    for (const [coupon] of __VLS_getVForSourceType((__VLS_ctx.coupons))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (coupon.coupon_code),
            ...{ class: "coupon-card glass-panel hover-float" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "coupon-left" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "coupon-amount" },
        });
        (coupon.amount);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "coupon-threshold" },
        });
        (__VLS_ctx.$t('coupons.threshold', { amount: coupon.threshold_amount }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "coupon-right" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "coupon-name" },
        });
        (coupon.template_name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "coupon-status" },
            ...{ class: (`s-${coupon.status}`) },
        });
        (__VLS_ctx.statusText(coupon.status));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "coupon-meta" },
        });
        (__VLS_ctx.$t('coupons.expires'));
        (coupon.expired_at);
        if (coupon.order_no) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "coupon-meta" },
            });
            (__VLS_ctx.$t('coupons.linkedOrder'));
            (coupon.order_no);
        }
    }
}
if (__VLS_ctx.templates.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-section glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "section-title" },
    });
    (__VLS_ctx.$t('coupons.available'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-list" },
    });
    for (const [tpl] of __VLS_getVForSourceType((__VLS_ctx.templates))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (tpl.id),
            ...{ class: "template-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tpl-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (tpl.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tpl-desc" },
        });
        (__VLS_ctx.$t('coupons.threshold', { amount: tpl.threshold_amount }));
        (tpl.amount);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.templates.length))
                        return;
                    __VLS_ctx.claim(tpl.id);
                } },
            ...{ class: "primary-btn hover-float" },
            ...{ class: ({ claimed: __VLS_ctx.isClaimed(tpl.id) }) },
            disabled: (__VLS_ctx.isClaimed(tpl.id)),
        });
        (__VLS_ctx.isClaimed(tpl.id) ? __VLS_ctx.$t('coupons.alreadyClaimed') : __VLS_ctx.$t('coupons.claim'));
    }
}
/** @type {__VLS_StyleScopedClasses['coupons-page']} */ ;
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
/** @type {__VLS_StyleScopedClasses['coupon-list']} */ ;
/** @type {__VLS_StyleScopedClasses['coupon-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['coupon-left']} */ ;
/** @type {__VLS_StyleScopedClasses['coupon-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['coupon-threshold']} */ ;
/** @type {__VLS_StyleScopedClasses['coupon-right']} */ ;
/** @type {__VLS_StyleScopedClasses['coupon-name']} */ ;
/** @type {__VLS_StyleScopedClasses['coupon-status']} */ ;
/** @type {__VLS_StyleScopedClasses['coupon-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['coupon-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['template-section']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['template-list']} */ ;
/** @type {__VLS_StyleScopedClasses['template-item']} */ ;
/** @type {__VLS_StyleScopedClasses['tpl-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tpl-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            coupons: coupons,
            templates: templates,
            loadTemplates: loadTemplates,
            isClaimed: isClaimed,
            claim: claim,
            statusText: statusText,
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