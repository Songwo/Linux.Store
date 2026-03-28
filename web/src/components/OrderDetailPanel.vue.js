import dayjs from 'dayjs';
const __VLS_props = defineProps();
const __VLS_emit = defineEmits();
function statusText(status) {
    return { 10: 'Pending pay', 20: 'Paid', 30: 'Canceled', 40: 'Closed', 50: 'Completed' }[status] || 'Unknown';
}
function cardStatusText(status) {
    return { 20: 'Pending redeem', 30: 'Redeemed' }[status] || 'Card ready';
}
function formatDate(value) {
    return value ? dayjs(value).format('MMM D, YYYY  |  HH:mm') : '-';
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero-main']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-main']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['d-item-row']} */ ;
/** @type {__VLS_StyleScopedClasses['card-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['card-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['d-item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['card-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['d-item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['card-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['card-side']} */ ;
/** @type {__VLS_StyleScopedClasses['d-item-price']} */ ;
/** @type {__VLS_StyleScopedClasses['d-item-price']} */ ;
/** @type {__VLS_StyleScopedClasses['d-total-row']} */ ;
/** @type {__VLS_StyleScopedClasses['d-total-row']} */ ;
/** @type {__VLS_StyleScopedClasses['d-record-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['block-head']} */ ;
/** @type {__VLS_StyleScopedClasses['cards-header']} */ ;
/** @type {__VLS_StyleScopedClasses['card-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['d-item-row']} */ ;
/** @type {__VLS_StyleScopedClasses['d-item-price']} */ ;
/** @type {__VLS_StyleScopedClasses['card-side']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "detail-panel-body" },
});
if (__VLS_ctx.detailLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-loading" },
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
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_8 = {}.ElSkeletonItem;
        /** @type {[typeof __VLS_components.ElSkeletonItem, typeof __VLS_components.elSkeletonItem, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            variant: "p",
            ...{ style: {} },
        }));
        const __VLS_10 = __VLS_9({
            variant: "p",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        const __VLS_12 = {}.ElSkeletonItem;
        /** @type {[typeof __VLS_components.ElSkeletonItem, typeof __VLS_components.elSkeletonItem, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            variant: "p",
            ...{ style: {} },
        }));
        const __VLS_14 = __VLS_13({
            variant: "p",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        const __VLS_16 = {}.ElSkeletonItem;
        /** @type {[typeof __VLS_components.ElSkeletonItem, typeof __VLS_components.elSkeletonItem, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            variant: "p",
            ...{ style: {} },
        }));
        const __VLS_18 = __VLS_17({
            variant: "p",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    }
    var __VLS_3;
}
else if (__VLS_ctx.detailData) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-stack" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "detail-hero" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero-main" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "hero-kicker" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.statusText(__VLS_ctx.detailData.order.status));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.detailData.order.order_no);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.formatDate(__VLS_ctx.detailData.order.created_at));
    if (__VLS_ctx.detailData.order.paid_at) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatDate(__VLS_ctx.detailData.order.paid_at));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "detail-block summary-block glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-cell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.items.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-cell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (Number(__VLS_ctx.detailData.order.pay_amount).toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-cell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.deliveries.length ? 'Ready' : 'Pending');
    if (__VLS_ctx.detailData.order.points_amount) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "summary-hint" },
        });
        (__VLS_ctx.detailData.order.points_amount);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "detail-block glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "block-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "block-kicker" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "box-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "block-badge" },
    });
    (__VLS_ctx.detailData.items.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "items-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.detailData.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.id),
            ...{ class: "d-item-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "d-item-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.product_name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.sku_title);
        (item.quantity);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "d-item-price" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (Number(item.total_amount).toFixed(2));
        if (item.points_price) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (item.points_price);
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "d-total-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (Number(__VLS_ctx.detailData.order.pay_amount).toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "detail-block glass-panel delivery-box" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "block-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "block-kicker" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "box-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "block-badge" },
    });
    (__VLS_ctx.detailData.deliveries.length);
    if (__VLS_ctx.detailData.deliveries.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "delivery-records" },
        });
        for (const [record] of __VLS_getVForSourceType((__VLS_ctx.detailData.deliveries))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (record.id),
                ...{ class: "d-record-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
            (record.content);
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-delivery" },
        });
        (__VLS_ctx.$t('orders.deliveryPending'));
    }
    if (__VLS_ctx.detailData.cards?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            ...{ class: "detail-block glass-panel" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cards-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "block-kicker" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
            ...{ class: "box-title" },
        });
        (__VLS_ctx.$t('cards.pageTitle'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "cards-desc" },
        });
        (__VLS_ctx.$t('cards.orderEntryDesc'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.detailLoading))
                        return;
                    if (!(__VLS_ctx.detailData))
                        return;
                    if (!(__VLS_ctx.detailData.cards?.length))
                        return;
                    __VLS_ctx.$emit('open-cards', __VLS_ctx.detailData.order.order_no);
                } },
            ...{ class: "glass-btn" },
        });
        (__VLS_ctx.$t('cards.openCenter'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cards-list" },
        });
        for (const [card] of __VLS_getVForSourceType((__VLS_ctx.detailData.cards))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (card.id),
                ...{ class: "card-summary" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (card.product_name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (card.masked_summary);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "card-side" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "status-badge" },
                ...{ class: (`status-${card.status}`) },
            });
            (__VLS_ctx.cardStatusText(card.status));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
            (card.profile_name || card.sku_title);
        }
    }
    if (__VLS_ctx.detailData.order.status === 10) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "action-wrap" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.detailLoading))
                        return;
                    if (!(__VLS_ctx.detailData))
                        return;
                    if (!(__VLS_ctx.detailData.order.status === 10))
                        return;
                    __VLS_ctx.$emit('pay', __VLS_ctx.detailData.order.order_no);
                } },
            ...{ class: "primary-btn w-full" },
        });
        (Number(__VLS_ctx.detailData.order.pay_amount).toFixed(2));
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
/** @type {__VLS_StyleScopedClasses['detail-panel-body']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-main']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-block']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['block-head']} */ ;
/** @type {__VLS_StyleScopedClasses['block-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['box-title']} */ ;
/** @type {__VLS_StyleScopedClasses['block-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['items-list']} */ ;
/** @type {__VLS_StyleScopedClasses['d-item-row']} */ ;
/** @type {__VLS_StyleScopedClasses['d-item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['d-item-price']} */ ;
/** @type {__VLS_StyleScopedClasses['d-total-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['delivery-box']} */ ;
/** @type {__VLS_StyleScopedClasses['block-head']} */ ;
/** @type {__VLS_StyleScopedClasses['block-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['box-title']} */ ;
/** @type {__VLS_StyleScopedClasses['block-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['delivery-records']} */ ;
/** @type {__VLS_StyleScopedClasses['d-record-card']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-delivery']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['cards-header']} */ ;
/** @type {__VLS_StyleScopedClasses['block-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['box-title']} */ ;
/** @type {__VLS_StyleScopedClasses['cards-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cards-list']} */ ;
/** @type {__VLS_StyleScopedClasses['card-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['card-side']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['action-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            statusText: statusText,
            cardStatusText: cardStatusText,
            formatDate: formatDate,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=OrderDetailPanel.vue.js.map