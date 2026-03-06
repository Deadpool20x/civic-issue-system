'use client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import locales directly for simplicity in this setup
// In larger apps, we might use a backend plugin
import en from '../public/locales/en/common.json';
import hi from '../public/locales/hi/common.json';
import gu from '../public/locales/gu/common.json';

const isBrowser = typeof window !== 'undefined';

const i18nInstance = i18n;

if (isBrowser) {
    i18nInstance.use(LanguageDetector);
}

i18nInstance
    .use(initReactI18next)
    .init({
        resources: {
            en: { common: en },
            hi: { common: hi },
            gu: { common: gu },
        },
        defaultNS: 'common',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

export default i18n;
