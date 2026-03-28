import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { mallApi } from '@/api/mall';
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();
const campaigns = ref([]);
const result = ref('none');
const purchasing = ref({});
const userResults = ref({});
let refreshTimer;
const liveCount = computed(() => campaigns.value.filter((camp) => isCampActive(camp)).length);
const queueingCount = computed(() => Object.values(userResults.value).filter((status) => status === 'queueing' || status === 'joined').length);
const formattedResult = computed(() => formatResult(result.value));
const resultOrderNo = computed(() => (result.value.startsWith('success:') ? result.value.split(':')[1] : ''));
function getCampStatus(camp) {
    if (camp.campaign_status !== 1)
        return { class: 'off', text: '已关闭', active: false };
    const now = Date.now();
    const start = camp.start_at ? new Date(camp.start_at).getTime() : 0;
    const end = camp.end_at ? new Date(camp.end_at).getTime() : 0;
    if (start && now < start)
        return { class: 'off', text: '即将开始', active: false };
    if (end && now > end)
        return { class: 'off', text: '已结束', active: false };
    return { class: 'live', text: '进行中', active: true };
}
function getAvailableStock(camp) {
    const value = Number(camp.available_stock || 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
}
function getProgress(camp) {
    const value = Number(camp.progress || 0);
    if (!Number.isFinite(value))
        return 0;
    return Math.max(0, Math.min(100, Number(value.toFixed(0))));
}
function isCampActive(camp) {
    return getCampStatus(camp).active;
}
function isJoined(campaignId) {
    const status = userResults.value[campaignId] || '';
    return status === 'queueing' || status === 'joined' || status.startsWith('success');
}
function isPurchaseDisabled(camp) {
    return Boolean(purchasing.value[camp.seckill_campaign_id] || !isCampActive(camp) || isJoined(camp.seckill_campaign_id) || getAvailableStock(camp) <= 0);
}
function purchaseLabel(camp) {
    if (purchasing.value[camp.seckill_campaign_id])
        return '处理中...';
    if (isJoined(camp.seckill_campaign_id))
        return '已参与';
    if (getAvailableStock(camp) <= 0)
        return '已售罄';
    return '立即抢购 →';
}
function formatResult(status) {
    if (status.startsWith('success:'))
        return '抢购成功';
    if (status === 'queueing')
        return '排队中';
    if (status === 'joined')
        return '已进入队列';
    if (status === 'failed')
        return '下单失败';
    if (status === 'cancelled')
        return '订单已取消';
    if (status === 'none')
        return '暂无结果';
    return status || '暂无结果';
}
async function fetchSeckillResultSilently(campaignId) {
    if (!auth.token)
        return 'none';
    try {
        const response = await fetch(`/api/v1/user/seckill/result?campaign_id=${campaignId}`, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload || payload.code !== 0) {
            return 'none';
        }
        return payload.data?.status || 'none';
    }
    catch {
        return 'none';
    }
}
async function syncUserResults(list) {
    if (!auth.isLoggedIn) {
        userResults.value = {};
        return;
    }
    const campaignIds = Array.from(new Set(list.map((item) => item.seckill_campaign_id)));
    const next = { ...userResults.value };
    const results = await Promise.allSettled(campaignIds.map((campaignId) => fetchSeckillResultSilently(campaignId)));
    results.forEach((entry, index) => {
        if (entry.status === 'fulfilled') {
            next[campaignIds[index]] = entry.value;
        }
    });
    userResults.value = next;
}
function trackedCampaignIds() {
    return Array.from(new Set(Object.entries(userResults.value)
        .filter(([, status]) => status === 'queueing' || status === 'joined')
        .map(([campaignId]) => Number(campaignId))));
}
async function refreshTrackedResults() {
    const campaignIds = trackedCampaignIds();
    if (!campaignIds.length)
        return;
    const next = { ...userResults.value };
    const results = await Promise.allSettled(campaignIds.map((campaignId) => fetchSeckillResultSilently(campaignId)));
    results.forEach((entry, index) => {
        if (entry.status === 'fulfilled') {
            const campaignId = campaignIds[index];
            next[campaignId] = entry.value;
            if (entry.value.startsWith('success') || entry.value === 'failed') {
                result.value = entry.value;
            }
        }
    });
    userResults.value = next;
}
async function loadCampaigns(syncResults = false) {
    try {
        campaigns.value = await mallApi.getSeckillGoods();
        if (syncResults) {
            await syncUserResults(campaigns.value);
        }
    }
    catch {
        campaigns.value = [];
    }
}
async function purchase(campaignId, skuId) {
    if (purchasing.value[campaignId])
        return;
    purchasing.value[campaignId] = true;
    try {
        const res = await mallApi.purchaseSeckill(campaignId, skuId);
        userResults.value = { ...userResults.value, [campaignId]: 'queueing' };
        result.value = res.status;
        ElMessage.success('已进入秒杀队列');
        await Promise.all([loadCampaigns(false), refreshTrackedResults()]);
    }
    catch (error) {
        const code = Number(error?.code || error?.response?.data?.code || 0);
        if (code === 40021) {
            userResults.value = { ...userResults.value, [campaignId]: 'joined' };
        }
    }
    finally {
        purchasing.value[campaignId] = false;
    }
}
async function queryResult(campaignId, silent = false) {
    const res = await mallApi.getSeckillResult(campaignId);
    const status = res.status || 'none';
    userResults.value = { ...userResults.value, [campaignId]: status };
    if (!silent) {
        result.value = status;
    }
    return status;
}
onMounted(async () => {
    await loadCampaigns(true);
    refreshTimer = window.setInterval(() => {
        if (document.hidden)
            return;
        void loadCampaigns(false);
        void refreshTrackedResults();
    }, 4000);
});
onUnmounted(() => {
    if (refreshTimer) {
        window.clearInterval(refreshTimer);
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['metric-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['camp-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['camp-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['campaign-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['header-main']} */ ;
/** @type {__VLS_StyleScopedClasses['header-metrics']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-pill']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "seckill-page fade-in-up" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "page-title" },
});
(__VLS_ctx.$t('seckill.pageTitle'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-desc" },
});
(__VLS_ctx.$t('seckill.pageDesc'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-metrics" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-pill" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.liveCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-pill" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.queueingCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "seckill-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "campaigns-col" },
});
if (__VLS_ctx.campaigns.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.$t('common.empty'));
}
for (const [camp] of __VLS_getVForSourceType((__VLS_ctx.campaigns))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (camp.seckill_campaign_id + '-' + camp.sku_id),
        ...{ class: "campaign-card glass-panel hover-float" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "camp-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "camp-title-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: "camp-name" },
    });
    (camp.campaign_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-name" },
    });
    (camp.product_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "camp-badge" },
        ...{ class: (__VLS_ctx.getCampStatus(camp).class) },
    });
    (__VLS_ctx.getCampStatus(camp).text);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "camp-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('seckill.limitPerUser'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (camp.sku_id);
    (Number(camp.seckill_price || 0).toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stock-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.getAvailableStock(camp));
    (Number(camp.stock || 0));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.getProgress(camp));
    const __VLS_0 = {}.ElProgress;
    /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        percentage: (__VLS_ctx.getProgress(camp)),
        strokeWidth: (8),
        color: "#10b981",
    }));
    const __VLS_2 = __VLS_1({
        percentage: (__VLS_ctx.getProgress(camp)),
        strokeWidth: (8),
        color: "#10b981",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "camp-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.queryResult(camp.seckill_campaign_id);
            } },
        ...{ class: "glass-btn hover-float" },
    });
    (__VLS_ctx.$t('seckill.checkResult'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.purchase(camp.seckill_campaign_id, camp.sku_id);
            } },
        ...{ class: "primary-btn hover-float" },
        ...{ class: ({ 'is-loading': __VLS_ctx.purchasing[camp.seckill_campaign_id] }) },
        disabled: (__VLS_ctx.isPurchaseDisabled(camp)),
    });
    (__VLS_ctx.purchaseLabel(camp));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "info-panel glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.$t('seckill.notes'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "rules-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
(__VLS_ctx.$t('seckill.note1'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
(__VLS_ctx.$t('seckill.note2'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
(__VLS_ctx.$t('seckill.note3'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "result-display" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "result-label" },
});
(__VLS_ctx.$t('seckill.currentResult'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "result-value" },
});
(__VLS_ctx.formattedResult);
if (__VLS_ctx.resultOrderNo) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "result-order" },
    });
    (__VLS_ctx.resultOrderNo);
}
/** @type {__VLS_StyleScopedClasses['seckill-page']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['header-main']} */ ;
/** @type {__VLS_StyleScopedClasses['header-text']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['header-metrics']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['seckill-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['campaigns-col']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['campaign-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['camp-header']} */ ;
/** @type {__VLS_StyleScopedClasses['camp-title-group']} */ ;
/** @type {__VLS_StyleScopedClasses['camp-name']} */ ;
/** @type {__VLS_StyleScopedClasses['product-name']} */ ;
/** @type {__VLS_StyleScopedClasses['camp-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['camp-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['camp-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['rules-list']} */ ;
/** @type {__VLS_StyleScopedClasses['result-display']} */ ;
/** @type {__VLS_StyleScopedClasses['result-label']} */ ;
/** @type {__VLS_StyleScopedClasses['result-value']} */ ;
/** @type {__VLS_StyleScopedClasses['result-order']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            campaigns: campaigns,
            purchasing: purchasing,
            liveCount: liveCount,
            queueingCount: queueingCount,
            formattedResult: formattedResult,
            resultOrderNo: resultOrderNo,
            getCampStatus: getCampStatus,
            getAvailableStock: getAvailableStock,
            getProgress: getProgress,
            isPurchaseDisabled: isPurchaseDisabled,
            purchaseLabel: purchaseLabel,
            purchase: purchase,
            queryResult: queryResult,
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