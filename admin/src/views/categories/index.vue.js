import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import http from '@/api/http';
const loading = ref(false);
const rows = ref([]);
const dialogVisible = ref(false);
const editingId = ref(null);
const adminApiReady = ref(true);
const form = reactive({
    parent_id: 0,
    name: '',
    icon: '',
    sort: 0,
    status: 1,
});
const parentOptions = computed(() => rows.value.filter((item) => item.id !== editingId.value));
function resetForm() {
    editingId.value = null;
    form.parent_id = 0;
    form.name = '';
    form.icon = '';
    form.sort = 0;
    form.status = 1;
}
function getParentName(parentId) {
    if (!parentId)
        return '顶级分类';
    return rows.value.find((item) => item.id === parentId)?.name || `#${parentId}`;
}
async function loadCategories() {
    loading.value = true;
    try {
        try {
            const res = await http.get('/admin/categories');
            rows.value = res.data || [];
            adminApiReady.value = true;
        }
        catch (error) {
            if (Number(error?.response?.status || 0) !== 404) {
                throw error;
            }
            adminApiReady.value = false;
            const fallback = await http.get('/categories');
            rows.value = fallback.data || [];
        }
    }
    finally {
        loading.value = false;
    }
}
function openCreate() {
    if (!adminApiReady.value) {
        ElMessage.warning('请先重启后端服务，再使用分类新增功能');
        return;
    }
    resetForm();
    dialogVisible.value = true;
}
function openEdit(row) {
    if (!adminApiReady.value) {
        ElMessage.warning('请先重启后端服务，再使用分类编辑功能');
        return;
    }
    editingId.value = row.id;
    form.parent_id = Number(row.parent_id || 0);
    form.name = row.name || '';
    form.icon = row.icon || '';
    form.sort = Number(row.sort || 0);
    form.status = row.status === 1 ? 1 : 0;
    dialogVisible.value = true;
}
async function saveCategory() {
    if (!adminApiReady.value) {
        ElMessage.error('后台分类接口未生效，请重启后端服务后再试');
        return;
    }
    if (!form.name.trim()) {
        ElMessage.warning('请输入分类名称');
        return;
    }
    const payload = {
        parent_id: Number(form.parent_id || 0),
        name: form.name.trim(),
        icon: form.icon.trim(),
        sort: Number(form.sort || 0),
        status: Number(form.status || 0),
    };
    if (editingId.value) {
        await http.put(`/admin/categories/${editingId.value}`, payload);
        ElMessage.success('分类更新成功');
    }
    else {
        await http.post('/admin/categories', payload);
        ElMessage.success('分类创建成功');
    }
    dialogVisible.value = false;
    resetForm();
    await loadCategories();
}
onMounted(async () => {
    try {
        await loadCategories();
    }
    catch {
        rows.value = [];
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "admin-panel page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.openCreate)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.loadCategories)
};
__VLS_11.slots.default;
var __VLS_11;
if (!__VLS_ctx.adminApiReady) {
    const __VLS_16 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        type: "warning",
        closable: (false),
        title: "当前后端还没有加载最新的分类管理接口，列表先回退到公开分类接口；如需新增或修改分类，请先重启后端服务。",
        ...{ class: "warn-banner" },
    }));
    const __VLS_18 = __VLS_17({
        type: "warning",
        closable: (false),
        title: "当前后端还没有加载最新的分类管理接口，列表先回退到公开分类接口；如需新增或修改分类，请先重启后端服务。",
        ...{ class: "warn-banner" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
const __VLS_20 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    data: (__VLS_ctx.rows),
}));
const __VLS_22 = __VLS_21({
    data: (__VLS_ctx.rows),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_23.slots.default;
const __VLS_24 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_26 = __VLS_25({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    prop: "name",
    label: "分类名称",
    minWidth: "180",
}));
const __VLS_30 = __VLS_29({
    prop: "name",
    label: "分类名称",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const __VLS_32 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "父级分类",
    minWidth: "160",
}));
const __VLS_34 = __VLS_33({
    label: "父级分类",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_35.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.getParentName(row.parent_id));
}
var __VLS_35;
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    prop: "icon",
    label: "图标",
    minWidth: "140",
}));
const __VLS_38 = __VLS_37({
    prop: "icon",
    label: "图标",
    minWidth: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    prop: "sort",
    label: "排序",
    width: "100",
}));
const __VLS_42 = __VLS_41({
    prop: "sort",
    label: "排序",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "状态",
    width: "100",
}));
const __VLS_46 = __VLS_45({
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_47.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_48 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        type: (row.status === 1 ? 'success' : 'info'),
    }));
    const __VLS_50 = __VLS_49({
        type: (row.status === 1 ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    (row.status === 1 ? '启用' : '停用');
    var __VLS_51;
}
var __VLS_47;
const __VLS_52 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    prop: "updated_at",
    label: "更新时间",
    minWidth: "180",
}));
const __VLS_54 = __VLS_53({
    prop: "updated_at",
    label: "更新时间",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
const __VLS_56 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "操作",
    width: "120",
}));
const __VLS_58 = __VLS_57({
    label: "操作",
    width: "120",
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
        disabled: (!__VLS_ctx.adminApiReady),
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        disabled: (!__VLS_ctx.adminApiReady),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openEdit(row);
        }
    };
    __VLS_63.slots.default;
    var __VLS_63;
}
var __VLS_59;
var __VLS_23;
const __VLS_68 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.editingId ? '编辑分类' : '新增分类'),
    width: "560px",
    appendToBody: true,
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.editingId ? '编辑分类' : '新增分类'),
    width: "560px",
    appendToBody: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}));
