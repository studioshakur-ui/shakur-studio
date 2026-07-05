import React, { useState } from 'react';
import { Menu, X, Globe, Moon, Sun } from 'lucide-react';
import { RoutePath } from '../lib/router';
import { Language } from '../i18n/translations';
import { translate } from '../i18n/config';

interface LayoutProps {
  currentPath: RoutePath;
  navigate: (to: RoutePath) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  children: React.ReactNode;
}

export function Layout({
  currentPath,
  navigate,
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  children
}: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  const navItems = [
    { path: '/' as RoutePath, label: t('nav.chat') },
    { path: '/history' as RoutePath, label: t('nav.history') },
    { path: '/documents' as RoutePath, label: t('nav.documents') },
    { path: '/memory' as RoutePath, label: t('nav.memory') },
    { path: '/workspace' as RoutePath, label: t('nav.workspace') },
    { path: '/settings' as RoutePath, label: t('nav.settings') }
  ];

  const handleNavClick = (path: RoutePath) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="petaw-layout">
      {/* Desktop Sidebar */}
      <aside className="petaw-sidebar">
        <div className="petaw-sidebar__brand" onClick={() => handleNavClick('/')}>
          <span className="brand-name">PETAW</span>
          <span className="brand-cursor">_</span>
        </div>

        <nav className="petaw-sidebar__nav">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`petaw-sidebar__nav-item ${isActive ? 'active' : ''}`}
                role="link"
              >
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="petaw-sidebar__footer">
          <div className="control-group">
            <button
              onClick={() => onLanguageChange(language === 'fr' ? 'en' : 'fr')}
              className="footer-control-btn"
              title={t('settings.changeLanguage')}
              aria-label="Change language"
            >
              <Globe size={13} />
              <span>{language === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            <button
              onClick={onThemeToggle}
              className="footer-control-btn"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="petaw-mobile-header">
        <div className="petaw-mobile-header__brand" onClick={() => handleNavClick('/')}>
          <span className="brand-name">PETAW</span>
          <span className="brand-cursor">_</span>
        </div>
        <button
          className="petaw-mobile-header__toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay / Drawer */}
      {isMobileMenuOpen && (
        <div className="petaw-mobile-drawer">
          <nav className="petaw-mobile-drawer__nav">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`petaw-mobile-drawer__nav-item ${isActive ? 'active' : ''}`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="petaw-mobile-drawer__footer">
            <button
              onClick={() => onLanguageChange(language === 'fr' ? 'en' : 'fr')}
              className="footer-control-btn"
            >
              <Globe size={15} />
              <span>{language === 'fr' ? 'English' : 'Français'}</span>
            </button>
            <button
              onClick={onThemeToggle}
              className="footer-control-btn"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="petaw-main">
        <div className="petaw-container">
          {children}
        </div>
      </main>
    </div>
  );
}
