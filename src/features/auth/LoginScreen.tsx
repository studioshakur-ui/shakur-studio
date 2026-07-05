import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { userUnderstandingService } from '../../lib/userUnderstandingService';

type AuthMode = 'login' | 'register';

export function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
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
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              dob: dob
            }
          }
        });

    if (result.error) {
      setMessage(result.error.message);
    } else {
      if (result.data.user) {
        if (mode === 'register') {
          await userUnderstandingService.updateUserContext(result.data.user.id, {
            firstName: firstName,
            lastName: lastName,
            dob: dob
          });
          if (!result.data.session) {
            setMessage('Compte créé. Vérifie ton email pour confirmer l’accès.');
          }
        } else {
          await userUnderstandingService.getUserContext(result.data.user.id);
        }
      }
    }

    setIsSubmitting(false);
  };

  return (
    <main className="auth-screen">
      <div className="auth-shell">
        <div className="auth-brand">
          <span>PETAW</span>
        </div>

        <section className="auth-hero">
          <div className="auth-hero__content">
            <div className="auth-copy">
              <p className="auth-eyebrow">Pensée pour l’Afrique.</p>
              <h1>Ton second esprit, partout avec toi.</h1>
              <p>Apprends, écris, décide, avec plus de clarté chaque jour.</p>
            </div>
          </div>

          <div className="auth-panel">
            <div className="auth-card">
              <div className="auth-card__header">
                <h2>{mode === 'login' ? 'Heureux de te revoir.' : 'Créer ton espace.'}</h2>
                <p>Ton espace personnel t’attend.</p>
              </div>

              <form className="auth-form" onSubmit={submit}>
                {mode === 'register' && (
                  <>
                    <label>
                      Prénom
                      <input type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
                    </label>
                    <label>
                      Nom
                      <input type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
                    </label>
                    <label>
                      Date de naissance
                      <input type="date" value={dob} onChange={(event) => setDob(event.target.value)} required />
                    </label>
                  </>
                )}
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
                <p>Toujours la bonne réponse, au bon moment.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
