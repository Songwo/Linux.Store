import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { toggleLocale, currentLocale } from '@/i18n';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
const router = useRouter();
const auth = useAuthStore();
const app = useAppStore();
const cart = useCartStore();
const { t } = useI18n();
const locale = ref(currentLocale());
function switchLocale() {
    toggleLocale();
    locale.value = currentLocale();
}
const isScrolled = ref(false);
const walletBalance = computed(() => Number(app.wallet?.balance || auth.profile?.balance || 0).toFixed(2));
const nicknameInitial = computed(() => (auth.profile?.nickname || 'D').slice(0, 1).toUpperCase());
async function bootstrap() {
    if (auth.isLoggedIn) {
        await auth.fetchProfile().catch(() => undefined);
    }
    await app.initialize().catch(() => undefined);
    if (auth.isLoggedIn) {
        await cart.refresh().catch(() => undefined);
    }
}
function handleLogout() {
    auth.logout();
    app.refreshUserAssets().catch(() => undefined);
    router.push('/');
}
function onScroll() {
    isScrolled.value = window.scrollY > 20;
}
watch(() => auth.token, async (token) => {
    if (token) {
        await auth.fetchProfile().catch(() => undefined);
        await app.refreshUserAssets().catch(() => undefined);
        return;
    }
    app.refreshUserAssets().catch(() => undefined);
});
onMounted(() => {
    bootstrap();
    window.addEventListener('scroll', onScroll, { passive: true });
});
onUnmounted(() => {
    window.removeEventListener('scroll', onScroll);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['site-header']} */ ;
/** @type {__VLS_StyleScopedClasses['site-header']} */ ;
/** @type {__VLS_StyleScopedClasses['is-scrolled']} */ ;
/** @type {__VLS_StyleScopedClasses['header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['balance-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['user-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['site-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-name']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: (['site-header', { 'is-scrolled': __VLS_ctx.isScrolled }]) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-inner" },
});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "/",
    ...{ class: "brand" },
}));
const __VLS_2 = __VLS_1({
    to: "/",
    ...{ class: "brand" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-mark" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "brand-name" },
});
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
    ...{ class: "main-nav" },
});
const __VLS_4 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    to: "/",
}));
const __VLS_6 = __VLS_5({
    to: "/",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
(__VLS_ctx.$t('nav.explore'));
var __VLS_7;
const __VLS_8 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    to: "/products",
}));
const __VLS_10 = __VLS_9({
    to: "/products",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
(__VLS_ctx.$t('nav.products'));
var __VLS_11;
const __VLS_12 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    to: "/seckill",
}));
const __VLS_14 = __VLS_13({
    to: "/seckill",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
(__VLS_ctx.$t('seckill.pageTitle') || 'Seckill');
var __VLS_15;
const __VLS_16 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    to: "/coupons",
}));
const __VLS_18 = __VLS_17({
    to: "/coupons",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
(__VLS_ctx.$t('coupons.pageTitle') || 'Coupons');
var __VLS_19;
const __VLS_20 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    to: "/balance",
}));
const __VLS_22 = __VLS_21({
    to: "/balance",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
(__VLS_ctx.$t('nav.wallet'));
var __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.switchLocale) },
    ...{ class: "icon-btn locale-toggle" },
    title: (__VLS_ctx.locale === 'zh-CN' ? 'Switch to English' : '切换中文'),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "locale-label" },
});
(__VLS_ctx.locale === 'zh-CN' ? 'EN' : '中');
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.app.toggleTheme();
        } },
    ...{ class: "icon-btn theme-toggle" },
    title: (__VLS_ctx.app.theme === 'light' ? 'Dark Mode' : 'Light Mode'),
});
if (__VLS_ctx.app.theme === 'light') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        ...{ class: "w-4 h-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "12",
        cy: "12",
        r: "5",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
        x1: "12",
        y1: "1",
        x2: "12",
        y2: "3",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
        x1: "12",
        y1: "21",
        x2: "12",
        y2: "23",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
        x1: "4.22",
        y1: "4.22",
        x2: "5.64",
        y2: "5.64",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
        x1: "18.36",
        y1: "18.36",
        x2: "19.78",
        y2: "19.78",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
        x1: "1",
        y1: "12",
        x2: "3",
        y2: "12",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
        x1: "21",
        y1: "12",
        x2: "23",
        y2: "12",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
        x1: "4.22",
        y1: "19.78",
        x2: "5.64",
        y2: "18.36",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
        x1: "18.36",
        y1: "5.64",
        x2: "19.78",
        y2: "4.22",
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        ...{ class: "w-4 h-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
        d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    });
}
const __VLS_24 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    to: "/cart",
    ...{ class: "icon-btn cart-btn" },
}));
const __VLS_26 = __VLS_25({
    to: "/cart",
    ...{ class: "icon-btn cart-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElBadge;
/** @type {[typeof __VLS_components.ElBadge, typeof __VLS_components.elBadge, typeof __VLS_components.ElBadge, typeof __VLS_components.elBadge, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    value: (__VLS_ctx.cart.count),
    hidden: (__VLS_ctx.cart.count === 0),
    max: (99),
    ...{ class: "cart-badge" },
}));
const __VLS_30 = __VLS_29({
    value: (__VLS_ctx.cart.count),
    hidden: (__VLS_ctx.cart.count === 0),
    max: (99),
    ...{ class: "cart-badge" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "w-4 h-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
    x1: "3",
    y1: "6",
    x2: "21",
    y2: "6",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M16 10a4 4 0 0 1-8 0",
});
var __VLS_31;
var __VLS_27;
if (__VLS_ctx.auth.isLoggedIn) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "balance-pill" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "currency" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "value" },
    });
    (__VLS_ctx.walletBalance);
    const __VLS_32 = {}.ElDropdown;
    /** @type {[typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
    const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ class: "user-trigger" },
        type: "button",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "avatar" },
    });
    if (__VLS_ctx.auth.profile?.avatar) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.auth.profile.avatar),
            ...{ class: "avatar-img" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.nicknameInitial);
    }
    {
        const { dropdown: __VLS_thisSlot } = __VLS_35.slots;
        const __VLS_36 = {}.ElDropdownMenu;
        /** @type {[typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
        const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_39.slots.default;
        const __VLS_40 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            ...{ 'onClick': {} },
        }));
        const __VLS_42 = __VLS_41({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_44;
        let __VLS_45;
        let __VLS_46;
        const __VLS_47 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.auth.isLoggedIn))
                    return;
                __VLS_ctx.$router.push('/profile');
            }
        };
        __VLS_43.slots.default;
        (__VLS_ctx.$t('nav.dashboard'));
        var __VLS_43;
        const __VLS_48 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            ...{ 'onClick': {} },
        }));
        const __VLS_50 = __VLS_49({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_52;
        let __VLS_53;
        let __VLS_54;
        const __VLS_55 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.auth.isLoggedIn))
                    return;
                __VLS_ctx.$router.push('/orders');
            }
        };
        __VLS_51.slots.default;
        (__VLS_ctx.$t('nav.orders'));
        var __VLS_51;
        const __VLS_56 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            ...{ 'onClick': {} },
        }));
        const __VLS_58 = __VLS_57({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        let __VLS_60;
        let __VLS_61;
        let __VLS_62;
        const __VLS_63 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.auth.isLoggedIn))
                    return;
                __VLS_ctx.$router.push('/cards');
            }
        };
        __VLS_59.slots.default;
        (__VLS_ctx.$t('nav.cards'));
        var __VLS_59;
        const __VLS_64 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            ...{ 'onClick': {} },
            divided: true,
        }));
        const __VLS_66 = __VLS_65({
            ...{ 'onClick': {} },
            divided: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        let __VLS_68;
        let __VLS_69;
        let __VLS_70;
        const __VLS_71 = {
            onClick: (__VLS_ctx.handleLogout)
        };
        __VLS_67.slots.default;
        (__VLS_ctx.$t('nav.logOut'));
        var __VLS_67;
        var __VLS_39;
    }
    var __VLS_35;
}
else {
    const __VLS_72 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        to: "/login",
    }));
    const __VLS_74 = __VLS_73({
        to: "/login",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    const __VLS_76 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        type: "primary",
        size: "small",
    }));
    const __VLS_78 = __VLS_77({
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_79.slots.default;
    (__VLS_ctx.$t('nav.signIn'));
    var __VLS_79;
    var __VLS_75;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "page-content" },
});
const __VLS_80 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({}));
const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
/** @type {__VLS_StyleScopedClasses['app-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['brand']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-name']} */ ;
/** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['locale-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['locale-label']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['balance-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['currency']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['user-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-img']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            auth: auth,
            app: app,
            cart: cart,
            locale: locale,
            switchLocale: switchLocale,
            isScrolled: isScrolled,
            walletBalance: walletBalance,
            nicknameInitial: nicknameInitial,
            handleLogout: handleLogout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=AppLayout.vue.js.map