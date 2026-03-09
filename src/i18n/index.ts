import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh_CN from './locales/zh_CN.json';
import en from './locales/en.json';

// Get saved language or default to zh_CN
const savedLang = localStorage.getItem('preferred_language') || 'zh_CN';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh_CN: { translation: zh_CN },
      en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: 'zh_CN',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    returnObjects: true, // Allow t() to return arrays/objects
  });

export default i18n;
