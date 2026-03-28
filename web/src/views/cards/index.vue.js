import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { mallApi } from '@/api/mall';
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const cards = ref([]);
const detailVisible = ref(false);
const activeCard = ref(null);
const draftOrderFilter = ref('');
const orderFilter = computed(() => {
    return typeof route.query.order_no === 'string' ? route.query.order_no.trim() : '';
});
const pendingCount = computed(() => cards.value.filter((card) => card.status === 20).length);
const viewedCount = computed(() => cards.value.filter((card) => (card.reveal_count || 0) > 0).length);
const redeemedCount = computed(() => cards.value.filter((card) => card.status === 30).length);
function formatDate(value) {
    return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}
function statusText(status) {
    return { 20: 'Pending Redeem', 30: 'Redeemed' }[status] || 'Unknown';
}
async function loadCards() {
    loading.value = true;
    try {
        const result = await mallApi.getCards(orderFilter.value || undefined);
        cards.value = result.list || [];
    }
    finally {
        loading.value = false;
    }
}
function applyOrderFilter() {
    router.replace({
        path: '/cards',
        query: {
            ...route.query,
            order_no: draftOrderFilter.value || undefined,
        },
    });
}
function clearOrderFilter() {
    draftOrderFilter.value = '';
    router.replace({
        path: '/cards',
        query: {
            ...route.query,
            order_no: undefined,
        },
    });
}
async function refreshCards() {
    await loadCards();
}
async function handleReveal(card) {
    activeCard.value = await mallApi.revealCard(card.id);
    detailVisible.value = true;
    await loadCards();
}
async function handleRedeem(card) {
    activeCard.value = await mallApi.redeemCard(card.id);
    detailVisible.value = true;
    ElMessage.success('Card marked as redeemed');
    await loadCards();
}
async function copyValue(value) {
    if (!value)
        return;
    await navigator.clipboard.writeText(value);
    ElMessage.success('Copied to clipboard');
}
async function copyAllSecrets(card) {
    const lines = [
        card.secret.card_code ? `Card Code: ${card.secret.card_code}` : '',
        card.secret.card_password ? `Card Password: ${card.secret.card_password}` : '',
        card.secret.redeem_code ? `Redeem Code: ${card.secret.redeem_code}` : '',
        card.secret.extra_note ? `Note: ${card.secret.extra_note}` : '',
    ].filter(Boolean);
    await navigator.clipboard.writeText(lines.join('\n'));
    ElMessage.success('Full card details copied');
}
watch(orderFilter, async (value) => {
    draftOrderFilter.value = value;
    await loadCards();
}, { immediate: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-secret-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['support-box']} */ ;
/** @type {__VLS_StyleScopedClasses['notes-box']} */ ;
/** @type {__VLS_StyleScopedClasses['notes-box']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-link']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secret-row']} */ ;
/** @type {__VLS_StyleScopedClasses['secret-row']} */ ;
/** @type {__VLS_StyleScopedClasses['secret-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['support-box']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['card-top']} */ ;
/** @type {__VLS_StyleScopedClasses['secret-row']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "cards-page fade-in-up" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.$t('cards.pageTitle'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.$t('cards.pageDesc'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.refreshCards) },
    ...{ class: "ghost-btn" },
});
(__VLS_ctx.$t('common.refresh'));
if (__VLS_ctx.orderFilter) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.clearOrderFilter) },
        ...{ class: "ghost-btn" },
    });
    (__VLS_ctx.$t('cards.clearOrderFilter'));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stats-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "stat-card glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.$t('cards.totalCards'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.cards.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
(__VLS_ctx.$t('cards.totalCardsHint'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "stat-card glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.$t('cards.pendingCards'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.pendingCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
(__VLS_ctx.$t('cards.pendingCardsHint'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "stat-card glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.$t('cards.viewedCards'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.viewedCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
(__VLS_ctx.$t('cards.viewedCardsHint'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "stat-card glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.$t('cards.redeemedCards'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.redeemedCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
(__VLS_ctx.$t('cards.redeemedCardsHint'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-bar glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "filter-field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.$t('cards.orderFilter'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onKeyup: (__VLS_ctx.applyOrderFilter) },
    value: (__VLS_ctx.draftOrderFilter),
    type: "text",
    placeholder: (__VLS_ctx.$t('cards.orderFilterPlaceholder')),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.applyOrderFilter) },
    ...{ class: "ghost-btn" },
});
(__VLS_ctx.$t('common.confirm'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearOrderFilter) },
    ...{ class: "ghost-btn" },
});
(__VLS_ctx.$t('common.cancel'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "privacy-banner glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.$t('cards.privacyTitle'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.$t('cards.privacyDesc'));
if (__VLS_ctx.orderFilter) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "filter-chip" },
    });
    (__VLS_ctx.orderFilter);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-grid" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
for (const [card] of __VLS_getVForSourceType((__VLS_ctx.cards))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (card.id),
        ...{ class: "card-item glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-top" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (card.product_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (card.sku_title || card.profile_name || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: (['status-pill', `status-${card.status}`]) },
    });
    (__VLS_ctx.statusText(card.status));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-secret-shell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "secret-label" },
    });
    (__VLS_ctx.$t('cards.maskedSecret'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
    (card.masked_summary);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('cards.orderNo'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (card.order_no || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('cards.profileName'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (card.profile_name || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('cards.assignedAt'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatDate(card.assigned_at));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('cards.revealCount'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (card.reveal_count || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notes-box" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (card.guide_text || __VLS_ctx.$t('cards.defaultGuide'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (card.privacy_note || __VLS_ctx.$t('cards.defaultPrivacy'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleReveal(card);
            } },
        ...{ class: "primary-btn" },
    });
    (card.reveal_count > 0 ? __VLS_ctx.$t('cards.viewAgain') : __VLS_ctx.$t('cards.viewSecret'));
    if (card.status !== 30) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(card.status !== 30))
                        return;
                    __VLS_ctx.handleRedeem(card);
                } },
            ...{ class: "ghost-btn" },
        });
        (__VLS_ctx.$t('cards.markRedeemed'));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(card.status !== 30))
                        return;
                    __VLS_ctx.handleReveal(card);
                } },
            ...{ class: "ghost-btn" },
        });
        (__VLS_ctx.$t('cards.viewDetail'));
    }
}
if (!__VLS_ctx.loading && __VLS_ctx.cards.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.$t('cards.emptyTitle'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('cards.emptyDesc'));
}
const __VLS_0 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.detailVisible),
    size: "520px",
    ...{ class: "card-drawer" },
    showClose: (false),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.detailVisible),
    size: "520px",
    ...{ class: "card-drawer" },
    showClose: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.activeCard?.product_name || __VLS_ctx.$t('cards.pageTitle'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.activeCard?.masked_summary || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.detailVisible = false;
            } },
        ...{ class: "close-btn" },
        type: "button",
    });
}
if (__VLS_ctx.activeCard) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-status" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: (['status-pill', `status-${__VLS_ctx.activeCard.status}`]) },
    });
    (__VLS_ctx.statusText(__VLS_ctx.activeCard.status));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('cards.revealCount'));
    (__VLS_ctx.activeCard.reveal_count);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('cards.redeemedAt'));
    (__VLS_ctx.formatDate(__VLS_ctx.activeCard.redeemed_at));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "secret-list" },
    });
    if (__VLS_ctx.activeCard.secret.card_code) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "secret-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('cards.cardCode'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
        (__VLS_ctx.activeCard.secret.card_code);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeCard))
                        return;
                    if (!(__VLS_ctx.activeCard.secret.card_code))
                        return;
                    __VLS_ctx.copyValue(__VLS_ctx.activeCard.secret.card_code);
                } },
            ...{ class: "copy-btn" },
        });
        (__VLS_ctx.$t('common.copy'));
    }
    if (__VLS_ctx.activeCard.secret.card_password) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "secret-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('cards.cardPassword'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
        (__VLS_ctx.activeCard.secret.card_password);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeCard))
                        return;
                    if (!(__VLS_ctx.activeCard.secret.card_password))
                        return;
                    __VLS_ctx.copyValue(__VLS_ctx.activeCard.secret.card_password);
                } },
            ...{ class: "copy-btn" },
        });
        (__VLS_ctx.$t('common.copy'));
    }
    if (__VLS_ctx.activeCard.secret.redeem_code) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "secret-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('cards.redeemCode'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
        (__VLS_ctx.activeCard.secret.redeem_code);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeCard))
                        return;
                    if (!(__VLS_ctx.activeCard.secret.redeem_code))
                        return;
                    __VLS_ctx.copyValue(__VLS_ctx.activeCard.secret.redeem_code);
                } },
            ...{ class: "copy-btn" },
        });
        (__VLS_ctx.$t('common.copy'));
    }
    if (__VLS_ctx.activeCard.secret.extra_note) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "secret-row note-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('cards.extraNote'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.activeCard.secret.extra_note);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-panel glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    (__VLS_ctx.$t('cards.redeemGuide'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.activeCard.guide_text || __VLS_ctx.$t('cards.defaultGuide'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (__VLS_ctx.activeCard.privacy_note || __VLS_ctx.$t('cards.defaultPrivacy'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "link-panel" },
    });
    if (__VLS_ctx.activeCard.product_url) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            href: (__VLS_ctx.activeCard.product_url),
            ...{ class: "link-btn" },
            target: "_blank",
            rel: "noreferrer",
        });
        (__VLS_ctx.$t('cards.openProduct'));
    }
    if (__VLS_ctx.activeCard.redirect_url || __VLS_ctx.activeCard.redeem_url) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            href: (__VLS_ctx.activeCard.redirect_url || __VLS_ctx.activeCard.redeem_url),
            ...{ class: "link-btn primary-link" },
            target: "_blank",
            rel: "noreferrer",
        });
        (__VLS_ctx.$t('cards.openRedeem'));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeCard))
                    return;
                __VLS_ctx.copyAllSecrets(__VLS_ctx.activeCard);
            } },
        ...{ class: "link-btn" },
        type: "button",
    });
    (__VLS_ctx.$t('cards.copyAll'));
    if (__VLS_ctx.activeCard.support_contact) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "support-box" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('cards.supportContact'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.activeCard.support_contact);
    }
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['cards-page']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['header-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['privacy-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-top']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-secret-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['secret-label']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['notes-box']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['card-drawer']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-body']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-status']} */ ;
/** @type {__VLS_StyleScopedClasses['secret-list']} */ ;
/** @type {__VLS_StyleScopedClasses['secret-row']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secret-row']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secret-row']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secret-row']} */ ;
/** @type {__VLS_StyleScopedClasses['note-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['link-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-link']} */ ;
/** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['support-box']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            cards: cards,
            detailVisible: detailVisible,
            activeCard: activeCard,
            draftOrderFilter: draftOrderFilter,
            orderFilter: orderFilter,
            pendingCount: pendingCount,
            viewedCount: viewedCount,
            redeemedCount: redeemedCount,
            formatDate: formatDate,
            statusText: statusText,
            applyOrderFilter: applyOrderFilter,
            clearOrderFilter: clearOrderFilter,
            refreshCards: refreshCards,
            handleReveal: handleReveal,
            handleRedeem: handleRedeem,
            copyValue: copyValue,
            copyAllSecrets: copyAllSecrets,
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