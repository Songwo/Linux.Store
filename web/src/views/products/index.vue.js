import { onMounted, ref } from 'vue';
import ProductCard from '@/components/ProductCard.vue';
import { mallApi } from '@/api/mall';
import { useAppStore } from '@/stores/app';
const app = useAppStore();
const loading = ref(false);
const products = ref([]);
const keyword = ref('');
const categoryId = ref('0');
const selectedType = ref('all');
const sortKey = ref('default');
const pagination = ref({ page: 1, pageSize: 12, total: 0 });
const sortOptions = [
    { label: 'Featured', value: 'default' },
    { label: 'In Stock', value: 'stock' },
    { label: 'Most Popular', value: 'sales' },
    { label: 'Price: Low', value: 'priceAsc' },
    { label: 'Price: High', value: 'priceDesc' },
];
function resolveSort() {
    switch (sortKey.value) {
        case 'stock': return { sort: 'stock', order: 'desc' };
        case 'sales': return { sort: 'sales', order: 'desc' };
        case 'priceAsc': return { sort: 'price', order: 'asc' };
        case 'priceDesc': return { sort: 'price', order: 'desc' };
        default: return { sort: '', order: '' };
    }
}
async function loadProducts() {
    loading.value = true;
    try {
        const result = await mallApi.getProducts({
            keyword: keyword.value,
            category_id: Number(categoryId.value),
            type: selectedType.value,
            page: pagination.value.page,
            page_size: pagination.value.pageSize,
            ...resolveSort(),
        });
        products.value = result.list;
        pagination.value.total = result.total;
    }
    finally {
        loading.value = false;
    }
}
function resetAndLoad() {
    pagination.value.page = 1;
    loadProducts();
}
function changePage(page) {
    pagination.value.page = page;
    loadProducts();
}
onMounted(async () => {
    if (!app.categories.length) {
        await app.loadPublicData().catch(() => undefined);
    }
    await loadProducts();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['header-main']} */ ;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['header-filters']} */ ;
