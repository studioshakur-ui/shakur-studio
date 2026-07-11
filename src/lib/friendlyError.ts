import { Language } from '../i18n/translations';

const GENERIC_MESSAGE: Record<Language, string> = {
  fr: 'Connexion au serveur interrompue. Réessaie dans quelques instants.',
  en: 'Connection to the server was interrupted. Please try again in a moment.'
};

function isAdminMode(): boolean {
  return typeof window !== 'undefined' && window.localStorage.getItem('petaw-admin-mode') === 'true';
}

export function friendlyErrorMessage(error: unknown, language: Language): string {
  const generic = GENERIC_MESSAGE[language];
  if (!isAdminMode()) {
    return generic;
  }

  const raw = error instanceof Error ? error.message : undefined;
  return raw ? `${generic} (debug: ${raw})` : generic;
}
