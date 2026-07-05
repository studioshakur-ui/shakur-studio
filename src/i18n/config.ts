import { Language, translations, TranslationKey } from './translations';

export const languages: Language[] = ['fr', 'en'];

export function getStoredLanguage(): Language {
  const stored = window.localStorage.getItem('petaw-language');
  if (stored === 'fr' || stored === 'en') {
    return stored;
  }

  const browser = window.navigator.language.toLowerCase();
  if (browser.startsWith('fr')) return 'fr';
  return 'en';
}

export function translate(language: Language, key: TranslationKey): string {
  // Graceful fallback if translation doesn't exist
  if (!translations[language] || !translations[language][key]) {
    return translations['fr'][key] || (key as string);
  }
  return translations[language][key];
}
