import { computed, markRaw, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Bell, Box, Coin, DataAnalysis, Discount, Document, Goods, Grid, Key, Promotion, Tickets, User, WalletFilled, } from '@element-plus/icons-vue';
import { useAdminStore } from '@/stores/admin';
import { toggleLocale, currentLocale } from '@/i18n';
const coreMenu = [
    { path: '/', labelKey: 'sidebar.dashboard', title: 'Dashboard Overview', icon: markRaw(DataAnalysis), tone: 'tone-cyan' },
    { path: '/users', labelKey: 'sidebar.users', title: 'User Management', icon: markRaw(User), tone: 'tone-blue' },
    { path: '/products', labelKey: 'sidebar.products', title: 'Product Catalog', icon: markRaw(Goods), tone: 'tone-gold' },
    { path: '/categories', labelKey: 'sidebar.categories', title: 'Category Management', icon: markRaw(Grid), tone: 'tone-violet' },
    { path: '/inventory', labelKey: 'sidebar.inventory', title: 'Stock Control', icon: markRaw(Box), tone: 'tone-teal' },
    { path: '/card-secrets', labelKey: 'sidebar.cardSecrets', title: 'Card Secret Center', icon: markRaw(Key), tone: 'tone-amber' },
    { path: '/orders', labelKey: 'sidebar.orders', title: 'Order Processing', icon: markRaw(Tickets), tone: 'tone-coral' },
];
const opsMenu = [
    { path: '/announcements', labelKey: 'sidebar.messages', title: 'System Announcements', icon: markRaw(Bell), tone: 'tone-rose' },
    { path: '/campaigns', labelKey: 'sidebar.campaigns', title: 'Marketing Campaigns', icon: markRaw(Promotion), tone: 'tone-mint' },
    { path: '/coupons', labelKey: 'sidebar.coupons', title: 'Discount Coupons', icon: markRaw(Discount), tone: 'tone-orange' },
];
const financeMenu = [
    { path: '/balance-flows', labelKey: 'sidebar.balances', title: 'Financial Ledger', icon: markRaw(WalletFilled), tone: 'tone-emerald' },
    { path: '/points-flows', labelKey: 'sidebar.points', title: 'Points Ledger', icon: markRaw(Coin), tone: 'tone-amber' },
    { path: '/logs', labelKey: 'sidebar.logs', title: 'System Audit Logs', icon: markRaw(Document), tone: 'tone-slate' },
];
const routeTitleMap = Object.fromEntries([...coreMenu, ...opsMenu, ...financeMenu].map((item) => [item.path, item.title]));
const router = useRouter();
const route = useRoute();
const admin = useAdminStore();
const locale = ref(currentLocale());
function switchLocale() {
    toggleLocale();
    locale.value = currentLocale();
}
const currentRouteName = computed(() => routeTitleMap[route.path] || 'Operating Console');
function logout() {
    admin.clear();
    router.push('/login');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['router-link-exact-active']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['router-link-exact-active']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['locale-toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-user']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['main-area']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-label']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "admin-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "sidebar admin-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logo-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logo-mark" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    ...{ class: "w-6 h-6" },
    stroke: "white",
    'stroke-width': "2",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logo-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logo-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logo-sub" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
    ...{ class: "menu-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.coreMenu))) {
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        key: (item.path),
        to: (item.path),
        ...{ class: "menu-link" },
    }));
    const __VLS_2 = __VLS_1({
        key: (item.path),
        to: (item.path),
        ...{ class: "menu-link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon-shell" },
        ...{ class: (item.tone) },
    });
    const __VLS_4 = ((item.icon));
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ class: "icon-svg" },
    }));
    const __VLS_6 = __VLS_5({
        ...{ class: "icon-svg" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "link-label" },
    });
    (__VLS_ctx.$t(item.labelKey));
    var __VLS_3;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-divider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-label" },
});
(__VLS_ctx.$t('sidebar.operations'));
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.opsMenu))) {
    const __VLS_8 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (item.path),
        to: (item.path),
        ...{ class: "menu-link" },
    }));
    const __VLS_10 = __VLS_9({
        key: (item.path),
        to: (item.path),
        ...{ class: "menu-link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon-shell" },
        ...{ class: (item.tone) },
    });
    const __VLS_12 = ((item.icon));
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ class: "icon-svg" },
    }));
    const __VLS_14 = __VLS_13({
        ...{ class: "icon-svg" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "link-label" },
    });
    (__VLS_ctx.$t(item.labelKey));
    var __VLS_11;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-divider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-label" },
});
(__VLS_ctx.$t('sidebar.financials'));
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.financeMenu))) {
    const __VLS_16 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        key: (item.path),
        to: (item.path),
        ...{ class: "menu-link" },
    }));
    const __VLS_18 = __VLS_17({
        key: (item.path),
        to: (item.path),
        ...{ class: "menu-link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon-shell" },
        ...{ class: (item.tone) },
    });
    const __VLS_20 = ((item.icon));
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ class: "icon-svg" },
    }));
    const __VLS_22 = __VLS_21({
        ...{ class: "icon-svg" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "link-label" },
    });
    (__VLS_ctx.$t(item.labelKey));
    var __VLS_19;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.switchLocale) },
    ...{ class: "locale-toggle-btn" },
});
(__VLS_ctx.locale === 'zh-CN' ? 'EN' : 'ZH');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "version-tag" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "main-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "topbar admin-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "top-brand" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "top-title" },
});
(__VLS_ctx.currentRouteName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "top-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.logout) },
    ...{ class: "admin-user" },
    title: "Click to logout",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "admin-avatar" },
});
(__VLS_ctx.admin.user?.nickname?.slice(0, 1)?.toUpperCase() || 'A');
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "admin-name" },
});
(__VLS_ctx.admin.user?.nickname || 'Administrator');
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "content-area fade-in-up" },
});
const __VLS_24 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
/** @type {__VLS_StyleScopedClasses['admin-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-block']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-text']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-title']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-link']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-svg']} */ ;
/** @type {__VLS_StyleScopedClasses['link-label']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-label']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-link']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-svg']} */ ;
/** @type {__VLS_StyleScopedClasses['link-label']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-label']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-link']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-svg']} */ ;
/** @type {__VLS_StyleScopedClasses['link-label']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['locale-toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['version-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['main-area']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['top-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['top-title']} */ ;
/** @type {__VLS_StyleScopedClasses['top-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-user']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-name']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            coreMenu: coreMenu,
            opsMenu: opsMenu,
            financeMenu: financeMenu,
            admin: admin,
            locale: locale,
            switchLocale: switchLocale,
            currentRouteName: currentRouteName,
            logout: logout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=AdminLayout.vue.js.map