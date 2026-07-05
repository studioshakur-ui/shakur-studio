import React from 'react';
import { Session } from '@supabase/supabase-js';
import { isSupabaseAuthConfigured } from '../../lib/supabaseClient';
import { LoginScreen } from './LoginScreen';
import { useAuthSession } from './useAuthSession';

interface AuthGateProps {
  children: (session: Session | null) => React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { session, isLoading } = useAuthSession();

  if (!isSupabaseAuthConfigured) {
    return <>{children(null)}</>;
  }

  if (isLoading) {
    return <div className="auth-loading-screen">PETAW se prépare...</div>;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return <>{children(session)}</>;
}

