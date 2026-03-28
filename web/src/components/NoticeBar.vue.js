import { computed, ref } from 'vue';
const props = defineProps();
const visible = ref(true);
const detailVisible = ref(false);
const currentNotice = ref(null);
const displayAnnouncements = computed(() => {
    // Triple the list to ensure smooth scrolling
    return [...props.announcements, ...props.announcements, ...props.announcements];
});
function showDetail(item) {
    currentNotice.value = item;
    detailVisible.value = true;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['notice-item']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-tag']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.announcements.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notice-bar-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notice-bar glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notice-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notice-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notice-track" },
        ...{ style: ({ animationDuration: `${__VLS_ctx.announcements.length * 10}s` }) },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.displayAnnouncements))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.announcements.length > 0))
                        return;
                    __VLS_ctx.showDetail(item);
                } },
            key: (item.id),
            ...{ class: "notice-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "notice-tag" },
            ...{ class: (item.level) },
        });
        (item.level.toUpperCase());
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "notice-text" },
        });
        (item.title);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notice-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.announcements.length > 0))
                    return;
                __VLS_ctx.visible = false;
            } },
        ...{ class: "notice-close" },
    });
    const __VLS_0 = {}.ElDialog;
    /** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        modelValue: (__VLS_ctx.detailVisible),
        title: (__VLS_ctx.currentNotice?.title),
        width: "500px",
        center: true,
        ...{ class: "glass-dialog" },
        appendToBody: true,
    }));
    const __VLS_2 = __VLS_1({
        modelValue: (__VLS_ctx.detailVisible),
        title: (__VLS_ctx.currentNotice?.title),
        width: "500px",
        center: true,
        ...{ class: "glass-dialog" },
        appendToBody: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notice-detail" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "notice-body" },
    });
    (__VLS_ctx.currentNotice?.content);
    if (__VLS_ctx.currentNotice?.link) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "notice-link" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            href: (__VLS_ctx.currentNotice.link),
            target: "_blank",
            ...{ class: "primary-link" },
        });
        (__VLS_ctx.$t('common.viewMore'));
    }
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['notice-bar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-content']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-track']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-item']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-text']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-close']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-body']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-link']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-link']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            visible: visible,
            detailVisible: detailVisible,
            currentNotice: currentNotice,
            displayAnnouncements: displayAnnouncements,
            showDetail: showDetail,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=NoticeBar.vue.js.map