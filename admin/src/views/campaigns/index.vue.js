import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import http from '@/api/http';
const loading = ref(false);
const rows = ref([]);
const allProducts = ref([]);
const allSkus = ref([]);
async function loadAllProducts() {
    try {
        const res = await http.get('/admin/products', { params: { page: 1, page_size: 100 } });
        allProducts.value = res.data.list || [];
    }
    catch { }
}
async function onProductSelect(val) {
    goodForm.sku_id = undefined;
    goodForm.seckill_price = 0;
    allSkus.value = [];
    try {
        const res = await http.get(`/products/${val}`);
        allSkus.value = res.data.skus || [];
        if (allSkus.value.length === 1) {
            goodForm.sku_id = allSkus.value[0].id;
            onSkuSelect(goodForm.sku_id);
        }
    }
    catch { }
}
function onSkuSelect(skuId) {
    const sku = allSkus.value.find(s => s.id === skuId);
    if (sku) {
        goodForm.seckill_price = sku.price;
        goodForm.stock = sku.stock;
    }
}
const dialog = reactive({
    visible: false,
    isEdit: false,
});
const form = reactive({
    id: 0,
    name: '',
    type: 'seckill',
    range: [],
    status: 1,
    banner: '',
    rules: '{}',
});
const goodsDialog = reactive({
    visible: false,
    campaignId: 0,
    campaignName: '',
    list: [],
});
const goodFormDialog = reactive({
    visible: false,
    isEdit: false,
});
const goodForm = reactive({
    id: 0,
    seckill_campaign_id: 0,
    product_id: 0,
    sku_id: 0,
    seckill_price: 0,
    stock: 0,
    status: 1,
});
async function loadCampaigns() {
    loading.value = true;
    try {
        const res = await http.get('/admin/campaigns');
        rows.value = res.data || [];
    }
    finally {
        loading.value = false;
    }
}
function handleAdd() {
    dialog.isEdit = false;
    form.id = 0;
    form.name = '';
    form.type = 'seckill';
    form.range = [];
    form.status = 1;
    form.banner = '';
    dialog.visible = true;
}
function handleEdit(row) {
    dialog.isEdit = true;
    form.id = row.id;
    form.name = row.name;
    form.type = row.type;
    form.range = [row.start_at, row.end_at];
    form.status = row.status;
    form.banner = row.banner;
    form.rules = row.rules || '{}';
    dialog.visible = true;
}
async function submitCampaign() {
    if (!form.name || form.range.length < 2) {
        return ElMessage.warning('请填写完整信息');
    }
    const payload = {
        ...form,
        start_at: form.range[0],
        end_at: form.range[1],
    };
    delete payload.range;
    try {
        if (dialog.isEdit) {
            await http.put(`/admin/campaigns/${form.id}`, payload);
        }
        else {
            await http.post('/admin/campaigns', payload);
        }
        ElMessage.success('操作成功');
        dialog.visible = false;
        loadCampaigns();
    }
    catch { }
}
async function handleDelete(id) {
    await ElMessageBox.confirm('确定删除该活动吗？', '提示', { type: 'warning' });
    await http.delete(`/admin/campaigns/${id}`);
    ElMessage.success('已删除');
    loadCampaigns();
}
async function handleManageGoods(row) {
    goodsDialog.campaignId = row.id;
    goodsDialog.campaignName = row.name;
    goodsDialog.visible = true;
    loadGoods();
}
async function loadGoods() {
    const res = await http.get(`/admin/seckill/goods?campaign_id=${goodsDialog.campaignId}`);
    goodsDialog.list = res.data || [];
}
function prepareAddGood() {
    goodFormDialog.isEdit = false;
    goodForm.id = 0;
    goodForm.seckill_campaign_id = goodsDialog.campaignId;
    goodForm.product_id = undefined;
    goodForm.sku_id = undefined;
    goodForm.seckill_price = 0;
    goodForm.stock = 10;
    goodForm.status = 1;
    allSkus.value = [];
    loadAllProducts();
    goodFormDialog.visible = true;
}
function editGood(row) {
    goodFormDialog.isEdit = true;
    Object.assign(goodForm, row);
    goodFormDialog.visible = true;
}
async function submitGood() {
    try {
        if (goodFormDialog.isEdit) {
            await http.put(`/admin/seckill/goods/${goodForm.id}`, goodForm);
        }
        else {
            await http.post('/admin/seckill/goods', goodForm);
        }
        ElMessage.success('保存成功');
        goodFormDialog.visible = false;
        loadGoods();
    }
    catch { }
}
async function deleteGood(id) {
    await ElMessageBox.confirm('确定移除该秒杀商品吗？', '提示', { type: 'warning' });
    await http.delete(`/admin/seckill/goods/${id}`);
    ElMessage.success('已移除');
    loadGoods();
}
async function warmup(id) {
    await http.post(`/admin/seckill/${id}/warmup`);
    ElMessage.success('秒杀库存预热成功');
}
onMounted(loadCampaigns);
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
    onClick: (__VLS_ctx.handleAdd)
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
    onClick: (__VLS_ctx.loadCampaigns)
};
__VLS_11.slots.default;
var __VLS_11;
const __VLS_16 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    data: (__VLS_ctx.rows),
}));
const __VLS_18 = __VLS_17({
    data: (__VLS_ctx.rows),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_19.slots.default;
const __VLS_20 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    prop: "name",
    label: "活动名称",
    minWidth: "220",
}));
const __VLS_22 = __VLS_21({
    prop: "name",
    label: "活动名称",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_24 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    prop: "type",
    label: "类型",
    width: "120",
}));
const __VLS_26 = __VLS_25({
    prop: "type",
    label: "类型",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_27.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_28 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        type: (row.type === 'seckill' ? 'danger' : 'primary'),
    }));
    const __VLS_30 = __VLS_29({
        type: (row.type === 'seckill' ? 'danger' : 'primary'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    (row.type);
    var __VLS_31;
}
var __VLS_27;
const __VLS_32 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "活动时间",
    minWidth: "280",
}));
const __VLS_34 = __VLS_33({
    label: "活动时间",
    minWidth: "280",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_35.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (row.start_at);
    (row.end_at);
}
var __VLS_35;
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "状态",
    width: "100",
}));
const __VLS_38 = __VLS_37({
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
    (row.status === 1 ? '开启' : '关闭');
    var __VLS_43;
}
var __VLS_39;
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "操作",
    width: "280",
    fixed: "right",
}));
const __VLS_46 = __VLS_45({
    label: "操作",
    width: "280",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_47.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
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
            __VLS_ctx.handleEdit(scope.row);
        }
    };
    __VLS_51.slots.default;
    var __VLS_51;
    if (scope.row.type === 'seckill') {
        const __VLS_56 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            ...{ 'onClick': {} },
            link: true,
            type: "success",
        }));
        const __VLS_58 = __VLS_57({
            ...{ 'onClick': {} },
            link: true,
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        let __VLS_60;
        let __VLS_61;
        let __VLS_62;
        const __VLS_63 = {
            onClick: (...[$event]) => {
                if (!(scope.row.type === 'seckill'))
                    return;
                __VLS_ctx.handleManageGoods(scope.row);
            }
        };
        __VLS_59.slots.default;
        var __VLS_59;
    }
    if (scope.row.type === 'seckill') {
        const __VLS_64 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            ...{ 'onClick': {} },
            link: true,
            type: "warning",
        }));
        const __VLS_66 = __VLS_65({
            ...{ 'onClick': {} },
            link: true,
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        let __VLS_68;
        let __VLS_69;
        let __VLS_70;
        const __VLS_71 = {
            onClick: (...[$event]) => {
                if (!(scope.row.type === 'seckill'))
                    return;
                __VLS_ctx.warmup(scope.row.id);
            }
        };
        __VLS_67.slots.default;
        var __VLS_67;
    }
    const __VLS_72 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_76;
    let __VLS_77;
    let __VLS_78;
    const __VLS_79 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleDelete(scope.row.id);
        }
    };
    __VLS_75.slots.default;
    var __VLS_75;
}
var __VLS_47;
var __VLS_19;
const __VLS_80 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.dialog.visible),
    title: (__VLS_ctx.dialog.isEdit ? '编辑活动' : '新增活动'),
    width: "50%",
    minWidth: "500px",
    appendToBody: true,
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.dialog.visible),
    title: (__VLS_ctx.dialog.isEdit ? '编辑活动' : '新增活动'),
    width: "50%",
    minWidth: "500px",
    appendToBody: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}));
