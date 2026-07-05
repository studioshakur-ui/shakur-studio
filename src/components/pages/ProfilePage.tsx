import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { userUnderstandingService, UserContext } from '../../lib/userUnderstandingService';
import { Language } from '../../i18n/translations';

interface ProfilePageProps {
  language: Language;
  session: Session | null;
}

export function ProfilePage({ language, session }: ProfilePageProps) {
  const [context, setContext] = useState<UserContext>(() => userUnderstandingService.getLocalFallback());
  const [email, setEmail] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email || '');
      userUnderstandingService.getUserContext(session.user.id).then((data) => {
        setContext(data);
      });
    }
  }, [session]);

  const completeness = userUnderstandingService.calculateCompleteness(context, email);

  const handleTextChange = (field: keyof UserContext, val: string) => {
    setContext(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleInterestsChange = (val: string) => {
    const list = val.split(',').map(s => s.trim()).filter(Boolean);
    setContext(prev => ({
      ...prev,
      interests: list
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    setErrorMessage('');
    setIsSaved(false);

    try {
      await userUnderstandingService.updateUserContext(session.user.id, context);
      setIsSaved(true);
      window.dispatchEvent(new Event('petaw_profile_updated'));
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de l’enregistrement');
    }
  };

  // Build checklist items to render
  const checklist = [
    { label: language === 'fr' ? 'Prénom' : 'First Name', completed: Boolean(context.firstName) },
    { label: language === 'fr' ? 'Nom' : 'Last Name', completed: Boolean(context.lastName) },
    { label: 'Email', completed: Boolean(email) },
    { label: language === 'fr' ? 'Date de naissance' : 'Date of Birth', completed: Boolean(context.dob) },
    { label: language === 'fr' ? 'Langue préférée' : 'Preferred Language', completed: Boolean(context.preferredLanguage) },
    { label: language === 'fr' ? 'Pays' : 'Country', completed: Boolean(context.country) },
    { label: language === 'fr' ? 'Fuseau horaire' : 'Timezone', completed: Boolean(context.timezone) },
    { label: language === 'fr' ? 'Ce que vous voulez accomplir' : 'Primary Goals', completed: Boolean(context.goals) },
    { label: language === 'fr' ? 'Domaines d’intérêt' : 'Interests', completed: context.interests.length > 0 },
    { label: language === 'fr' ? 'Profession' : 'Profession', completed: Boolean(context.profession) },
    { label: language === 'fr' ? 'Niveau technique' : 'Technical Level', completed: Boolean(context.technicalLevel) },
    { label: language === 'fr' ? 'Langue de réponse' : 'Response Language', completed: Boolean(context.preferredResponseLanguage) }
  ];

  return (
    <div className="page-wrapper-warm">
      <div className="page-header-warm">
        <div>
          <h1 className="page-title-warm">
            {language === 'fr' ? 'Profil & Personnalisation' : 'Profile & Personalization'}
          </h1>
          <p className="page-subtitle-warm">
            {language === 'fr'
              ? 'Ces informations alimentent votre second esprit pour des réponses personnalisées.'
              : 'This information feeds your second mind for tailored AI responses.'}
          </p>
        </div>
      </div>

      <div className="profile-layout-grid-warm">
        {/* Left column: forms */}
        <form onSubmit={handleSave} className="settings-form-warm">
          <div className="settings-grid-warm">
            {/* Basic section */}
            <div className="settings-card-warm">
              <h3 className="settings-card-title-warm">
                {language === 'fr' ? 'Informations de base' : 'Basic Information'}
              </h3>

              <div className="form-group-warm">
                <label htmlFor="p-first">{language === 'fr' ? 'Prénom' : 'First Name'}</label>
                <input
                  id="p-first"
                  type="text"
                  value={context.firstName}
                  onChange={(e) => handleTextChange('firstName', e.target.value)}
                  className="form-input-warm"
                />
              </div>

              <div className="form-group-warm">
                <label htmlFor="p-last">{language === 'fr' ? 'Nom' : 'Last Name'}</label>
                <input
                  id="p-last"
                  type="text"
                  value={context.lastName}
                  onChange={(e) => handleTextChange('lastName', e.target.value)}
                  className="form-input-warm"
                />
              </div>

              <div className="form-group-warm">
                <label htmlFor="p-dob">{language === 'fr' ? 'Date de naissance' : 'Date of Birth'}</label>
                <input
                  id="p-dob"
                  type="date"
                  value={context.dob}
                  onChange={(e) => handleTextChange('dob', e.target.value)}
                  className="form-input-warm"
                />
              </div>

              <div className="form-group-warm">
                <label htmlFor="p-lang">{language === 'fr' ? 'Langue préférée' : 'Preferred Language'}</label>
                <select
                  id="p-lang"
                  value={context.preferredLanguage}
                  onChange={(e) => handleTextChange('preferredLanguage', e.target.value)}
                  className="form-select-warm"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="form-group-warm">
                <label htmlFor="p-country">{language === 'fr' ? 'Pays' : 'Country'}</label>
                <input
                  id="p-country"
                  type="text"
                  placeholder="Ex. Sénégal, France..."
                  value={context.country}
                  onChange={(e) => handleTextChange('country', e.target.value)}
                  className="form-input-warm"
                />
              </div>

              <div className="form-group-warm">
                <label htmlFor="p-tz">{language === 'fr' ? 'Fuseau horaire' : 'Timezone'}</label>
                <input
                  id="p-tz"
                  type="text"
                  placeholder="Ex. GMT+0, GMT+2..."
                  value={context.timezone}
                  onChange={(e) => handleTextChange('timezone', e.target.value)}
                  className="form-input-warm"
                />
              </div>
            </div>

            {/* AI helper context section */}
            <div className="settings-card-warm">
              <h3 className="settings-card-title-warm">
                {language === 'fr' ? 'Informations utiles à PETAW' : 'AI Context Parameters'}
              </h3>

              <div className="form-group-warm">
                <label htmlFor="p-goals">{language === 'fr' ? 'Ce que vous voulez accomplir' : 'What you want to accomplish'}</label>
                <textarea
                  id="p-goals"
                  rows={2}
                  placeholder="Ex. Écrire des scripts de code, m'organiser au quotidien..."
                  value={context.goals}
                  onChange={(e) => handleTextChange('goals', e.target.value)}
                  className="form-input-warm"
                  style={{ resize: 'vertical', minHeight: '60px' }}
                />
              </div>

              <div className="form-group-warm">
                <label htmlFor="p-interests">{language === 'fr' ? "Domaines d'intérêt (séparés par des virgules)" : 'Interests (comma separated)'}</label>
                <input
                  id="p-interests"
                  type="text"
                  placeholder="Ex. Programmation, Finance, Histoire"
                  value={context.interests.join(', ')}
                  onChange={(e) => handleInterestsChange(e.target.value)}
                  className="form-input-warm"
                />
              </div>

              <div className="form-group-warm">
                <label htmlFor="p-profession">{language === 'fr' ? 'Profession' : 'Profession'}</label>
                <input
                  id="p-profession"
                  type="text"
                  placeholder="Ex. Designer, Développeur..."
                  value={context.profession}
                  onChange={(e) => handleTextChange('profession', e.target.value)}
                  className="form-input-warm"
                />
              </div>

              <div className="form-group-warm">
                <label htmlFor="p-tech">{language === 'fr' ? 'Niveau technique' : 'Technical Level'}</label>
                <select
                  id="p-tech"
                  value={context.technicalLevel}
                  onChange={(e) => handleTextChange('technicalLevel', e.target.value)}
                  className="form-select-warm"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="beginner">{language === 'fr' ? 'Débutant' : 'Beginner'}</option>
                  <option value="intermediate">{language === 'fr' ? 'Intermédiaire' : 'Intermediate'}</option>
                  <option value="advanced">{language === 'fr' ? 'Avancé' : 'Advanced'}</option>
                </select>
              </div>

              <div className="form-group-warm">
                <label htmlFor="p-resplang">{language === 'fr' ? 'Langue de réponse préférée' : 'Preferred Response Language'}</label>
                <select
                  id="p-resplang"
                  value={context.preferredResponseLanguage}
                  onChange={(e) => handleTextChange('preferredResponseLanguage', e.target.value)}
                  className="form-select-warm"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="wolof">Wolof</option>
                  <option value="swahili">Swahili</option>
                </select>
              </div>
            </div>
          </div>

          <div className="settings-footer-bar-warm">
            <div className="saved-feedback-message-warm">
              {isSaved && (
                <span className="fade-in-text-warm">
                  {language === 'fr' ? 'Profil mis à jour avec succès' : 'Profile updated successfully'}
                </span>
              )}
              {errorMessage && (
                <span className="error-text-warm">{errorMessage}</span>
              )}
            </div>
            <button type="submit" className="btn-primary-warm">
              <Save size={14} />
              <span>{language === 'fr' ? 'Enregistrer' : 'Save'}</span>
            </button>
          </div>
        </form>

        {/* Right column: completeness checklist summary */}
        <div className="profile-completeness-card-warm">
          <div className="completeness-header-warm">
            <h3>{language === 'fr' ? 'Complétude du profil' : 'Profile Completeness'}</h3>
            <div className="completeness-percentage-warm">{completeness}%</div>
          </div>
          
          <div className="completeness-progressbar-outer-warm">
            <div 
              className="completeness-progressbar-inner-warm" 
              style={{ width: `${completeness}%` }}
            />
          </div>

          <p className="completeness-status-note-warm">
            {completeness === 100
              ? (language === 'fr' ? '✓ Profil complet.' : '✓ Profile complete.')
              : (language === 'fr'
                  ? `Complétez votre profil pour personnaliser au mieux l'assistant.`
                  : `Complete all fields for better AI responses.`)}
          </p>

          <div className="completeness-checklist-warm">
            {checklist.map((item, idx) => (
              <div key={idx} className={`checklist-item-warm ${item.completed ? 'is-complete' : 'is-pending'}`}>
                {item.completed ? (
                  <CheckCircle size={14} className="check-icon-warm" />
                ) : (
                  <AlertCircle size={14} className="alert-icon-warm" />
                )}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
