/**
 * i18n Configuration
 * Sets up internationalization for English and Maltese
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import mtTranslations from './locales/mt.json';

i18n
  .use(LanguageDetector) // Detects user language from browser
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      mt: {
        translation: mtTranslations,
      },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'mt'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'dinein_language',
    },
    react: {
      useSuspense: false, // Avoid suspense for better UX
    },
  });

// Update HTML lang attribute when language changes
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

// Set initial lang attribute
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || 'en';
}

export default i18n;
