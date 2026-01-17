/**
 * Language Hook
 * Provides language switching functionality
 */

import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: 'en' | 'mt') => {
    i18n.changeLanguage(lng);
    localStorage.setItem('dinein_language', lng);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lng;
  };

  const currentLanguage = (i18n.language || 'en') as 'en' | 'mt';

  return {
    t,
    currentLanguage,
    changeLanguage,
    isEnglish: currentLanguage === 'en',
    isMaltese: currentLanguage === 'mt',
  };
};