const __VLS_86 = __VLS_85({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    label: "活动名称",
}));
const __VLS_90 = __VLS_89({
    label: "活动名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "请输入活动名称",
}));
const __VLS_94 = __VLS_93({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "请输入活动名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
var __VLS_91;
const __VLS_96 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    label: "活动类型",
}));
const __VLS_98 = __VLS_97({
    label: "活动类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    modelValue: (__VLS_ctx.form.type),
    placeholder: "请选择类型",
    ...{ style: {} },
}));
const __VLS_102 = __VLS_101({
    modelValue: (__VLS_ctx.form.type),
    placeholder: "请选择类型",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    label: "秒杀 (Seckill)",
    value: "seckill",
}));
const __VLS_106 = __VLS_105({
    label: "秒杀 (Seckill)",
    value: "seckill",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
const __VLS_108 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "优惠券 (Coupon)",
    value: "coupon",
}));
const __VLS_110 = __VLS_109({
    label: "优惠券 (Coupon)",
    value: "coupon",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
const __VLS_112 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    label: "普通营销 (Marketing)",
    value: "marketing",
}));
const __VLS_114 = __VLS_113({
    label: "普通营销 (Marketing)",
    value: "marketing",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
var __VLS_103;
var __VLS_99;
const __VLS_116 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    label: "时间范围",
}));
const __VLS_118 = __VLS_117({
    label: "时间范围",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    modelValue: (__VLS_ctx.form.range),
    type: "datetimerange",
    rangeSeparator: "To",
    startPlaceholder: "Start",
    endPlaceholder: "End",
    valueFormat: "YYYY-MM-DDTHH:mm:ssZ",
}));
const __VLS_122 = __VLS_121({
    modelValue: (__VLS_ctx.form.range),
    type: "datetimerange",
    rangeSeparator: "To",
    startPlaceholder: "Start",
    endPlaceholder: "End",
    valueFormat: "YYYY-MM-DDTHH:mm:ssZ",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
var __VLS_119;
const __VLS_124 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "活动状态",
}));
const __VLS_126 = __VLS_125({
    label: "活动状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_130 = __VLS_129({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
var __VLS_127;
const __VLS_132 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    label: "活动头图",
}));
const __VLS_134 = __VLS_133({
    label: "活动头图",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    modelValue: (__VLS_ctx.form.banner),
    placeholder: "URL",
}));
const __VLS_138 = __VLS_137({
    modelValue: (__VLS_ctx.form.banner),
    placeholder: "URL",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
var __VLS_135;
var __VLS_87;
{
    const { footer: __VLS_thisSlot } = __VLS_83.slots;
    const __VLS_140 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
        ...{ 'onClick': {} },
    }));
    const __VLS_142 = __VLS_141({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    let __VLS_144;
    let __VLS_145;
    let __VLS_146;
    const __VLS_147 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialog.visible = false;
        }
    };
    __VLS_143.slots.default;
    var __VLS_143;
    const __VLS_148 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_150 = __VLS_149({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    let __VLS_152;
    let __VLS_153;
    let __VLS_154;
    const __VLS_155 = {
        onClick: (__VLS_ctx.submitCampaign)
    };
    __VLS_151.slots.default;
    var __VLS_151;
}
var __VLS_83;
const __VLS_156 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    modelValue: (__VLS_ctx.goodsDialog.visible),
    title: (`管理秒杀商品 - ${__VLS_ctx.goodsDialog.campaignName}`),
    width: "80%",
    appendToBody: true,
}));
const __VLS_158 = __VLS_157({
    modelValue: (__VLS_ctx.goodsDialog.visible),
    title: (`管理秒杀商品 - ${__VLS_ctx.goodsDialog.campaignName}`),
    width: "80%",
    appendToBody: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "goods-toolbar" },
});
const __VLS_160 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_162 = __VLS_161({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
let __VLS_164;
let __VLS_165;
let __VLS_166;
const __VLS_167 = {
    onClick: (__VLS_ctx.prepareAddGood)
};
__VLS_163.slots.default;
var __VLS_163;
const __VLS_168 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    data: (__VLS_ctx.goodsDialog.list),
    border: true,
    ...{ style: {} },
}));
const __VLS_170 = __VLS_169({
    data: (__VLS_ctx.goodsDialog.list),
    border: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    prop: "product_id",
    label: "商品ID",
    width: "100",
}));
const __VLS_174 = __VLS_173({
    prop: "product_id",
    label: "商品ID",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
const __VLS_176 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    prop: "sku_id",
    label: "SKU ID",
    width: "100",
}));
const __VLS_178 = __VLS_177({
    prop: "sku_id",
    label: "SKU ID",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
const __VLS_180 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    prop: "seckill_price",
    label: "秒杀价",
}));
const __VLS_182 = __VLS_181({
    prop: "seckill_price",
    label: "秒杀价",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_183.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (row.seckill_price.toFixed(2));
}
var __VLS_183;
const __VLS_184 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    prop: "stock",
    label: "秒杀总库存",
}));
const __VLS_186 = __VLS_185({
    prop: "stock",
    label: "秒杀总库存",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
const __VLS_188 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    prop: "available_stock",
    label: "可用库存",
}));
const __VLS_190 = __VLS_189({
    prop: "available_stock",
    label: "可用库存",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
const __VLS_192 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    label: "操作",
    width: "150",
}));
const __VLS_194 = __VLS_193({
    label: "操作",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_195.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_196 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_198 = __VLS_197({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    let __VLS_200;
    let __VLS_201;
    let __VLS_202;
    const __VLS_203 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editGood(scope.row);
        }
    };
    __VLS_199.slots.default;
    var __VLS_199;
    const __VLS_204 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }));
    const __VLS_206 = __VLS_205({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    let __VLS_208;
    let __VLS_209;
    let __VLS_210;
    const __VLS_211 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteGood(scope.row.id);
        }
    };
    __VLS_207.slots.default;
    var __VLS_207;
}
var __VLS_195;
var __VLS_171;
var __VLS_159;
const __VLS_212 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    modelValue: (__VLS_ctx.goodFormDialog.visible),
    title: (__VLS_ctx.goodFormDialog.isEdit ? '编辑秒杀参数' : '添加秒杀商品'),
    appendToBody: true,
    width: "40%",
    minWidth: "400px",
}));
const __VLS_214 = __VLS_213({
    modelValue: (__VLS_ctx.goodFormDialog.visible),
    title: (__VLS_ctx.goodFormDialog.isEdit ? '编辑秒杀参数' : '添加秒杀商品'),
    appendToBody: true,
    width: "40%",
    minWidth: "400px",
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
__VLS_215.slots.default;
const __VLS_216 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    model: (__VLS_ctx.goodForm),
    labelWidth: "100px",
}));
const __VLS_218 = __VLS_217({
    model: (__VLS_ctx.goodForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
__VLS_219.slots.default;
const __VLS_220 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    label: "选择商品",
}));
const __VLS_222 = __VLS_221({
    label: "选择商品",
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
__VLS_223.slots.default;
const __VLS_224 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.goodForm.product_id),
    filterable: true,
    placeholder: "请选择商品",
    disabled: (__VLS_ctx.goodFormDialog.isEdit),
    ...{ style: {} },
}));
const __VLS_226 = __VLS_225({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.goodForm.product_id),
    filterable: true,
    placeholder: "请选择商品",
    disabled: (__VLS_ctx.goodFormDialog.isEdit),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
let __VLS_228;
let __VLS_229;
let __VLS_230;
const __VLS_231 = {
    onChange: (__VLS_ctx.onProductSelect)
};
__VLS_227.slots.default;
for (const [p] of __VLS_getVForSourceType((__VLS_ctx.allProducts))) {
    const __VLS_232 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
        key: (p.id),
        label: (p.name),
        value: (p.id),
    }));
    const __VLS_234 = __VLS_233({
        key: (p.id),
        label: (p.name),
        value: (p.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_233));
}
var __VLS_227;
var __VLS_223;
const __VLS_236 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    label: "选择 SKU",
}));
const __VLS_238 = __VLS_237({
    label: "选择 SKU",
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
__VLS_239.slots.default;
const __VLS_240 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.goodForm.sku_id),
    filterable: true,
    placeholder: "请选择 SKU",
    disabled: (__VLS_ctx.goodFormDialog.isEdit),
    ...{ style: {} },
}));
const __VLS_242 = __VLS_241({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.goodForm.sku_id),
    filterable: true,
    placeholder: "请选择 SKU",
    disabled: (__VLS_ctx.goodFormDialog.isEdit),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
let __VLS_244;
let __VLS_245;
let __VLS_246;
const __VLS_247 = {
    onChange: (__VLS_ctx.onSkuSelect)
};
__VLS_243.slots.default;
for (const [sku] of __VLS_getVForSourceType((__VLS_ctx.allSkus))) {
    const __VLS_248 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
        key: (sku.id),
        label: (sku.title),
        value: (sku.id),
    }));
    const __VLS_250 = __VLS_249({
        key: (sku.id),
        label: (sku.title),
        value: (sku.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
}
var __VLS_243;
var __VLS_239;
const __VLS_252 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    label: "秒杀价格",
}));
const __VLS_254 = __VLS_253({
    label: "秒杀价格",
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
__VLS_255.slots.default;
const __VLS_256 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
    modelValue: (__VLS_ctx.goodForm.seckill_price),
    precision: (2),
    step: (0.1),
    ...{ style: {} },
}));
const __VLS_258 = __VLS_257({
    modelValue: (__VLS_ctx.goodForm.seckill_price),
    precision: (2),
    step: (0.1),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_257));
