import { onMounted, ref, computed } from 'vue';
import dayjs from 'dayjs';
import { mallApi } from '@/api/mall';
import { useAppStore } from '@/stores/app';
const app = useAppStore();
const center = ref(null);
const hasLinuxDo = computed(() => {
    return center.value?.oauth_bindings?.some(b => b.provider === 'linux_do') || false;
});
const linuxDoUsername = computed(() => {
    const b = center.value?.oauth_bindings?.find(b => b.provider === 'linux_do');
    return b ? b.provider_username : '';
});
async function handleLinuxDoBind() {
    try {
        const res = await mallApi.getOauthAuthorizeUrl('linux-do');
        window.location.href = res.authorize_url;
    }
    catch (e) {
        console.error(e);
    }
}
function formatDate(value) {
    return value ? dayjs(value).format('MM-DD HH:mm') : '-';
}
function statusText(status) {
    return { 10: 'Pending', 20: 'Paid', 30: 'Canceled', 40: 'Closed', 50: 'Done' }[status] || 'Unknown';
}
onMounted(async () => {
    const [centerData] = await Promise.all([
        mallApi.getUserCenter(),
        app.refreshUserAssets().catch(() => undefined),
    ]);
    center.value = centerData;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['view-all']} */ ;
/** @type {__VLS_StyleScopedClasses['sec-balance']} */ ;
/** @type {__VLS_StyleScopedClasses['sec-balance']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bind-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['list-row']} */ ;
/** @type {__VLS_StyleScopedClasses['row-side']} */ ;
/** @type {__VLS_StyleScopedClasses['row-main']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-top']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['identity-card']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['identity-card']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['identity-card']} */ ;
/** @type {__VLS_StyleScopedClasses['badges']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "dashboard-page fade-in-up" },
});
if (__VLS_ctx.center) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bento-top" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bento-item glass-panel identity-card hover-float" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "avatar-glow" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "avatar" },
    });
    if (__VLS_ctx.center.user.avatar) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.center.user.avatar),
            ...{ class: "avatar-img" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.center.user.nickname.slice(0, 1).toUpperCase());
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "user-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "user-name" },
    });
    (__VLS_ctx.center.user.nickname);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "user-sub" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "uid" },
    });
    (__VLS_ctx.center.user.id);
    if (__VLS_ctx.center.user.email) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "email" },
        });
        (__VLS_ctx.center.user.email);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "badges" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-chip" },
    });
    (__VLS_ctx.center.stats.sign_days);
    (__VLS_ctx.$t('sign.days'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-chip is-ghost" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bento-item glass-panel wallet-card hover-float" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "wallet-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "bento-title" },
    });
    (__VLS_ctx.$t('profile.balance'));
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: "/balance",
        ...{ class: "view-all" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/balance",
        ...{ class: "view-all" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    (__VLS_ctx.$t('common.details'));
    var __VLS_3;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "balance-display" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "currency" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "amount" },
    });
    (Number(__VLS_ctx.center.wallet.balance).toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "secondary-balances" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sec-balance" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('profile.points'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.center.wallet.points);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sec-balance" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('profile.totalSpend'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (Number(__VLS_ctx.center.stats.total_spend).toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bento-item glass-panel actions-card hover-float" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "bento-title" },
    });
    (__VLS_ctx.$t('common.actions') || 'Quick Actions');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid-actions" },
    });
    const __VLS_4 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        to: "/sign",
        ...{ class: "action-btn" },
    }));
    const __VLS_6 = __VLS_5({
        to: "/sign",
        ...{ class: "action-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('sign.pageTitle'));
    var __VLS_7;
    const __VLS_8 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        to: "/products",
        ...{ class: "action-btn" },
    }));
    const __VLS_10 = __VLS_9({
        to: "/products",
        ...{ class: "action-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('nav.products'));
    var __VLS_11;
    const __VLS_12 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        to: "/wishlist",
        ...{ class: "action-btn" },
    }));
    const __VLS_14 = __VLS_13({
        to: "/wishlist",
        ...{ class: "action-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('wishlist.pageTitle'));
    var __VLS_15;
    const __VLS_16 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        to: "/orders",
        ...{ class: "action-btn" },
    }));
    const __VLS_18 = __VLS_17({
        to: "/orders",
        ...{ class: "action-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('nav.orders'));
    var __VLS_19;
    const __VLS_20 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        to: "/cards",
        ...{ class: "action-btn" },
    }));
    const __VLS_22 = __VLS_21({
        to: "/cards",
        ...{ class: "action-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('nav.cards'));
    var __VLS_23;
    const __VLS_24 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        to: "/coupons",
        ...{ class: "action-btn" },
    }));
    const __VLS_26 = __VLS_25({
        to: "/coupons",
        ...{ class: "action-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('coupons.pageTitle') || 'Coupons');
    var __VLS_27;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bento-item glass-panel linked-card hover-float" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "bento-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "linked-list" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "linked-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "linked-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        ...{ class: "provider-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "linked-action" },
    });
    if (__VLS_ctx.hasLinuxDo) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "bound-status" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "status-dot" },
        });
        (__VLS_ctx.linuxDoUsername);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.handleLinuxDoBind) },
            ...{ class: "bind-btn" },
        });
    }
}
if (__VLS_ctx.center) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bento-bottom" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bento-item glass-panel list-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bento-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "bento-title" },
    });
    (__VLS_ctx.$t('profile.recentOrders'));
    const __VLS_28 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        to: "/orders",
        ...{ class: "view-all" },
    }));
    const __VLS_30 = __VLS_29({
        to: "/orders",
        ...{ class: "view-all" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    (__VLS_ctx.$t('common.all'));
    var __VLS_31;
    if (__VLS_ctx.center.recent_orders.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "list-wrapper" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.center.recent_orders))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                key: (item.order_no),
                ...{ class: "list-row hover-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "row-main" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (item.order_no.slice(-8));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "row-time" },
            });
            (__VLS_ctx.formatDate(item.created_at));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "row-side" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                ...{ class: "row-amount" },
            });
            (Number(item.pay_amount).toFixed(2));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "status-badge" },
            });
            (__VLS_ctx.statusText(item.status));
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state" },
        });
        (__VLS_ctx.$t('orders.noOrders'));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bento-item glass-panel list-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bento-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "bento-title" },
    });
    const __VLS_32 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        to: "/balance",
        ...{ class: "view-all" },
    }));
    const __VLS_34 = __VLS_33({
        to: "/balance",
        ...{ class: "view-all" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    var __VLS_35;
    if (__VLS_ctx.center.recent_flows.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "list-wrapper" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.center.recent_flows))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                key: (`${item.type}-${item.created_at}-${item.biz_type}`),
                ...{ class: "list-row hover-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "row-main" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (item.biz_type);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "row-time" },
            });
            (__VLS_ctx.formatDate(item.created_at));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "row-side" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                ...{ class: "row-amount" },
                ...{ class: ({ 'is-plus': Number(item.amount) > 0 || Number(item.points) > 0 }) },
            });
            if (item.type === 'balance') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (Number(item.amount).toFixed(2));
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (item.points);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "remark" },
            });
            (item.remark || item.type);
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state" },
        });
    }
}
/** @type {__VLS_StyleScopedClasses['dashboard-page']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-top']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-item']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['identity-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-img']} */ ;
/** @type {__VLS_StyleScopedClasses['user-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['user-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['uid']} */ ;
/** @type {__VLS_StyleScopedClasses['email']} */ ;
/** @type {__VLS_StyleScopedClasses['badges']} */ ;
/** @type {__VLS_StyleScopedClasses['card-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['card-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['is-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-item']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['wallet-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['wallet-header']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-title']} */ ;
/** @type {__VLS_StyleScopedClasses['view-all']} */ ;
/** @type {__VLS_StyleScopedClasses['balance-display']} */ ;
/** @type {__VLS_StyleScopedClasses['currency']} */ ;
/** @type {__VLS_StyleScopedClasses['amount']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-balances']} */ ;
/** @type {__VLS_StyleScopedClasses['sec-balance']} */ ;
/** @type {__VLS_StyleScopedClasses['sec-balance']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-item']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-title']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-item']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-title']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-list']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-item']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-info']} */ ;
/** @type {__VLS_StyleScopedClasses['provider-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-action']} */ ;
/** @type {__VLS_StyleScopedClasses['bound-status']} */ ;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['bind-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-item']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['list-card']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-header']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-title']} */ ;
/** @type {__VLS_StyleScopedClasses['view-all']} */ ;
/** @type {__VLS_StyleScopedClasses['list-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['list-row']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-row']} */ ;
/** @type {__VLS_StyleScopedClasses['row-main']} */ ;
/** @type {__VLS_StyleScopedClasses['row-time']} */ ;
/** @type {__VLS_StyleScopedClasses['row-side']} */ ;
/** @type {__VLS_StyleScopedClasses['row-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-item']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['list-card']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-header']} */ ;
/** @type {__VLS_StyleScopedClasses['bento-title']} */ ;
/** @type {__VLS_StyleScopedClasses['view-all']} */ ;
/** @type {__VLS_StyleScopedClasses['list-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['list-row']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-row']} */ ;
/** @type {__VLS_StyleScopedClasses['row-main']} */ ;
/** @type {__VLS_StyleScopedClasses['row-time']} */ ;
/** @type {__VLS_StyleScopedClasses['row-side']} */ ;
/** @type {__VLS_StyleScopedClasses['row-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['remark']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            center: center,
            hasLinuxDo: hasLinuxDo,
            linuxDoUsername: linuxDoUsername,
            handleLinuxDoBind: handleLinuxDoBind,
            formatDate: formatDate,
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