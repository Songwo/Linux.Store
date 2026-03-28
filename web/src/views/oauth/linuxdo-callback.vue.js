import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import http from '@/api/http';
import { useAuthStore } from '@/stores/auth';
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const loading = ref(true);
const errorMessage = ref('');
async function completeLogin() {
    const code = String(route.query.code || '');
    const oauthError = String(route.query.error || '');
    if (oauthError) {
        errorMessage.value = `Linux.do 授权失败: ${oauthError}`;
        loading.value = false;
        return;
    }
    if (!code) {
        errorMessage.value = '缺少 OAuth 授权码，无法完成登录。';
        loading.value = false;
        return;
    }
    try {
        const res = await http.get('/auth/oauth/linux-do/callback', { params: { code } });
        auth.setToken(res.data.token);
        await auth.fetchProfile();
        await router.replace('/');
    }
    catch (error) {
        errorMessage.value = error?.message || 'Linux.do 登录失败，请重试。';
    }
    finally {
        loading.value = false;
    }
}
onMounted(completeLogin);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['callback-card']} */ ;
/** @type {__VLS_StyleScopedClasses['callback-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "callback-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "callback-card glass-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "badge-chip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
else if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.errorMessage);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
if (__VLS_ctx.errorMessage) {
    const __VLS_0 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        type: "primary",
        round: true,
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        type: "primary",
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.errorMessage))
                return;
            __VLS_ctx.router.push('/login');
        }
    };
    __VLS_3.slots.default;
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['callback-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['callback-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            loading: loading,
            errorMessage: errorMessage,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=linuxdo-callback.vue.js.map