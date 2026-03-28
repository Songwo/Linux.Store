import { defineStore } from 'pinia'
import { mallApi, type AnnouncementItem, type CategoryItem, type SignStatus, type WalletSummary } from '@/api/mall'
import { useAuthStore } from '@/stores/auth'

type ThemeMode = 'light' | 'dark'

const storedTheme = (localStorage.getItem('devstore_theme') as ThemeMode | null) || 'light'
let publicDataPromise: Promise<void> | null = null
let userAssetsPromise: Promise<void> | null = null

export const useAppStore = defineStore('app', {
  state: () => ({
    announcements: [] as AnnouncementItem[],
    categories: [] as CategoryItem[],
    wallet: null as WalletSummary | null,
    signStatus: null as SignStatus | null,
    theme: storedTheme,
    publicDataLoadedAt: 0,
    userAssetsLoadedAt: 0,
  }),
  actions: {
    applyTheme(theme?: ThemeMode) {
      const nextTheme = theme || this.theme
      this.theme = nextTheme
      localStorage.setItem('devstore_theme', nextTheme)
      document.documentElement.dataset.theme = nextTheme
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    toggleTheme() {
      this.applyTheme(this.theme === 'light' ? 'dark' : 'light')
    },
    async loadPublicData(force = false) {
      const isFresh = this.publicDataLoadedAt > 0 && Date.now() - this.publicDataLoadedAt < 60_000
      if (!force && this.announcements.length && this.categories.length && isFresh) {
        return
      }
      if (publicDataPromise) {
        return publicDataPromise
      }
      publicDataPromise = (async () => {
        const [announcements, categories] = await Promise.all([
          mallApi.getAnnouncements(),
          mallApi.getCategories(),
        ])
        this.announcements = announcements
        this.categories = categories
        this.publicDataLoadedAt = Date.now()
      })()
      try {
        await publicDataPromise
      } finally {
        publicDataPromise = null
      }
    },
    async refreshUserAssets(force = false) {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) {
        this.wallet = null
        this.signStatus = null
        this.userAssetsLoadedAt = 0
        return
      }
      const isFresh = this.userAssetsLoadedAt > 0 && Date.now() - this.userAssetsLoadedAt < 20_000
      if (!force && this.wallet && this.signStatus && isFresh) {
        return
      }
      if (userAssetsPromise) {
        return userAssetsPromise
      }
      userAssetsPromise = (async () => {
        const [wallet, signStatus] = await Promise.all([
          mallApi.getWalletSummary(),
          mallApi.getSignStatus(),
        ])
        this.wallet = wallet
        this.signStatus = signStatus
        this.userAssetsLoadedAt = Date.now()
      })()
      try {
        await userAssetsPromise
      } finally {
        userAssetsPromise = null
      }
    },
    async initialize() {
      this.applyTheme(this.theme)
      await this.loadPublicData()
      await this.refreshUserAssets()
    },
  },
})
