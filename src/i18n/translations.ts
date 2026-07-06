export type Language = 'fr' | 'en';

export type TranslationKey =
  | 'nav.chat'
  | 'nav.history'
  | 'nav.documents'
  | 'nav.memory'
  | 'nav.workspace'
  | 'nav.settings'
  | 'nav.admin'
  | 'settings.changeLanguage'
  | 'chat.prompt'
  | 'chat.inputPlaceholder'
  | 'chat.searchToggle'
  | 'chat.action.ask.title'
  | 'chat.action.upload.title'
  | 'chat.action.search.title'
  | 'chat.action.continue.title'
  | 'a11y.brand'
  | 'a11y.nav'
  | 'a11y.language';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  fr: {
    'nav.chat': 'Assistant',
    'nav.history': 'Historique',
    'nav.documents': 'Documents',
    'nav.memory': 'Mémoire',
    'nav.workspace': 'Espace de travail',
    'nav.settings': 'Paramètres',
    'nav.admin': 'Fournisseurs IA',
    'settings.changeLanguage': 'Langue',
    'chat.prompt': 'Que veux-tu faire aujourd’hui ?',
    'chat.inputPlaceholder': 'Rédiger, coder, poser une question...',
    'chat.searchToggle': 'Recherche en direct',
    'chat.action.ask.title': 'Poser une question',
    'chat.action.upload.title': 'Importer un document',
    'chat.action.search.title': 'Faire une recherche',
    'chat.action.continue.title': 'Continuer un projet',
    'a11y.brand': 'PËTAW',
    'a11y.nav': 'Navigation',
    'a11y.language': 'Langue'
  },
  en: {
    'nav.chat': 'Assistant',
    'nav.history': 'History',
    'nav.documents': 'Documents',
    'nav.memory': 'Memory',
    'nav.workspace': 'Workspace',
    'nav.settings': 'Settings',
    'nav.admin': 'AI Providers',
    'settings.changeLanguage': 'Language',
    'chat.prompt': 'What would you like to do today?',
    'chat.inputPlaceholder': 'Ask a question, write code, search...',
    'chat.searchToggle': 'Live Search',
    'chat.action.ask.title': 'Ask a question',
    'chat.action.upload.title': 'Upload document',
    'chat.action.search.title': 'Search web',
    'chat.action.continue.title': 'Continue project',
    'a11y.brand': 'PËTAW',
    'a11y.nav': 'Navigation',
    'a11y.language': 'Language'
  }
};
