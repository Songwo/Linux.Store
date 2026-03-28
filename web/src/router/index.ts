import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'home', component: () => import('@/views/home/index.vue') },
      { path: 'products', name: 'products', component: () => import('@/views/products/index.vue') },
      { path: 'products/:id', name: 'product-detail', component: () => import('@/views/products/detail.vue') },
      { path: 'seckill', name: 'seckill', component: () => import('@/views/seckill/index.vue') },
      { path: 'cart', name: 'cart', component: () => import('@/views/cart/index.vue') },
      { path: 'checkout', name: 'checkout', component: () => import('@/views/cart/Checkout.vue') },
      { path: 'orders', name: 'orders', component: () => import('@/views/orders/index.vue') },
      { path: 'cards', name: 'cards', component: () => import('@/views/cards/index.vue') },
      { path: 'profile', name: 'profile', component: () => import('@/views/profile/index.vue') },
      { path: 'balance', name: 'balance', component: () => import('@/views/balance/index.vue') },
      { path: 'wallet', redirect: '/balance' },
      { path: 'points', name: 'points', component: () => import('@/views/points/index.vue') },
      { path: 'coupons', name: 'coupons', component: () => import('@/views/coupons/index.vue') },
      { path: 'sign', name: 'sign', component: () => import('@/views/sign/index.vue') },
      { path: 'wishlist', name: 'wishlist', component: () => import('@/views/wishlist/index.vue') },
    ],
  },
  { path: '/login', name: 'login', component: () => import('@/views/login/index.vue') },
  { path: '/oauth/linux-do/callback', name: 'linuxdo-callback', component: () => import('@/views/oauth/linuxdo-callback.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