/** @type {__VLS_StyleScopedClasses['product-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['product-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-header']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-tabs']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "catalog-page fade-in-up" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "catalog-header glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "page-title" },
});
(__VLS_ctx.$t('products.pageTitle'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-desc" },
});
(__VLS_ctx.$t('products.pageDesc'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.keyword),
    ...{ class: "search-bar" },
    clearable: true,
    placeholder: (__VLS_ctx.$t('common.search')),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.keyword),
    ...{ class: "search-bar" },
    clearable: true,
    placeholder: (__VLS_ctx.$t('common.search')),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.resetAndLoad)
};
__VLS_3.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "search-icon" },
    });
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-filters" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "filter-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "glass-tabs" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.categoryId = '0';
            __VLS_ctx.resetAndLoad();
        } },
    ...{ class: (['tab-btn', { active: __VLS_ctx.categoryId === '0' }]) },
});
(__VLS_ctx.$t('products.allCategories'));
for (const [cat] of __VLS_getVForSourceType((__VLS_ctx.app.categories))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.categoryId = String(cat.id);
                __VLS_ctx.resetAndLoad();
            } },
        key: (cat.id),
        ...{ class: (['tab-btn', { active: __VLS_ctx.categoryId === String(cat.id) }]) },
    });
    (cat.name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-group right" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "filter-label" },
});
const __VLS_8 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedType),
    ...{ class: "glass-select" },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedType),
    ...{ class: "glass-select" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onChange: (__VLS_ctx.resetAndLoad)
};
__VLS_11.slots.default;
const __VLS_16 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: (__VLS_ctx.$t('products.allTypes')),
    value: "all",
}));
const __VLS_18 = __VLS_17({
    label: (__VLS_ctx.$t('products.allTypes')),
    value: "all",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const __VLS_20 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: (__VLS_ctx.$t('products.standard')),
    value: "normal",
}));
const __VLS_22 = __VLS_21({
    label: (__VLS_ctx.$t('products.standard')),
    value: "normal",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_24 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: (__VLS_ctx.$t('products.pointsOnly')),
    value: "points",
}));
const __VLS_26 = __VLS_25({
    label: (__VLS_ctx.$t('products.pointsOnly')),
    value: "points",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const __VLS_28 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: (__VLS_ctx.$t('products.limited')),
    value: "limited",
}));
const __VLS_30 = __VLS_29({
    label: (__VLS_ctx.$t('products.limited')),
    value: "limited",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sort-toolbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sort-buttons" },
});
for (const [opt] of __VLS_getVForSourceType((__VLS_ctx.sortOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.sortKey = opt.value;
                __VLS_ctx.resetAndLoad();
            } },
        key: (opt.value),
        ...{ class: (['sort-btn', { active: __VLS_ctx.sortKey === opt.value }]) },
    });
    (opt.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "result-count" },
});
(__VLS_ctx.pagination.total);
(__VLS_ctx.$t('products.results', { n: '' }));
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-grid" },
    });
    for (const [index] of __VLS_getVForSourceType((6))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "skeleton-wrap glass-panel hover-float" },
        });
        const __VLS_32 = {}.ElSkeleton;
        /** @type {[typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            animated: true,
            ...{ style: {} },
        }));
        const __VLS_34 = __VLS_33({
            animated: true,
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        {
            const { template: __VLS_thisSlot } = __VLS_35.slots;
            const __VLS_36 = {}.ElSkeletonItem;
            /** @type {[typeof __VLS_components.ElSkeletonItem, typeof __VLS_components.elSkeletonItem, ]} */ ;
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
                variant: "image",
                ...{ style: {} },
            }));
            const __VLS_38 = __VLS_37({
                variant: "image",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_37));
            const __VLS_40 = {}.ElSkeletonItem;
            /** @type {[typeof __VLS_components.ElSkeletonItem, typeof __VLS_components.elSkeletonItem, ]} */ ;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
                variant: "h3",
                ...{ style: {} },
            }));
            const __VLS_42 = __VLS_41({
                variant: "h3",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            const __VLS_44 = {}.ElSkeletonItem;
            /** @type {[typeof __VLS_components.ElSkeletonItem, typeof __VLS_components.elSkeletonItem, ]} */ ;
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
                variant: "text",
                ...{ style: {} },
            }));
            const __VLS_46 = __VLS_45({
                variant: "text",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        }
        var __VLS_35;
    }
}
else if (__VLS_ctx.products.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.products))) {
        /** @type {[typeof ProductCard, ]} */ ;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent(ProductCard, new ProductCard({
            key: (item.id),
            item: (item),
        }));
        const __VLS_49 = __VLS_48({
            key: (item.id),
            item: (item),
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state glass-panel fade-in-up" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.$t('products.noMatch'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('products.pageDesc'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!!(__VLS_ctx.products.length))
                    return;
                __VLS_ctx.keyword = '';
                __VLS_ctx.categoryId = '0';
                __VLS_ctx.selectedType = 'all';
                __VLS_ctx.resetAndLoad();
            } },
        ...{ class: "clear-btn" },
    });
    (__VLS_ctx.$t('products.clearFilters'));
}
if (__VLS_ctx.pagination.total > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-wrapper" },
    });
    const __VLS_51 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        ...{ 'onCurrentChange': {} },
        background: true,
        layout: "prev, pager, next",
        currentPage: (__VLS_ctx.pagination.page),
        pageSize: (__VLS_ctx.pagination.pageSize),
        total: (__VLS_ctx.pagination.total),
        ...{ class: "glass-pagination" },
    }));
    const __VLS_53 = __VLS_52({
        ...{ 'onCurrentChange': {} },
        background: true,
        layout: "prev, pager, next",
        currentPage: (__VLS_ctx.pagination.page),
        pageSize: (__VLS_ctx.pagination.pageSize),
        total: (__VLS_ctx.pagination.total),
        ...{ class: "glass-pagination" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_55;
    let __VLS_56;
    let __VLS_57;
    const __VLS_58 = {
        onCurrentChange: (__VLS_ctx.changePage)
    };
    var __VLS_54;
}
/** @type {__VLS_StyleScopedClasses['catalog-page']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-header']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['header-main']} */ ;
/** @type {__VLS_StyleScopedClasses['header-text']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['search-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['header-filters']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-group']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-label']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-group']} */ ;
/** @type {__VLS_StyleScopedClasses['right']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-label']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-select']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['result-count']} */ ;
/** @type {__VLS_StyleScopedClasses['product-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-float']} */ ;
/** @type {__VLS_StyleScopedClasses['product-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-in-up']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-pagination']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ProductCard: ProductCard,
            app: app,
            loading: loading,
            products: products,
            keyword: keyword,
            categoryId: categoryId,
            selectedType: selectedType,
            sortKey: sortKey,
            pagination: pagination,
            sortOptions: sortOptions,
            resetAndLoad: resetAndLoad,
            changePage: changePage,
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