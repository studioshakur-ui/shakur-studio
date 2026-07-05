import { useState, useEffect } from 'react';
import { Trash2, ArrowUpRight } from 'lucide-react';
import { ShakurOS, Conversation } from '../../lib/shakurOS';
import { RoutePath } from '../../lib/router';
import { translate } from '../../i18n/config';
import { Language } from '../../i18n/translations';

interface HistoryPageProps {
  language: Language;
  navigate: (to: RoutePath) => void;
  onLoadChat: (chat: Conversation) => void;
}

export function HistoryPage({ language, navigate, onLoadChat }: HistoryPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  useEffect(() => {
    setConversations(ShakurOS.getConversations());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    ShakurOS.deleteConversation(id);
    setConversations(ShakurOS.getConversations());
  };

  const handleClearAll = () => {
    if (window.confirm(language === 'fr' ? 'Voulez-vous vraiment effacer tout l’historique ?' : 'Are you sure you want to clear all history?')) {
      ShakurOS.saveConversations([]);
      setConversations([]);
    }
  };

  const handleSelect = (chat: Conversation) => {
    onLoadChat(chat);
    navigate('/');
  };

  return (
    <div className="page-wrapper-warm">
      <div className="page-header-warm">
        <div>
          <h1 className="page-title-warm">{t('nav.history')}</h1>
          <p className="page-subtitle-warm">
            {language === 'fr' 
              ? 'Vos discussions précédentes.' 
              : 'Your previous conversations.'}
          </p>
        </div>
        {conversations.length > 0 && (
          <button onClick={handleClearAll} className="btn-secondary-warm delete-all-btn">
            <span>{language === 'fr' ? 'Tout effacer' : 'Clear All'}</span>
          </button>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="empty-state-warm">
          <h3>{language === 'fr' ? 'Aucun historique' : 'Empty history'}</h3>
          <button onClick={() => navigate('/')} className="quick-action-text-btn">
            <span>{language === 'fr' ? 'Nouvelle discussion' : 'Start a chat'}</span>
          </button>
        </div>
      ) : (
        <div className="history-list-warm">
          {conversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelect(chat)}
              className="history-row-warm"
            >
              <div className="history-info-warm">
                <span className="history-item-title-warm">{chat.title || 'Discussion sans titre'}</span>
                <span className="history-item-model-warm">{chat.providerId} • {chat.modelId}</span>
              </div>
              <div className="history-actions-warm">
                <button
                  onClick={(e) => handleDelete(chat.id, e)}
                  className="history-row-btn-warm delete"
                  title="Supprimer la discussion"
                >
                  <Trash2 size={12} />
                </button>
                <span className="history-row-arrow-warm">
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
