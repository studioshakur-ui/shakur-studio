import { useEffect, useState } from 'react';
import { getStoredLanguage } from './i18n/config';
import { Language } from './i18n/translations';
import { Layout } from './components/Layout';
import { ChatPage } from './components/pages/ChatPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { DocumentsPage } from './components/pages/DocumentsPage';
import { MemoryPage } from './components/pages/MemoryPage';
import { WorkspacePage } from './components/pages/WorkspacePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { AuthGate } from './features/auth/AuthGate';
import { useHashRoute } from './lib/router';
import { Conversation } from './lib/shakurOS';
import { Session } from '@supabase/supabase-js';

type Theme = 'dark' | 'light';

function getStoredTheme(): Theme {
  const stored = window.localStorage.getItem('petaw-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const [activeChatToLoad, setActiveChatToLoad] = useState<Conversation | null>(null);

  const { currentPath, navigate } = useHashRoute();

  useEffect(() => {
    window.localStorage.setItem('petaw-language', language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem('petaw-theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Render current view depending on route path
  const renderContent = (session: Session | null) => {
    switch (currentPath) {
      case '/':
        return (
          <ChatPage
            language={language}
            navigate={navigate}
            activeChat={activeChatToLoad}
            onResetActiveChat={() => setActiveChatToLoad(null)}
            session={session}
          />
        );
      case '/history':
        return (
          <HistoryPage
            language={language}
            navigate={navigate}
            onLoadChat={(chat) => setActiveChatToLoad(chat)}
          />
        );
      case '/documents':
        return <DocumentsPage language={language} />;
      case '/memory':
        return <MemoryPage language={language} />;
      case '/workspace':
        return <WorkspacePage language={language} />;
      case '/settings':
        return <SettingsPage language={language} session={session} />;
      case '/profile':
        return <ProfilePage language={language} session={session} />;
      default:
        return (
          <ChatPage
            language={language}
            navigate={navigate}
            activeChat={activeChatToLoad}
            onResetActiveChat={() => setActiveChatToLoad(null)}
            session={session}
          />
        );
    }
  };

  return (
    <AuthGate>
      {(session) => (
        <Layout
          currentPath={currentPath}
          navigate={navigate}
          language={language}
          onLanguageChange={setLanguage}
          theme={theme}
          onThemeToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
          session={session}
        >
          {renderContent(session)}
        </Layout>
      )}
    </AuthGate>
  );
}
