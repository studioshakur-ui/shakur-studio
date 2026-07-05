import { Language } from '../i18n/translations';

export interface SiteConfig {
  brandName: string;
  domain: string;
  contactEmail: string;
  defaultLanguage: Language;
  defaultTheme: 'dark' | 'light';
}

export const site: SiteConfig = {
  brandName: 'PETAW',
  domain: 'petaw.ai',
  contactEmail: 'support@petaw.ai',
  defaultLanguage: 'fr',
  defaultTheme: 'dark'
};
