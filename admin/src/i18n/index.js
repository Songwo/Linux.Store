import { createI18n } from 'vue-i18n';
import zhCN from './zh-CN';
import en from './en';
const savedLocale = localStorage.getItem('devstore_admin_locale') || 'zh-CN';
const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: 'zh-CN',
    messages: {
        'zh-CN': zhCN,
        en,
    },
});
export function setLocale(locale) {
    ;
    i18n.global.locale.value = locale;
    localStorage.setItem('devstore_admin_locale', locale);
}
export function toggleLocale() {
    const current = i18n.global.locale.value;
    setLocale(current === 'zh-CN' ? 'en' : 'zh-CN');
}
export function currentLocale() {
    return i18n.global.locale.value;
}
export default i18n;
//# sourceMappingURL=index.js.map