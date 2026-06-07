import { createI18n } from 'vue-i18n'
import fr from './fr.js'
import en from './en.js'

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'fr',
  fallbackLocale: 'fr',
  messages: { fr, en },
})