const __VLS_74 = __VLS_73({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "分类名称",
}));
const __VLS_78 = __VLS_77({
    label: "分类名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "请输入分类名称",
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "请输入分类名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
var __VLS_79;
const __VLS_84 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "父级分类",
}));
const __VLS_86 = __VLS_85({
    label: "父级分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    modelValue: (__VLS_ctx.form.parent_id),
    ...{ style: {} },
}));
const __VLS_90 = __VLS_89({
    modelValue: (__VLS_ctx.form.parent_id),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    label: "顶级分类",
    value: (0),
}));
const __VLS_94 = __VLS_93({
    label: "顶级分类",
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.parentOptions))) {
    const __VLS_96 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }));
    const __VLS_98 = __VLS_97({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
}
var __VLS_91;
var __VLS_87;
const __VLS_100 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "图标标识",
}));
const __VLS_102 = __VLS_101({
    label: "图标标识",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    modelValue: (__VLS_ctx.form.icon),
    placeholder: "可选，例如 book / ticket",
}));
const __VLS_106 = __VLS_105({
    modelValue: (__VLS_ctx.form.icon),
    placeholder: "可选，例如 book / ticket",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
var __VLS_103;
const __VLS_108 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "排序值",
}));
const __VLS_110 = __VLS_109({
    label: "排序值",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    modelValue: (__VLS_ctx.form.sort),
    min: (0),
    ...{ style: {} },
}));
const __VLS_114 = __VLS_113({
    modelValue: (__VLS_ctx.form.sort),
    min: (0),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
var __VLS_111;
const __VLS_116 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    label: "启用状态",
}));
const __VLS_118 = __VLS_117({
    label: "启用状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_122 = __VLS_121({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
var __VLS_119;
var __VLS_75;
{
    const { footer: __VLS_thisSlot } = __VLS_71.slots;
    const __VLS_124 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        ...{ 'onClick': {} },
    }));
    const __VLS_126 = __VLS_125({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    let __VLS_128;
    let __VLS_129;
    let __VLS_130;
    const __VLS_131 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_127.slots.default;
    var __VLS_127;
    const __VLS_132 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (!__VLS_ctx.adminApiReady),
    }));
    const __VLS_134 = __VLS_133({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (!__VLS_ctx.adminApiReady),
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    let __VLS_136;
    let __VLS_137;
    let __VLS_138;
    const __VLS_139 = {
        onClick: (__VLS_ctx.saveCategory)
    };
    __VLS_135.slots.default;
    var __VLS_135;
}
var __VLS_71;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['warn-banner']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            rows: rows,
            dialogVisible: dialogVisible,
            editingId: editingId,
            adminApiReady: adminApiReady,
            form: form,
            parentOptions: parentOptions,
            getParentName: getParentName,
            loadCategories: loadCategories,
            openCreate: openCreate,
            openEdit: openEdit,
            saveCategory: saveCategory,
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