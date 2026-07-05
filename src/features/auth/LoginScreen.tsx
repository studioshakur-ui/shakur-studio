import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { BrandMark } from '../../components/BrandMark';

type AuthMode = 'login' | 'register';

export function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || isSubmitting) return;

    setIsSubmitting(true);
    setMessage('');

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === 'register' && !result.data.session) {
      setMessage('Compte créé. Vérifie ton email pour confirmer l’accès.');
    }

    setIsSubmitting(false);
  };

  return (
    <main className="auth-screen">
      <div className="auth-shell">
        <div className="auth-brand">
          <BrandMark size={24} />
          <span>PETAW</span>
        </div>

        <section className="auth-hero">
          <div className="auth-content-group">
            <div className="auth-hero__content">
              <div className="auth-copy">
                <p className="auth-eyebrow">IA personnelle pour l’Afrique</p>
                <h1>Ton IA personnelle, partout avec toi.</h1>
                <p>
                  Discute, apprends, travaille et avance avec une IA pensée pour ton quotidien,
                  tes projets et tes ambitions.
                </p>
              </div>

              <div className="auth-value-grid">
                <span>Assistant personnel</span>
                <span>Professeur</span>
                <span>Copilote de travail</span>
                <span>Recherche & analyse</span>
              </div>
            </div>

            <div className="auth-panel">
              <div className="auth-card">
                <div className="auth-card__header">
                  <h2>{mode === 'login' ? 'Heureux de te revoir.' : 'Créer ton espace.'}</h2>
                  <p>Connexion sécurisée par Supabase. ShakurOS gère les quotas, les plans et l’usage.</p>
                </div>

                <form className="auth-form" onSubmit={submit}>
                  <label>
                    Email
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                  </label>
                  <label>
                    Mot de passe
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
                  </label>
                  {message && <p className="auth-message">{message}</p>}
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Connexion...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
                  </button>
                </form>

                <button className="auth-switch" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                  {mode === 'login' ? 'Créer un compte PETAW' : 'J’ai déjà un compte'}
                </button>
              </div>

              <div className="auth-shakuros">
                <span className="auth-shakuros__dot" />
                <div className="auth-shakuros__copy">
                  <strong>Mode Auto</strong>
                  <p>ShakurOS choisit le meilleur modèle selon la tâche, le coût et la vitesse.</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="auth-visual" aria-hidden="true">
            <div className="auth-visual__glow" />
            <div className="auth-visual__grid" />
          </aside>
        </section>
      </div>
    </main>
  );
}
