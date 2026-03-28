import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import http from '@/api/http';
const loading = ref(false);
const rows = ref([]);
const categories = ref([]);
const openDialog = ref(false);
const editingId = ref(null);
const statusSwitch = ref(true);
const hotSwitch = ref(false);
const recommendSwitch = ref(false);
const categoryApiReady = ref(true);
const form = reactive({ category_id: 0, name: '', subtitle: '', type: 'normal', cover: '', description: '', price: 0, origin_price: 0, points_price: 0, stock: 0, limit_per_user: 0, status: 1, is_hot: 0, is_recommend: 0 });
function getDefaultCategoryId() {
    return categories.value.find((item) => item.status === 1)?.id || categories.value[0]?.id || 0;
}
function formatCategoryLabel(item) {
    return item.status === 1 ? item.name : `${item.name}（已停用）`;
}
function resetForm() {
    Object.assign(form, { category_id: getDefaultCategoryId(), name: '', subtitle: '', type: 'normal', cover: '', description: '', price: 0, origin_price: 0, points_price: 0, stock: 0, limit_per_user: 0, status: 1, is_hot: 0, is_recommend: 0 });
    statusSwitch.value = true;
    hotSwitch.value = false;
    recommendSwitch.value = false;
    editingId.value = null;
}
async function loadCategories() {
    try {
        const res = await http.get('/admin/categories');
        categories.value = res.data || [];
        categoryApiReady.value = true;
    }
    catch (error) {
        if (Number(error?.response?.status || 0) === 404) {
            categoryApiReady.value = false;
            ElMessage.warning('后台分类接口未生效，先使用公开分类列表展示，请重启后端服务后再试新增或修改分类。');
            const fallback = await http.get('/categories');
            categories.value = fallback.data || [];
        }
        else {
            throw error;
        }
    }
    if (!form.category_id) {
        form.category_id = getDefaultCategoryId();
    }
}
async function loadProducts() {
    loading.value = true;
    try {
        const res = await http.get('/admin/products', { params: { page: 1, page_size: 50 } });
        rows.value = res.data.list;
    }
    finally {
        loading.value = false;
    }
}
async function openCreate() {
    if (!categories.value.length) {
        await loadCategories();
    }
    resetForm();
    openDialog.value = true;
}
function openEdit(row) {
    editingId.value = row.id;
    Object.assign(form, {
        category_id: row.category_id,
        name: row.name,
        subtitle: row.subtitle,
        type: row.type,
        cover: row.cover || '',
        description: row.description || '',
        price: Number(row.price || 0),
        origin_price: Number(row.origin_price || 0),
        points_price: Number(row.points_price || 0),
        stock: Number(row.stock || 0),
        limit_per_user: Number(row.limit_per_user || 0),
    });
    statusSwitch.value = row.status === 1;
    hotSwitch.value = row.is_hot === 1;
    recommendSwitch.value = row.is_recommend === 1;
    openDialog.value = true;
}
async function saveProduct() {
    if (!form.category_id) {
        ElMessage.warning('请先选择商品分类');
        return;
    }
    const payload = { ...form, status: statusSwitch.value ? 1 : 0, is_hot: hotSwitch.value ? 1 : 0, is_recommend: recommendSwitch.value ? 1 : 0 };
    if (editingId.value) {
        await http.put(`/admin/products/${editingId.value}`, payload);
        ElMessage.success('商品更新成功');
    }
    else {
        await http.post('/admin/products', payload);
        ElMessage.success('商品创建成功');
    }
    openDialog.value = false;
    resetForm();
    await loadProducts();
}
onMounted(async () => {
    try {
        await Promise.all([loadCategories(), loadProducts()]);
    }
    catch {
        if (!rows.value.length) {
            rows.value = [];
        }
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
const __VLS_8 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    data: (__VLS_ctx.rows),
}));
const __VLS_10 = __VLS_9({
    data: (__VLS_ctx.rows),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_11.slots.default;
const __VLS_12 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    prop: "name",
    label: "商品名称",
    minWidth: "220",
}));
const __VLS_14 = __VLS_13({
    prop: "name",
    label: "商品名称",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    prop: "category_name",
    label: "分类",
    width: "140",
}));
const __VLS_18 = __VLS_17({
    prop: "category_name",
    label: "分类",
    width: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const __VLS_20 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    prop: "type",
    label: "类型",
    width: "120",
}));
const __VLS_22 = __VLS_21({
    prop: "type",
    label: "类型",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_24 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    prop: "price",
    label: "现金价",
    width: "120",
}));
const __VLS_26 = __VLS_25({
    prop: "price",
    label: "现金价",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    prop: "points_price",
    label: "积分价",
    width: "120",
}));
const __VLS_30 = __VLS_29({
    prop: "points_price",
    label: "积分价",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const __VLS_32 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    prop: "stock",
    label: "库存",
    width: "100",
}));
const __VLS_34 = __VLS_33({
    prop: "stock",
    label: "库存",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_38 = __VLS_37({
    prop: "status",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_39.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_40 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        type: (row.status === 1 ? 'success' : 'info'),
    }));
    const __VLS_42 = __VLS_41({
        type: (row.status === 1 ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    (row.status === 1 ? '上架' : '下架');
    var __VLS_43;
}
var __VLS_39;
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "操作",
    width: "160",
}));
const __VLS_46 = __VLS_45({
    label: "操作",
    width: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_47.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_48 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_50 = __VLS_49({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_52;
    let __VLS_53;
    let __VLS_54;
    const __VLS_55 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openEdit(row);
        }
    };
    __VLS_51.slots.default;
    var __VLS_51;
}
var __VLS_47;
var __VLS_11;
const __VLS_56 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.openDialog),
    title: (__VLS_ctx.editingId ? '编辑商品' : '新建商品'),
    width: "720px",
    appendToBody: true,
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.openDialog),
    title: (__VLS_ctx.editingId ? '编辑商品' : '新建商品'),
    width: "720px",
    appendToBody: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    model: (__VLS_ctx.form),
    labelWidth: "110px",
}));
const __VLS_62 = __VLS_61({
    model: (__VLS_ctx.form),
    labelWidth: "110px",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "分类",
}));
const __VLS_66 = __VLS_65({
    label: "分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.form.category_id),
    placeholder: "请选择分类",
    filterable: true,
    ...{ style: {} },
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.form.category_id),
    placeholder: "请选择分类",
    filterable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.categories))) {
    const __VLS_72 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        key: (item.id),
        label: (__VLS_ctx.formatCategoryLabel(item)),
        value: (item.id),
    }));
    const __VLS_74 = __VLS_73({
        key: (item.id),
        label: (__VLS_ctx.formatCategoryLabel(item)),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
}
var __VLS_71;
var __VLS_67;
const __VLS_76 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "商品名称",
}));
const __VLS_78 = __VLS_77({
    label: "商品名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.form.name),
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.form.name),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
var __VLS_79;
const __VLS_84 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "副标题",
}));
const __VLS_86 = __VLS_85({
    label: "副标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    modelValue: (__VLS_ctx.form.subtitle),
}));
const __VLS_90 = __VLS_89({
    modelValue: (__VLS_ctx.form.subtitle),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
var __VLS_87;
const __VLS_92 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    label: "封面图",
}));
const __VLS_94 = __VLS_93({
    label: "封面图",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    modelValue: (__VLS_ctx.form.cover),
}));
const __VLS_98 = __VLS_97({
    modelValue: (__VLS_ctx.form.cover),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
var __VLS_95;
const __VLS_100 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "商品说明",
}));
const __VLS_102 = __VLS_101({
    label: "商品说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (4),
}));
const __VLS_106 = __VLS_105({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
var __VLS_103;
const __VLS_108 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "类型",
}));
const __VLS_110 = __VLS_109({
    label: "类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    modelValue: (__VLS_ctx.form.type),
    ...{ style: {} },
}));
const __VLS_114 = __VLS_113({
    modelValue: (__VLS_ctx.form.type),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    label: "普通",
    value: "normal",
}));
const __VLS_118 = __VLS_117({
    label: "普通",
    value: "normal",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
const __VLS_120 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    label: "积分",
    value: "points",
}));
const __VLS_122 = __VLS_121({
    label: "积分",
    value: "points",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
const __VLS_124 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "限购",
    value: "limited",
}));
const __VLS_126 = __VLS_125({
    label: "限购",
    value: "limited",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
var __VLS_115;
var __VLS_111;
const __VLS_128 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    label: "现金价",
}));
const __VLS_130 = __VLS_129({
    label: "现金价",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
const __VLS_132 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    modelValue: (__VLS_ctx.form.price),
    min: (0),
    precision: (2),
}));
const __VLS_134 = __VLS_133({
    modelValue: (__VLS_ctx.form.price),
    min: (0),
    precision: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
var __VLS_131;
const __VLS_136 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    label: "原价",
}));
const __VLS_138 = __VLS_137({
    label: "原价",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    modelValue: (__VLS_ctx.form.origin_price),
    min: (0),
    precision: (2),
}));
const __VLS_142 = __VLS_141({
    modelValue: (__VLS_ctx.form.origin_price),
    min: (0),
    precision: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
var __VLS_139;
const __VLS_144 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    label: "积分价",
}));
const __VLS_146 = __VLS_145({
    label: "积分价",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    modelValue: (__VLS_ctx.form.points_price),
    min: (0),
}));
const __VLS_150 = __VLS_149({
    modelValue: (__VLS_ctx.form.points_price),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
var __VLS_147;
const __VLS_152 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    label: "库存",
}));
const __VLS_154 = __VLS_153({
    label: "库存",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    modelValue: (__VLS_ctx.form.stock),
    min: (0),
}));
const __VLS_158 = __VLS_157({
    modelValue: (__VLS_ctx.form.stock),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
var __VLS_155;
const __VLS_160 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    label: "限购",
}));
const __VLS_162 = __VLS_161({
    label: "限购",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    modelValue: (__VLS_ctx.form.limit_per_user),
    min: (0),
}));
const __VLS_166 = __VLS_165({
    modelValue: (__VLS_ctx.form.limit_per_user),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
var __VLS_163;
const __VLS_168 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    label: "上架状态",
}));
const __VLS_170 = __VLS_169({
    label: "上架状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    modelValue: (__VLS_ctx.statusSwitch),
}));
const __VLS_174 = __VLS_173({
    modelValue: (__VLS_ctx.statusSwitch),
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
var __VLS_171;
const __VLS_176 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    label: "热门推荐",
}));
const __VLS_178 = __VLS_177({
    label: "热门推荐",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
const __VLS_180 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    modelValue: (__VLS_ctx.hotSwitch),
}));
const __VLS_182 = __VLS_181({
    modelValue: (__VLS_ctx.hotSwitch),
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
var __VLS_183;
const __VLS_184 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    modelValue: (__VLS_ctx.recommendSwitch),
}));
const __VLS_186 = __VLS_185({
    modelValue: (__VLS_ctx.recommendSwitch),
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
var __VLS_187;
var __VLS_179;
var __VLS_63;
{
    const { footer: __VLS_thisSlot } = __VLS_59.slots;
    const __VLS_188 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        ...{ 'onClick': {} },
    }));
    const __VLS_190 = __VLS_189({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    let __VLS_192;
    let __VLS_193;
    let __VLS_194;
    const __VLS_195 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openDialog = false;
        }
    };
    __VLS_191.slots.default;
    var __VLS_191;
    const __VLS_196 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_198 = __VLS_197({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    let __VLS_200;
    let __VLS_201;
    let __VLS_202;
    const __VLS_203 = {
        onClick: (__VLS_ctx.saveProduct)
    };
    __VLS_199.slots.default;
    var __VLS_199;
}
var __VLS_59;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            rows: rows,
            categories: categories,
            openDialog: openDialog,
            editingId: editingId,
            statusSwitch: statusSwitch,
            hotSwitch: hotSwitch,
            recommendSwitch: recommendSwitch,
            form: form,
            formatCategoryLabel: formatCategoryLabel,
            openCreate: openCreate,
            openEdit: openEdit,
            saveProduct: saveProduct,
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