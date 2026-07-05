import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Moon, Sun, MessageCircle, Clock3, FileText, Database, PanelsTopLeft, Settings, LogOut, User } from 'lucide-react';
import { RoutePath } from '../lib/router';
import { Language } from '../i18n/translations';
import { translate } from '../i18n/config';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { userUnderstandingService, UserContext } from '../lib/userUnderstandingService';

interface LayoutProps {
  currentPath: RoutePath;
  navigate: (to: RoutePath) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  children: React.ReactNode;
  session: Session | null;
}

export function Layout({
  currentPath,
  navigate,
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  children,
  session
}: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  useEffect(() => {
    if (session?.user?.id) {
      userUnderstandingService.getUserContext(session.user.id).then((context) => {
        setUserContext(context);
      });
    } else {
      setUserContext(userUnderstandingService.getLocalFallback());
    }
  }, [session]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (session?.user?.id) {
        userUnderstandingService.getUserContext(session.user.id).then((context) => {
          setUserContext(context);
        });
      }
    };
    window.addEventListener('petaw_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('petaw_profile_updated', handleProfileUpdate);
  }, [session]);

  const completeness = userContext ? userUnderstandingService.calculateCompleteness(userContext, session?.user?.email || '') : 0;

  const getInitials = () => {
    if (userContext?.firstName && userContext?.lastName) {
      return (userContext.firstName[0] + userContext.lastName[0]).toUpperCase();
    }
    if (userContext?.firstName) return userContext.firstName.substring(0, 2).toUpperCase();
    if (session?.user?.email) return session.user.email.substring(0, 2).toUpperCase();
    return 'HM';
  };

  const getFullName = () => {
    if (userContext?.firstName && userContext?.lastName) {
      return `${userContext.firstName} ${userContext.lastName}`;
    }
    if (userContext?.firstName) return userContext.firstName;
    return session?.user?.email?.split('@')[0] || 'Hamidou Maiga';
  };

  const navItems = [
    { path: '/' as RoutePath, label: t('nav.chat'), icon: MessageCircle },
    { path: '/history' as RoutePath, label: t('nav.history'), icon: Clock3 },
    { path: '/documents' as RoutePath, label: t('nav.documents'), icon: FileText },
    { path: '/memory' as RoutePath, label: t('nav.memory'), icon: Database },
    { path: '/workspace' as RoutePath, label: t('nav.workspace'), icon: PanelsTopLeft },
    { path: '/settings' as RoutePath, label: t('nav.settings'), icon: Settings }
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
        </div>

        <nav className="petaw-sidebar__nav">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`petaw-sidebar__nav-item ${isActive ? 'active' : ''}`}
                role="link"
              >
                <Icon size={15} />
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
              <span>{language.toUpperCase()}</span>
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

          {session && (
            <div className="sidebar-profile-widget-container-warm">
              {isMenuOpen && (
                <div className="profile-dropdown-menu-warm">
                  <button onClick={() => { handleNavClick('/profile'); setIsMenuOpen(false); }} className="dropdown-item-btn-warm">
                    {language === 'fr' ? 'Profil' : 'Profile'}
                  </button>
                  <button onClick={() => { handleNavClick('/settings'); setIsMenuOpen(false); }} className="dropdown-item-btn-warm">
                    {language === 'fr' ? 'Préférences API' : 'API Preferences'}
                  </button>
                  <button
                    onClick={async () => {
                      if (supabase) {
                        await supabase.auth.signOut();
                      }
                      setIsMenuOpen(false);
                    }}
                    className="dropdown-item-btn-warm logout"
                  >
                    <LogOut size={12} />
                    <span>{language === 'fr' ? 'Déconnexion' : 'Sign Out'}</span>
                  </button>
                </div>
              )}

              <div 
                className="sidebar-profile-widget-warm" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                role="button"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
              >
                <div className="profile-widget-avatar-warm">
                  {getInitials()}
                </div>
                <div className="profile-widget-info-warm">
                  <span className="profile-widget-name-warm">{getFullName()}</span>
                  <span className="profile-widget-completeness-warm">
                    {language === 'fr' ? `Profil ${completeness}% complété` : `Profile ${completeness}% completed`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="petaw-mobile-header">
        <div className="petaw-mobile-header__brand" onClick={() => handleNavClick('/')}>
          <span className="brand-name">PETAW</span>
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
              <span>{language === 'fr' ? 'Français' : 'English'}</span>
            </button>
            <button
              onClick={onThemeToggle}
              className="footer-control-btn"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={() => handleNavClick('/profile')}
              className="footer-control-btn"
              style={{ gap: '8px' }}
            >
              <User size={15} />
              <span>{language === 'fr' ? 'Mon Profil' : 'My Profile'}</span>
            </button>
            {supabase && (
              <button
                onClick={async () => {
                  if (supabase) {
                    await supabase.auth.signOut();
                  }
                  setIsMobileMenuOpen(false);
                }}
                className="footer-control-btn"
                style={{ gap: '8px' }}
              >
                <LogOut size={15} />
                <span>{language === 'fr' ? 'Déconnexion' : 'Sign Out'}</span>
              </button>
            )}
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
