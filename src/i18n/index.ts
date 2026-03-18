import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import ar from './locales/ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: localStorage.getItem('r8_lang') || undefined, // explicit override if set
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'r8_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Apply direction on init
const lang = i18n.language?.startsWith('ar') ? 'ar' : i18n.language || 'en';
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = lang;
if (lang === 'ar') document.body.classList.add('rtl');
else document.body.classList.remove('rtl');

// Keep in sync on language change
i18n.on('languageChanged', (lng) => {
  const isAr = lng === 'ar';
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  if (isAr) document.body.classList.add('rtl');
  else document.body.classList.remove('rtl');
  localStorage.setItem('r8_lang', lng);
});

export default i18n;
