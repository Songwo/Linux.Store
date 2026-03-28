import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import http from '@/api/http';
const profilesLoading = ref(false);
const itemsLoading = ref(false);
const profiles = ref([]);
const skuOptions = ref([]);
const items = ref([]);
const itemsTotal = ref(0);
const profileDialogVisible = ref(false);
const importDialogVisible = ref(false);
const editingProfileId = ref(null);
const profileEnabled = ref(true);
const itemQuery = reactive({ profile_id: undefined, status: 'all', keyword: '', page: 1, page_size: 10 });
const profileForm = reactive({ sku_id: undefined, profile_name: '', product_url: '', redeem_url: '', guide_text: '', privacy_note: '', support_contact: '' });
const importForm = reactive({ profile_id: undefined, batch_no: '', lines: '' });
const totals = computed(() => profiles.value.reduce((acc, profile) => {
    acc.available += Number(profile.available_count || 0);
    acc.assigned += Number(profile.assigned_count || 0);
    acc.redeemed += Number(profile.redeemed_count || 0);
    return acc;
}, { available: 0, assigned: 0, redeemed: 0 }));
function statusText(status) {
    return { 10: '可发放', 20: '已发放', 30: '已兑换', 40: '已停用' }[status] || '未知';
}
function statusTagType(status) {
    return { 10: 'success', 20: 'warning', 30: 'info', 40: 'danger' }[status] || 'info';
}
function resetProfileForm() {
    Object.assign(profileForm, { sku_id: undefined, profile_name: '', product_url: '', redeem_url: '', guide_text: '', privacy_note: '', support_contact: '' });
    profileEnabled.value = true;
    editingProfileId.value = null;
}
function resetImportForm() {
    Object.assign(importForm, { profile_id: itemQuery.profile_id || profiles.value[0]?.id, batch_no: '', lines: '' });
}
async function loadSkuOptions() {
    const res = await http.get('/admin/card-secret-skus');
    skuOptions.value = res.data || [];
}
async function loadProfiles() {
    profilesLoading.value = true;
    try {
        const res = await http.get('/admin/card-secret-profiles');
        profiles.value = res.data || [];
        if (itemQuery.profile_id && !profiles.value.some((profile) => profile.id === itemQuery.profile_id)) {
            itemQuery.profile_id = undefined;
        }
    }
    finally {
        profilesLoading.value = false;
    }
}
async function loadItems() {
    itemsLoading.value = true;
    try {
        const res = await http.get('/admin/card-secret-items', { params: itemQuery });
        items.value = res.data.list || [];
        itemsTotal.value = Number(res.data.total || 0);
    }
    finally {
        itemsLoading.value = false;
    }
}
async function refreshAll() {
    await Promise.all([loadProfiles(), loadItems()]);
}
function openProfileDialog(profile) {
    resetProfileForm();
    if (profile) {
        editingProfileId.value = profile.id;
        profileForm.sku_id = profile.sku_id;
        profileForm.profile_name = profile.profile_name || '';
        profileForm.product_url = profile.product_url || '';
        profileForm.redeem_url = profile.redeem_url || '';
        profileForm.guide_text = profile.guide_text || '';
        profileForm.privacy_note = profile.privacy_note || '';
        profileForm.support_contact = profile.support_contact || '';
        profileEnabled.value = profile.status === 1;
    }
    profileDialogVisible.value = true;
}
function openImportDialog(profile) {
    resetImportForm();
    if (profile?.id) {
        importForm.profile_id = profile.id;
    }
    importDialogVisible.value = true;
}
function filterByProfile(profileId) {
    itemQuery.profile_id = profileId;
    itemQuery.page = 1;
    loadItems();
}
async function saveProfile() {
    if (!profileForm.sku_id) {
        ElMessage.warning('请选择绑定 SKU');
        return;
    }
    const payload = { ...profileForm, status: profileEnabled.value ? 1 : 0 };
    if (editingProfileId.value) {
        await http.put(`/admin/card-secret-profiles/${editingProfileId.value}`, payload);
        ElMessage.success('卡密档案已更新');
    }
    else {
        await http.post('/admin/card-secret-profiles', payload);
        ElMessage.success('卡密档案已创建');
    }
    profileDialogVisible.value = false;
    await refreshAll();
}
function parseImportLines() {
    const normalized = importForm.lines.replace(/｜/g, '|').trim();
    if (!normalized) {
        throw new Error('请输入要导入的卡密内容');
    }
    return normalized.split(/\r?\n/).map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) {
            return null;
        }
        const parts = line.split('|').map((part) => part.trim());
        const [card_code = '', card_password = '', redeem_code = '', ...rest] = parts;
        if (!card_code && !card_password && !redeem_code) {
            throw new Error(`第 ${index + 1} 行缺少卡密内容`);
        }
        return {
            card_code,
            card_password,
            redeem_code,
            extra_note: rest.join(' | '),
        };
    }).filter(Boolean);
}
async function submitImport() {
    if (!importForm.profile_id) {
        ElMessage.warning('请选择导入目标档案');
        return;
    }
    const items = parseImportLines();
    await http.post('/admin/card-secret-items/import', {
        profile_id: importForm.profile_id,
        batch_no: importForm.batch_no,
        items,
    });
    ElMessage.success(`已导入 ${items.length} 条卡密`);
    importDialogVisible.value = false;
    await refreshAll();
}
async function toggleItemStatus(row) {
    const nextStatus = row.status === 10 ? 40 : 10;
    await http.put(`/admin/card-secret-items/${row.id}/status`, { status: nextStatus });
    ElMessage.success(nextStatus === 40 ? '卡密已停用' : '卡密已启用');
    await refreshAll();
}
onMounted(async () => {
    await Promise.all([loadSkuOptions(), loadProfiles(), loadItems()]);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['sku-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['import-help']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "admin-panel page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-desc" },
});
(__VLS_ctx.profiles.length);
(__VLS_ctx.totals.available);
(__VLS_ctx.totals.assigned);
(__VLS_ctx.totals.redeemed);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.refreshAll)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (...[$event]) => {
        __VLS_ctx.openProfileDialog();
    }
};
__VLS_11.slots.default;
var __VLS_11;
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    type: "success",
    disabled: (!__VLS_ctx.profiles.length),
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "success",
    disabled: (!__VLS_ctx.profiles.length),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (...[$event]) => {
        __VLS_ctx.openImportDialog();
    }
};
__VLS_19.slots.default;
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_24 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    data: (__VLS_ctx.profiles),
    rowKey: "id",
    ...{ style: {} },
}));
const __VLS_26 = __VLS_25({
    data: (__VLS_ctx.profiles),
    rowKey: "id",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.profilesLoading) }, null, null);
