import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import en from './en'

const savedLocale = localStorage.getItem('devstore_locale') || 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    en,
  },
})

export function setLocale(locale: 'zh-CN' | 'en') {
  ;(i18n.global.locale as any).value = locale
  localStorage.setItem('devstore_locale', locale)
  document.documentElement.setAttribute('lang', locale === 'zh-CN' ? 'zh' : 'en')
}

export function toggleLocale() {
  const current = (i18n.global.locale as any).value
  setLocale(current === 'zh-CN' ? 'en' : 'zh-CN')
}

export function currentLocale(): string {
  return (i18n.global.locale as any).value
}

export default i18n
