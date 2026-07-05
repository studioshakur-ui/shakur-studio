import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { ShakurOS, UserProfile } from '../../lib/shakurOS';
import { providers } from '../../lib/modelRouter';
import { translate } from '../../i18n/config';
import { Language } from '../../i18n/translations';

interface SettingsPageProps {
  language: Language;
}

export function SettingsPage({ language }: SettingsPageProps) {
  const [profile, setProfile] = useState<UserProfile>(() => ShakurOS.getProfile());
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => ShakurOS.getApiKeys());
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  const handleProfileChange = (field: keyof UserProfile, val: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleKeyChange = (providerId: string, val: string) => {
    setApiKeys(prev => ({
      ...prev,
      [providerId]: val
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    ShakurOS.saveProfile(profile);
    ShakurOS.saveApiKeys(apiKeys);
    
    setShowSavedMsg(true);
    setTimeout(() => {
      setShowSavedMsg(false);
    }, 2500);
  };

  const selectedProviderObj = providers.find(p => p.id === profile.defaultProviderId);
  const availableModels = selectedProviderObj ? selectedProviderObj.models : [];

  return (
    <div className="page-wrapper-warm">
      <div className="page-header-warm">
        <div>
          <h1 className="page-title-warm">{t('nav.settings')}</h1>
          <p className="page-subtitle-warm">
            {language === 'fr' 
              ? 'Profil et jetons de connexion.' 
              : 'Profile and connection configurations.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="settings-form-warm">
        <div className="settings-grid-warm">
          {/* Profile Card */}
          <div className="settings-card-warm">
            <h3 className="settings-card-title-warm">{language === 'fr' ? 'Profil' : 'Profile'}</h3>
            
            <div className="form-group-warm">
              <label htmlFor="user-name">{language === 'fr' ? 'Nom d’utilisateur' : 'Name'}</label>
              <input
                id="user-name"
                type="text"
                value={profile.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                placeholder="Ex. Hamid"
                className="form-input-warm"
                required
              />
            </div>

            <div className="form-group-warm">
              <label htmlFor="default-provider">{language === 'fr' ? 'Fournisseur préféré' : 'Preferred Provider'}</label>
              <select
                id="default-provider"
                value={profile.defaultProviderId}
                onChange={(e) => {
                  const pId = e.target.value;
                  const pObj = providers.find(p => p.id === pId);
                  const firstModelId = pObj && pObj.models.length > 0 ? pObj.models[0].id : '';
                  setProfile(prev => ({
                    ...prev,
                    defaultProviderId: pId,
                    defaultModelId: firstModelId
                  }));
                }}
                className="form-select-warm"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group-warm">
              <label htmlFor="default-model">{language === 'fr' ? 'Modèle préféré' : 'Preferred Model'}</label>
              <select
                id="default-model"
                value={profile.defaultModelId}
                onChange={(e) => handleProfileChange('defaultModelId', e.target.value)}
                className="form-select-warm"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* API Keys Card */}
          <div className="settings-card-warm">
            <h3 className="settings-card-title-warm">{language === 'fr' ? 'Clés API' : 'API Tokens'}</h3>

            {providers.map((p) => (
              <div key={p.id} className="form-group-warm row-group-warm">
                <label htmlFor={`key-${p.id}`}>{p.name}</label>
                <input
                  id={`key-${p.id}`}
                  type="text"
                  value={apiKeys[p.id] || ''}
                  onChange={(e) => handleKeyChange(p.id, e.target.value)}
                  placeholder={p.id === 'ollama' ? 'http://localhost:11434' : '••••••••••••'}
                  className="form-input-warm code-font"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="settings-footer-bar-warm">
          <div className="saved-feedback-message-warm">
            {showSavedMsg && (
              <span className="fade-in-text-warm">
                {language === 'fr' ? 'Modifications enregistrées' : 'Changes saved'}
              </span>
            )}
          </div>
          <button type="submit" className="btn-primary-warm">
            <Save size={14} />
            <span>{language === 'fr' ? 'Enregistrer' : 'Save'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