__VLS_27.slots.default;
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    prop: "profile_name",
    label: "档案名称",
    minWidth: "220",
}));
const __VLS_30 = __VLS_29({
    prop: "profile_name",
    label: "档案名称",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const __VLS_32 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "商品 / SKU",
    minWidth: "260",
}));
const __VLS_34 = __VLS_33({
    label: "商品 / SKU",
    minWidth: "260",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_35.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sku-cell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (row.product_name || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (row.sku_title || '-');
    (row.sku_code || '-');
}
var __VLS_35;
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    prop: "available_count",
    label: "可发放",
    width: "110",
}));
const __VLS_38 = __VLS_37({
    prop: "available_count",
    label: "可发放",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    prop: "assigned_count",
    label: "已发放",
    width: "110",
}));
const __VLS_42 = __VLS_41({
    prop: "assigned_count",
    label: "已发放",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    prop: "redeemed_count",
    label: "已兑换",
    width: "110",
}));
const __VLS_46 = __VLS_45({
    prop: "redeemed_count",
    label: "已兑换",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    prop: "status",
    label: "状态",
    width: "110",
}));
const __VLS_50 = __VLS_49({
    prop: "status",
    label: "状态",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_51.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_52 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        type: (row.status === 1 ? 'success' : 'info'),
    }));
    const __VLS_54 = __VLS_53({
        type: (row.status === 1 ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    (row.status === 1 ? '启用' : '停用');
    var __VLS_55;
}
var __VLS_51;
const __VLS_56 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "操作",
    width: "260",
}));
const __VLS_58 = __VLS_57({
    label: "操作",
    width: "260",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_59.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_60 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openProfileDialog(row);
        }
    };
    __VLS_63.slots.default;
    var __VLS_63;
    const __VLS_68 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ 'onClick': {} },
        link: true,
        type: "success",
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onClick': {} },
        link: true,
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_72;
    let __VLS_73;
    let __VLS_74;
    const __VLS_75 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openImportDialog(row);
        }
    };
    __VLS_71.slots.default;
    var __VLS_71;
    const __VLS_76 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        ...{ 'onClick': {} },
        link: true,
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onClick': {} },
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_80;
    let __VLS_81;
    let __VLS_82;
    const __VLS_83 = {
        onClick: (...[$event]) => {
            __VLS_ctx.filterByProfile(row.id);
        }
    };
    __VLS_79.slots.default;
    var __VLS_79;
}
var __VLS_59;
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-head section-head-gap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions filter-actions" },
});
const __VLS_84 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.itemQuery.profile_id),
    clearable: true,
    placeholder: "筛选档案",
    ...{ style: {} },
}));
const __VLS_86 = __VLS_85({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.itemQuery.profile_id),
    clearable: true,
    placeholder: "筛选档案",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_88;
let __VLS_89;
let __VLS_90;
const __VLS_91 = {
    onChange: (__VLS_ctx.loadItems)
};
__VLS_87.slots.default;
for (const [profile] of __VLS_getVForSourceType((__VLS_ctx.profiles))) {
    const __VLS_92 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        key: (profile.id),
        label: (profile.profile_name),
        value: (profile.id),
    }));
    const __VLS_94 = __VLS_93({
        key: (profile.id),
        label: (profile.profile_name),
        value: (profile.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
}
var __VLS_87;
const __VLS_96 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.itemQuery.status),
    ...{ style: {} },
}));
const __VLS_98 = __VLS_97({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.itemQuery.status),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
let __VLS_100;
let __VLS_101;
let __VLS_102;
const __VLS_103 = {
    onChange: (__VLS_ctx.loadItems)
};
__VLS_99.slots.default;
const __VLS_104 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    label: "全部状态",
    value: "all",
}));
const __VLS_106 = __VLS_105({
    label: "全部状态",
    value: "all",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
const __VLS_108 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "可发放",
    value: "10",
}));
const __VLS_110 = __VLS_109({
    label: "可发放",
    value: "10",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
const __VLS_112 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    label: "已发放",
    value: "20",
}));
const __VLS_114 = __VLS_113({
    label: "已发放",
    value: "20",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
const __VLS_116 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    label: "已兑换",
    value: "30",
}));
const __VLS_118 = __VLS_117({
    label: "已兑换",
    value: "30",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
const __VLS_120 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    label: "已停用",
    value: "40",
}));
const __VLS_122 = __VLS_121({
    label: "已停用",
    value: "40",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
var __VLS_99;
const __VLS_124 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.itemQuery.keyword),
    placeholder: "搜索订单号 / 脱敏摘要",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_126 = __VLS_125({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.itemQuery.keyword),
    placeholder: "搜索订单号 / 脱敏摘要",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_128;
let __VLS_129;
let __VLS_130;
const __VLS_131 = {
    onKeyup: (__VLS_ctx.loadItems)
};
var __VLS_127;
const __VLS_132 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_134 = __VLS_133({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
let __VLS_136;
let __VLS_137;
let __VLS_138;
const __VLS_139 = {
    onClick: (__VLS_ctx.loadItems)
};
__VLS_135.slots.default;
var __VLS_135;
const __VLS_140 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    data: (__VLS_ctx.items),
    ...{ style: {} },
}));
const __VLS_142 = __VLS_141({
    data: (__VLS_ctx.items),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.itemsLoading) }, null, null);
