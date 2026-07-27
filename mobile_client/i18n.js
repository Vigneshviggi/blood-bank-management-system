import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
};

const LANGUAGE_KEY = '@LifeLink:language';

const initI18n = async () => {
  let savedLanguage = 'en';
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (lang) savedLanguage = lang;
  } catch (error) {
    console.error('Error reading language from AsyncStorage', error);
  }

  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3',
      resources,
      lng: savedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;
