import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ShakurOS, MemoryItem } from '../../lib/shakurOS';
import { translate } from '../../i18n/config';
import { Language } from '../../i18n/translations';

interface MemoryPageProps {
  language: Language;
}

export function MemoryPage({ language }: MemoryPageProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [input, setInput] = useState('');
  
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  useEffect(() => {
    setMemories(ShakurOS.getMemories());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    ShakurOS.addMemory(input.trim());
    setMemories(ShakurOS.getMemories());
    setInput('');
  };

  const handleDelete = (id: string) => {
    ShakurOS.deleteMemory(id);
    setMemories(ShakurOS.getMemories());
  };

  return (
    <div className="page-wrapper-warm">
      <div className="page-header-warm">
        <div>
          <h1 className="page-title-warm">{t('nav.memory')}</h1>
          <p className="page-subtitle-warm">
            {language === 'fr' 
              ? 'Faits et instructions que PETAW garde en mémoire.' 
              : 'Facts and instructions PETAW remembers.'}
          </p>
        </div>
      </div>

      <div className="memory-container-warm">
        {/* Add Memory Fact */}
        <form onSubmit={handleAdd} className="memory-form-warm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'fr' ? 'Ajouter une consigne ou une préférence...' : 'Add a preference or instruction...'}
            rows={2}
            className="memory-textarea-warm"
          />
          <button type="submit" className="btn-primary-warm" disabled={!input.trim()}>
            <Plus size={14} />
            <span>{language === 'fr' ? 'Enregistrer' : 'Save'}</span>
          </button>
        </form>

        {/* Stored facts */}
        <div className="memories-section-warm">
          <h3 className="section-title-silent">
            {language === 'fr' ? 'Informations mémorisées' : 'Memory Details'}
          </h3>

          {memories.length === 0 ? (
            <p className="empty-memories-text-warm">
              {language === 'fr' ? 'Aucune préférence enregistrée.' : 'No saved details.'}
            </p>
          ) : (
            <div className="memories-list-warm">
              {memories.map((m) => (
                <div key={m.id} className="memory-row-warm">
                  <div className="memory-content-warm">
                    <p>{m.content}</p>
                    <span className="memory-date-warm">
                      {new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="delete-memory-btn-warm"
                    title="Supprimer cette information"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
