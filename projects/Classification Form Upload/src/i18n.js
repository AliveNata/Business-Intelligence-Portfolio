import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import id from './locales/id.json';

// Konfigurasi i18n
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id }
  },
  lng: 'id', // Bahasa default
  fallbackLng: 'en', // Jika bahasa tidak ditemukan, gunakan bahasa default
  interpolation: {
    escapeValue: false // React sudah aman terhadap XSS
  }
});

export default i18n;
