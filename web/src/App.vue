<template>
  <router-view v-slot="{ Component, route }">
    <transition name="route-fade" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>
</template>

<style>
.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