__VLS_143.slots.default;
const __VLS_144 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    prop: "masked_summary",
    label: "脱敏摘要",
    minWidth: "260",
}));
const __VLS_146 = __VLS_145({
    prop: "masked_summary",
    label: "脱敏摘要",
    minWidth: "260",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
const __VLS_148 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    prop: "profile_name",
    label: "档案",
    minWidth: "160",
}));
const __VLS_150 = __VLS_149({
    prop: "profile_name",
    label: "档案",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
const __VLS_152 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    prop: "batch_no",
    label: "批次号",
    width: "180",
}));
const __VLS_154 = __VLS_153({
    prop: "batch_no",
    label: "批次号",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
const __VLS_156 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    prop: "order_no",
    label: "订单号",
    width: "180",
}));
const __VLS_158 = __VLS_157({
    prop: "order_no",
    label: "订单号",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
const __VLS_160 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    prop: "user_id",
    label: "用户 ID",
    width: "110",
}));
const __VLS_162 = __VLS_161({
    prop: "user_id",
    label: "用户 ID",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
const __VLS_164 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    prop: "status",
    label: "状态",
    width: "110",
}));
const __VLS_166 = __VLS_165({
    prop: "status",
    label: "状态",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_167.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_168 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
        type: (__VLS_ctx.statusTagType(row.status)),
    }));
    const __VLS_170 = __VLS_169({
        type: (__VLS_ctx.statusTagType(row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    __VLS_171.slots.default;
    (__VLS_ctx.statusText(row.status));
    var __VLS_171;
}
var __VLS_167;
const __VLS_172 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    prop: "reveal_count",
    label: "查看次数",
    width: "100",
}));
const __VLS_174 = __VLS_173({
    prop: "reveal_count",
    label: "查看次数",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
const __VLS_176 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    prop: "assigned_at",
    label: "发放时间",
    minWidth: "170",
}));
const __VLS_178 = __VLS_177({
    prop: "assigned_at",
    label: "发放时间",
    minWidth: "170",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
const __VLS_180 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    prop: "redeemed_at",
    label: "兑换时间",
    minWidth: "170",
}));
const __VLS_182 = __VLS_181({
    prop: "redeemed_at",
    label: "兑换时间",
    minWidth: "170",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
const __VLS_184 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    label: "操作",
    width: "120",
}));
const __VLS_186 = __VLS_185({
    label: "操作",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_187.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.status === 10 || row.status === 40) {
        const __VLS_188 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
            ...{ 'onClick': {} },
            link: true,
            type: (row.status === 10 ? 'danger' : 'success'),
        }));
        const __VLS_190 = __VLS_189({
            ...{ 'onClick': {} },
            link: true,
            type: (row.status === 10 ? 'danger' : 'success'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_189));
        let __VLS_192;
        let __VLS_193;
        let __VLS_194;
        const __VLS_195 = {
            onClick: (...[$event]) => {
                if (!(row.status === 10 || row.status === 40))
                    return;
                __VLS_ctx.toggleItemStatus(row);
            }
        };
        __VLS_191.slots.default;
        (row.status === 10 ? '停用' : '启用');
        var __VLS_191;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "muted-text" },
        });
    }
}
var __VLS_187;
var __VLS_143;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pager" },
});
const __VLS_196 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.itemQuery.page),
    pageSize: (__VLS_ctx.itemQuery.page_size),
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.itemsTotal),
}));
const __VLS_198 = __VLS_197({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.itemQuery.page),
    pageSize: (__VLS_ctx.itemQuery.page_size),
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.itemsTotal),
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
let __VLS_200;
let __VLS_201;
let __VLS_202;
const __VLS_203 = {
    onCurrentChange: (__VLS_ctx.loadItems)
};
var __VLS_199;
const __VLS_204 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    modelValue: (__VLS_ctx.profileDialogVisible),
    title: (__VLS_ctx.editingProfileId ? '编辑卡密档案' : '新建卡密档案'),
    width: "720px",
}));
const __VLS_206 = __VLS_205({
    modelValue: (__VLS_ctx.profileDialogVisible),
    title: (__VLS_ctx.editingProfileId ? '编辑卡密档案' : '新建卡密档案'),
    width: "720px",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
__VLS_207.slots.default;
const __VLS_208 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    model: (__VLS_ctx.profileForm),
    labelWidth: "110px",
}));
const __VLS_210 = __VLS_209({
    model: (__VLS_ctx.profileForm),
    labelWidth: "110px",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
__VLS_211.slots.default;
const __VLS_212 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    label: "绑定 SKU",
}));
const __VLS_214 = __VLS_213({
    label: "绑定 SKU",
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
__VLS_215.slots.default;
const __VLS_216 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    modelValue: (__VLS_ctx.profileForm.sku_id),
    filterable: true,
    placeholder: "请选择商品 SKU",
    ...{ style: {} },
}));
const __VLS_218 = __VLS_217({
    modelValue: (__VLS_ctx.profileForm.sku_id),
    filterable: true,
    placeholder: "请选择商品 SKU",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
__VLS_219.slots.default;
for (const [sku] of __VLS_getVForSourceType((__VLS_ctx.skuOptions))) {
    const __VLS_220 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
        key: (sku.sku_id),
        label: (`${sku.product_name} / ${sku.sku_title} / ${sku.sku_code}`),
        value: (sku.sku_id),
    }));
    const __VLS_222 = __VLS_221({
        key: (sku.sku_id),
        label: (`${sku.product_name} / ${sku.sku_title} / ${sku.sku_code}`),
        value: (sku.sku_id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
}
var __VLS_219;
var __VLS_215;
const __VLS_224 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    label: "档案名称",
}));
const __VLS_226 = __VLS_225({
    label: "档案名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
__VLS_227.slots.default;
const __VLS_228 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
    modelValue: (__VLS_ctx.profileForm.profile_name),
    placeholder: "例如：标准版自动发卡",
}));
const __VLS_230 = __VLS_229({
    modelValue: (__VLS_ctx.profileForm.profile_name),
    placeholder: "例如：标准版自动发卡",
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
var __VLS_227;
const __VLS_232 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    label: "商品链接",
}));
const __VLS_234 = __VLS_233({
    label: "商品链接",
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
__VLS_235.slots.default;
const __VLS_236 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    modelValue: (__VLS_ctx.profileForm.product_url),
    placeholder: "https://example.com/product",
}));
const __VLS_238 = __VLS_237({
    modelValue: (__VLS_ctx.profileForm.product_url),
    placeholder: "https://example.com/product",
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
var __VLS_235;
const __VLS_240 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    label: "兑换链接",
}));
const __VLS_242 = __VLS_241({
    label: "兑换链接",
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
const __VLS_244 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    modelValue: (__VLS_ctx.profileForm.redeem_url),
    placeholder: "https://example.com/redeem",
}));
const __VLS_246 = __VLS_245({
    modelValue: (__VLS_ctx.profileForm.redeem_url),
    placeholder: "https://example.com/redeem",
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
var __VLS_243;
const __VLS_248 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    label: "兑换说明",
}));
const __VLS_250 = __VLS_249({
    label: "兑换说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
__VLS_251.slots.default;
const __VLS_252 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    modelValue: (__VLS_ctx.profileForm.guide_text),
    type: "textarea",
    rows: (4),
}));
const __VLS_254 = __VLS_253({
    modelValue: (__VLS_ctx.profileForm.guide_text),
    type: "textarea",
    rows: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
var __VLS_251;
const __VLS_256 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
    label: "隐私提示",
}));
const __VLS_258 = __VLS_257({
    label: "隐私提示",
}, ...__VLS_functionalComponentArgsRest(__VLS_257));
__VLS_259.slots.default;
const __VLS_260 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
    modelValue: (__VLS_ctx.profileForm.privacy_note),
    type: "textarea",
    rows: (3),
}));
const __VLS_262 = __VLS_261({
    modelValue: (__VLS_ctx.profileForm.privacy_note),
    type: "textarea",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
var __VLS_259;
const __VLS_264 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    label: "客服联系方式",
}));
const __VLS_266 = __VLS_265({
    label: "客服联系方式",
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
__VLS_267.slots.default;
const __VLS_268 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    modelValue: (__VLS_ctx.profileForm.support_contact),
    placeholder: "邮箱 / 工单 / TG / QQ",
}));
const __VLS_270 = __VLS_269({
    modelValue: (__VLS_ctx.profileForm.support_contact),
    placeholder: "邮箱 / 工单 / TG / QQ",
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
var __VLS_267;
const __VLS_272 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
    label: "启用状态",
}));
const __VLS_274 = __VLS_273({
    label: "启用状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
__VLS_275.slots.default;
const __VLS_276 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
    modelValue: (__VLS_ctx.profileEnabled),
}));
const __VLS_278 = __VLS_277({
    modelValue: (__VLS_ctx.profileEnabled),
}, ...__VLS_functionalComponentArgsRest(__VLS_277));
var __VLS_275;
var __VLS_211;
{
    const { footer: __VLS_thisSlot } = __VLS_207.slots;
    const __VLS_280 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
        ...{ 'onClick': {} },
    }));
    const __VLS_282 = __VLS_281({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_281));
    let __VLS_284;
    let __VLS_285;
    let __VLS_286;
    const __VLS_287 = {
        onClick: (...[$event]) => {
            __VLS_ctx.profileDialogVisible = false;
        }
    };
    __VLS_283.slots.default;
    var __VLS_283;
    const __VLS_288 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_290 = __VLS_289({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_289));
    let __VLS_292;
    let __VLS_293;
    let __VLS_294;
    const __VLS_295 = {
        onClick: (__VLS_ctx.saveProfile)
    };
    __VLS_291.slots.default;
    var __VLS_291;
}
var __VLS_207;
const __VLS_296 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    modelValue: (__VLS_ctx.importDialogVisible),
    title: "批量导入卡密",
    width: "760px",
}));
const __VLS_298 = __VLS_297({
    modelValue: (__VLS_ctx.importDialogVisible),
    title: "批量导入卡密",
    width: "760px",
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
__VLS_299.slots.default;
const __VLS_300 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    model: (__VLS_ctx.importForm),
    labelWidth: "110px",
}));
const __VLS_302 = __VLS_301({
    model: (__VLS_ctx.importForm),
    labelWidth: "110px",
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
__VLS_303.slots.default;
const __VLS_304 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
    label: "目标档案",
}));
const __VLS_306 = __VLS_305({
    label: "目标档案",
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
__VLS_307.slots.default;
const __VLS_308 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
    modelValue: (__VLS_ctx.importForm.profile_id),
    filterable: true,
    placeholder: "请选择档案",
    ...{ style: {} },
}));
const __VLS_310 = __VLS_309({
    modelValue: (__VLS_ctx.importForm.profile_id),
    filterable: true,
    placeholder: "请选择档案",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
__VLS_311.slots.default;
for (const [profile] of __VLS_getVForSourceType((__VLS_ctx.profiles))) {
    const __VLS_312 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
        key: (profile.id),
        label: (profile.profile_name),
        value: (profile.id),
    }));
    const __VLS_314 = __VLS_313({
        key: (profile.id),
        label: (profile.profile_name),
        value: (profile.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_313));
}
var __VLS_311;
var __VLS_307;
const __VLS_316 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
    label: "批次号",
}));
const __VLS_318 = __VLS_317({
    label: "批次号",
}, ...__VLS_functionalComponentArgsRest(__VLS_317));
__VLS_319.slots.default;
const __VLS_320 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
    modelValue: (__VLS_ctx.importForm.batch_no),
    placeholder: "留空则自动生成批次号",
}));
const __VLS_322 = __VLS_321({
    modelValue: (__VLS_ctx.importForm.batch_no),
    placeholder: "留空则自动生成批次号",
}, ...__VLS_functionalComponentArgsRest(__VLS_321));
var __VLS_319;
const __VLS_324 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
    label: "导入格式",
}));
const __VLS_326 = __VLS_325({
    label: "导入格式",
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
__VLS_327.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "import-help" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
var __VLS_327;
const __VLS_328 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
    label: "卡密内容",
}));
const __VLS_330 = __VLS_329({
    label: "卡密内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_329));
__VLS_331.slots.default;
const __VLS_332 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
    modelValue: (__VLS_ctx.importForm.lines),
    type: "textarea",
    rows: (12),
    placeholder: "\u0043\u0041\u0052\u0044\u0030\u0030\u0031\u0020\u007c\u0020\u0050\u0041\u0053\u0053\u0030\u0030\u0031\u0020\u007c\u0020\u0043\u004f\u0044\u0045\u0030\u0030\u0031\u0020\u007c\u0020\u9996\u6279\u005c\u006e\u0043\u0041\u0052\u0044\u0030\u0030\u0032\u0020\u007c\u0020\u0050\u0041\u0053\u0053\u0030\u0030\u0032\u0020\u007c\u0020\u0043\u004f\u0044\u0045\u0030\u0030\u0032\u0020\u007c\u0020\u5907\u7528",
}));
const __VLS_334 = __VLS_333({
    modelValue: (__VLS_ctx.importForm.lines),
    type: "textarea",
    rows: (12),
    placeholder: "\u0043\u0041\u0052\u0044\u0030\u0030\u0031\u0020\u007c\u0020\u0050\u0041\u0053\u0053\u0030\u0030\u0031\u0020\u007c\u0020\u0043\u004f\u0044\u0045\u0030\u0030\u0031\u0020\u007c\u0020\u9996\u6279\u005c\u006e\u0043\u0041\u0052\u0044\u0030\u0030\u0032\u0020\u007c\u0020\u0050\u0041\u0053\u0053\u0030\u0030\u0032\u0020\u007c\u0020\u0043\u004f\u0044\u0045\u0030\u0030\u0032\u0020\u007c\u0020\u5907\u7528",
}, ...__VLS_functionalComponentArgsRest(__VLS_333));
var __VLS_331;
var __VLS_303;
{
    const { footer: __VLS_thisSlot } = __VLS_299.slots;
    const __VLS_336 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
        ...{ 'onClick': {} },
    }));
    const __VLS_338 = __VLS_337({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_337));
    let __VLS_340;
    let __VLS_341;
    let __VLS_342;
    const __VLS_343 = {
        onClick: (...[$event]) => {
            __VLS_ctx.importDialogVisible = false;
        }
    };
    __VLS_339.slots.default;
    var __VLS_339;
    const __VLS_344 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_346 = __VLS_345({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_345));
    let __VLS_348;
    let __VLS_349;
    let __VLS_350;
    const __VLS_351 = {
        onClick: (__VLS_ctx.submitImport)
    };
    __VLS_347.slots.default;
    var __VLS_347;
}
var __VLS_299;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['page-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['sku-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head']} */ ;
/** @type {__VLS_StyleScopedClasses['section-head-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['muted-text']} */ ;
/** @type {__VLS_StyleScopedClasses['pager']} */ ;
/** @type {__VLS_StyleScopedClasses['import-help']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            profilesLoading: profilesLoading,
            itemsLoading: itemsLoading,
            profiles: profiles,
            skuOptions: skuOptions,
            items: items,
            itemsTotal: itemsTotal,
            profileDialogVisible: profileDialogVisible,
            importDialogVisible: importDialogVisible,
            editingProfileId: editingProfileId,
            profileEnabled: profileEnabled,
            itemQuery: itemQuery,
            profileForm: profileForm,
            importForm: importForm,
            totals: totals,
            statusText: statusText,
            statusTagType: statusTagType,
            loadItems: loadItems,
            refreshAll: refreshAll,
            openProfileDialog: openProfileDialog,
            openImportDialog: openImportDialog,
            filterByProfile: filterByProfile,
            saveProfile: saveProfile,
            submitImport: submitImport,
            toggleItemStatus: toggleItemStatus,
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