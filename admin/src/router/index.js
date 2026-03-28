import { createRouter, createWebHistory } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import AdminLayout from '@/layouts/AdminLayout.vue';
const routes = [
    { path: '/login', name: 'admin-login', component: () => import('@/views/login/index.vue') },
    {
        path: '/',
        component: AdminLayout,
        children: [
            { path: '', name: 'dashboard', component: () => import('@/views/dashboard/index.vue') },
            { path: 'users', name: 'users', component: () => import('@/views/users/index.vue') },
            { path: 'products', name: 'products', component: () => import('@/views/products/index.vue') },
            { path: 'categories', name: 'categories', component: () => import('@/views/categories/index.vue') },
            { path: 'card-secrets', name: 'card-secrets', component: () => import('@/views/card-secrets/index.vue') },
            { path: 'orders', name: 'orders', component: () => import('@/views/orders/index.vue') },
            { path: 'inventory', name: 'inventory', component: () => import('@/views/inventory/index.vue') },
            { path: 'announcements', name: 'announcements', component: () => import('@/views/announcements/index.vue') },
            { path: 'campaigns', name: 'campaigns', component: () => import('@/views/campaigns/index.vue') },
            { path: 'coupons', name: 'coupons', component: () => import('@/views/coupons/index.vue') },
            { path: 'balance-flows', name: 'balance-flows', component: () => import('@/views/balance-flows/index.vue') },
            { path: 'points-flows', name: 'points-flows', component: () => import('@/views/points-flows/index.vue') },
            { path: 'logs', name: 'logs', component: () => import('@/views/logs/index.vue') },
        ],
    },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return { top: 0, behavior: 'smooth' };
    },
});
router.beforeEach((to) => {
    const store = useAdminStore();
    if (to.path !== '/login' && !store.isLoggedIn)
        return '/login';
    if (to.path === '/login' && store.isLoggedIn)
        return '/';
});
export default router;
//# sourceMappingURL=index.js.map