var __VLS_255;
const __VLS_260 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
    label: "秒杀库存",
}));
const __VLS_262 = __VLS_261({
    label: "秒杀库存",
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
__VLS_263.slots.default;
const __VLS_264 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    modelValue: (__VLS_ctx.goodForm.stock),
    modelModifiers: { number: true, },
    min: (1),
    ...{ style: {} },
}));
const __VLS_266 = __VLS_265({
    modelValue: (__VLS_ctx.goodForm.stock),
    modelModifiers: { number: true, },
    min: (1),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
var __VLS_263;
const __VLS_268 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    label: "状态",
}));
const __VLS_270 = __VLS_269({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
__VLS_271.slots.default;
const __VLS_272 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
    modelValue: (__VLS_ctx.goodForm.status),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_274 = __VLS_273({
    modelValue: (__VLS_ctx.goodForm.status),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
var __VLS_271;
var __VLS_219;
{
    const { footer: __VLS_thisSlot } = __VLS_215.slots;
    const __VLS_276 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
        ...{ 'onClick': {} },
    }));
    const __VLS_278 = __VLS_277({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_277));
    let __VLS_280;
    let __VLS_281;
    let __VLS_282;
    const __VLS_283 = {
        onClick: (...[$event]) => {
            __VLS_ctx.goodFormDialog.visible = false;
        }
    };
    __VLS_279.slots.default;
    var __VLS_279;
    const __VLS_284 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_286 = __VLS_285({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_285));
    let __VLS_288;
    let __VLS_289;
    let __VLS_290;
    const __VLS_291 = {
        onClick: (__VLS_ctx.submitGood)
    };
    __VLS_287.slots.default;
    var __VLS_287;
}
var __VLS_215;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['goods-toolbar']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            rows: rows,
            allProducts: allProducts,
            allSkus: allSkus,
            onProductSelect: onProductSelect,
            onSkuSelect: onSkuSelect,
            dialog: dialog,
            form: form,
            goodsDialog: goodsDialog,
            goodFormDialog: goodFormDialog,
            goodForm: goodForm,
            loadCampaigns: loadCampaigns,
            handleAdd: handleAdd,
            handleEdit: handleEdit,
            submitCampaign: submitCampaign,
            handleDelete: handleDelete,
            handleManageGoods: handleManageGoods,
            prepareAddGood: prepareAddGood,
            editGood: editGood,
            submitGood: submitGood,
            deleteGood: deleteGood,
            warmup: warmup,
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