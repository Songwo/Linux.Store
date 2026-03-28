import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@/api/http'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', () => {
  const items = ref<any[]>([])
  const loading = ref(false)

  const count = computed(() => items.value.length)

  async function refresh() {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      items.value = []
      return
    }
    loading.value = true
    try {
      const res = await http.get('/user/cart')
      items.value = res.data || []
    } catch {
      items.value = []
    } finally {
      loading.value = false
    }
  }

  return { items, loading, count, refresh }
})
