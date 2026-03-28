import { defineStore } from 'pinia'
import http from '@/api/http'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: localStorage.getItem('devstore_admin_token') || '',
    user: null as null | { id: number; username: string; nickname: string; role: string },
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
  },
  actions: {
    setSession(token: string, user: { id: number; username: string; nickname: string; role: string }) {
      this.token = token
      this.user = user
      localStorage.setItem('devstore_admin_token', token)
    },
    clear() {
      this.token = ''
      this.user = null
      localStorage.removeItem('devstore_admin_token')
    },
    async login(form: { username: string; password: string }) {
      const res = await http.post('/admin/auth/login', form)
      this.setSession(res.data.token, res.data.user)
    },
  },
})
