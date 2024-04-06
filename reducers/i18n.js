// i18n.js
import 'intl-pluralrules';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';
import kk from './locales/kk.json';

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      kk: { translation: kk }
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
