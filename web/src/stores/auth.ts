import { defineStore } from 'pinia'
import http from '@/api/http'

export interface UserProfile {
  user_id: number
  email: string
  nickname: string
  avatar?: string
  balance: number
  points: number
  sign_today: boolean
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('devstore_user_token') || '',
    profile: null as UserProfile | null,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
  },
  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('devstore_user_token', token)
    },
    logout() {
      this.token = ''
      this.profile = null
      localStorage.removeItem('devstore_user_token')
    },
    async fetchProfile() {
      if (!this.token) {
        this.profile = null
        return null
      }
      const res = await http.get<UserProfile>('/user/profile')
      this.profile = res.data
      return this.profile
    },
  },
})
