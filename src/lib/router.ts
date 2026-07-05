import { useState, useEffect } from 'react';

export type RoutePath = '/' | '/history' | '/documents' | '/memory' | '/workspace' | '/settings';

export function useHashRoute() {
  const [hash, setHash] = useState<string>(() => window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to: RoutePath) => {
    window.location.hash = '#' + to;
  };

  let currentPath: RoutePath = '/';
  const cleanHash = hash.replace(/^#/, '');

  if (
    cleanHash === '/' ||
    cleanHash === '/history' ||
    cleanHash === '/documents' ||
    cleanHash === '/memory' ||
    cleanHash === '/workspace' ||
    cleanHash === '/settings'
  ) {
    currentPath = cleanHash as RoutePath;
  }

  return { currentPath, navigate };
}
