import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonES from './locales/es/common.json';
import authES from './locales/es/auth.json';
import tasksES from './locales/es/tasks.json';
import categoriesES from './locales/es/categories.json';
import tagsES from './locales/es/tags.json';

import commonEN from './locales/en/common.json';
import authEN from './locales/en/auth.json';
import tasksEN from './locales/en/tasks.json';
import categoriesEN from './locales/en/categories.json';
import tagsEN from './locales/en/tags.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      es: {
        common: commonES,
        auth: authES,
        tasks: tasksES,
        categories: categoriesES,
        tags: tagsES,
      },
      en: {
        common: commonEN,
        auth: authEN,
        tasks: tasksEN,
        categories: categoriesEN,
        tags: tagsEN,
      },
    },
    ns: ['common', 'auth', 'tasks', 'categories', 'tags'],
    defaultNS: 'common',
  });

export default i18n;
