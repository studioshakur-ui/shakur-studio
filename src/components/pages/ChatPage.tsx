import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Trash2, StopCircle, RefreshCw, PenLine, FileText, Scale, GraduationCap } from 'lucide-react';
import { ModelSelector } from '../chat/ModelSelector';
import { MessageList } from '../chat/MessageList';
import { ShakurOS, Conversation } from '../../lib/shakurOS';
import { Message } from '../../lib/providers/providerTypes';
import { RoutePath } from '../../lib/router';
import { translate } from '../../i18n/config';
import { Language } from '../../i18n/translations';
import { Session } from '@supabase/supabase-js';
import { userUnderstandingService, UserContext } from '../../lib/userUnderstandingService';

interface ChatPageProps {
  language: Language;
  navigate: (to: RoutePath) => void;
  activeChat: Conversation | null;
  onResetActiveChat: () => void;
  session: Session | null;
}

export function ChatPage({ language, navigate, activeChat, onResetActiveChat, session }: ChatPageProps) {
  const [profile, setProfile] = useState(() => ShakurOS.getProfile());
  const [providerId, setProviderId] = useState(profile.defaultProviderId);
  const [modelId, setModelId] = useState(profile.defaultModelId);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  
  const [input, setInput] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  // Load user context profile on session changes
  useEffect(() => {
    if (session?.user?.id) {
      userUnderstandingService.getUserContext(session.user.id).then((context) => {
        setUserContext(context);
        if (context.firstName) {
          setProfile(prev => ({
            ...prev,
            name: context.firstName
          }));
        }
      });
    } else {
      setUserContext(userUnderstandingService.getLocalFallback());
    }
  }, [session]);

  // Sync profile edits (like name change)
  useEffect(() => {
    setProfile(ShakurOS.getProfile());
  }, []);

  // Sync activeChat loaded from History page
  useEffect(() => {
    if (activeChat) {
      setCurrentChat(activeChat);
      setProviderId(activeChat.providerId);
      setModelId(activeChat.modelId);
      onResetActiveChat();
    }
  }, [activeChat, onResetActiveChat]);

  // Auto-focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Textarea auto-height adjustment
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 260)}px`;
    }
  }, [input]);

  const handleModelChange = (pId: string, mId: string) => {
    setProviderId(pId);
    setModelId(mId);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const isEvening = hour >= 18;
    
    let greet = 'Bonjour';
    if (language === 'en') {
      greet = 'Hello';
    } else if (isEvening) {
      greet = 'Bonsoir';
    }

    const nameToUse = userContext?.firstName || (profile.name !== 'Utilisateur' ? profile.name : '');
    
    if (nameToUse && nameToUse.trim()) {
      return `${greet}, ${nameToUse.trim()}.`;
    }
    
    return `${greet}.`;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessageText = input.trim();
    setInput('');
    setIsStreaming(true);

    const userMsg: Message = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: userMessageText,
      timestamp: new Date().toISOString()
    };

    let chat: Conversation;
    if (currentChat) {
      chat = {
        ...currentChat,
        messages: [...currentChat.messages, userMsg],
        modelId,
        providerId
      };
    } else {
      chat = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        title: userMessageText.substring(0, 45) + (userMessageText.length > 45 ? '...' : ''),
        messages: [userMsg],
        modelId,
        providerId,
        createdAt: new Date().toISOString()
      };
    }

    setCurrentChat(chat);
    ShakurOS.saveConversation(chat);

    const assistantMsgId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };

    const updatedChatWithPlaceholder = {
      ...chat,
      messages: [...chat.messages, assistantMsg]
    };
    setCurrentChat(updatedChatWithPlaceholder);

    try {
      await ShakurOS.chat(
        providerId,
        modelId,
        chat.messages,
        webSearchEnabled,
        (progressText) => {
          setCurrentChat((prevChat) => {
            if (!prevChat) return null;
            const msgs = [...prevChat.messages];
            const lastMsgIdx = msgs.findIndex(m => m.id === assistantMsgId);
            if (lastMsgIdx >= 0) {
              msgs[lastMsgIdx] = {
                ...msgs[lastMsgIdx],
                content: progressText
              };
            }
            const finalChat = { ...prevChat, messages: msgs };
            ShakurOS.saveConversation(finalChat);
            return finalChat;
          });
        }
      );
    } catch (err) {
      console.error(err);
      setCurrentChat((prevChat) => {
        if (!prevChat) return null;
        const msgs = [...prevChat.messages];
        const lastMsgIdx = msgs.findIndex(m => m.id === assistantMsgId);
        if (lastMsgIdx >= 0) {
          msgs[lastMsgIdx] = {
            ...msgs[lastMsgIdx],
            content: "Connexion interrompue. Veuillez vérifier vos clés dans les Paramètres."
          };
        }
        return { ...prevChat, messages: msgs };
      });
    } finally {
      setIsStreaming(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleNewChat = () => {
    setCurrentChat(null);
    setInput('');
    setWebSearchEnabled(false);
    setIsStreaming(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleDeleteChat = () => {
    if (currentChat) {
      ShakurOS.deleteConversation(currentChat.id);
      handleNewChat();
    }
  };

  const isChatEmpty = !currentChat || currentChat.messages.length === 0;
  const completeness = userContext ? userUnderstandingService.calculateCompleteness(userContext, session?.user?.email || '') : 0;
  const isProfileIncomplete = completeness < 100;

  return (
    <div className="chat-container-warm">
      {/* Header bar */}
      <div className="chat-header-bar-warm">
        <div className="chat-header-left" />
        <div className="chat-header-right">
          {!isChatEmpty && (
            <div className="chat-header-actions-warm">
              <button
                onClick={handleNewChat}
                className="chat-header-action-btn-warm"
                title="Nouvelle discussion"
              >
                <RefreshCw size={13} />
                <span>Nouveau</span>
              </button>
              <button
                onClick={handleDeleteChat}
                className="chat-header-action-btn-warm delete"
                title="Supprimer la discussion"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main chat viewport */}
      <div className={`chat-viewport-warm ${isChatEmpty ? 'is-empty' : 'has-messages'}`}>
        {isChatEmpty ? (
          <div className="chat-greeting-view-warm">
            <h1 className="greeting-title-warm">
              {getGreeting()}
            </h1>
            <p className="greeting-subtitle-warm">
              {language === 'fr' ? "Que souhaites-tu accomplir aujourd'hui ?" : "What do you wish to accomplish today?"}
            </p>
          </div>
        ) : (
          <MessageList messages={currentChat.messages} isStreaming={isStreaming} />
        )}
      </div>

      {/* Input panel */}
      <div className="chat-input-panel-warm">
        <form onSubmit={handleSubmit} className="chat-input-form-warm">
          <div className={`chat-input-wrapper-warm ${isStreaming ? 'is-loading-warm' : ''}`}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'fr' ? "Pose ta question, écris, analyse..." : "Pose your question, write, analyze..."}
              className="chat-textarea-warm"
              disabled={isStreaming}
            />
            
            <div className="chat-controls-row-warm">
              <button
                type="button"
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                className={`search-toggle-btn-warm ${webSearchEnabled ? 'active' : ''}`}
                title={t('chat.searchToggle')}
              >
                <Globe size={14} />
                <span>{language === 'fr' ? 'Recherche Web' : 'Web Search'}</span>
              </button>

              <ModelSelector
                selectedProviderId={providerId}
                selectedModelId={modelId}
                onChange={handleModelChange}
              />

              <div className="send-action-group-warm">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={() => setIsStreaming(false)}
                    className="stop-button-warm"
                    title="Arrêter la génération"
                  >
                    <StopCircle size={15} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="send-button-warm"
                    disabled={!input.trim()}
                    title="Envoyer le message"
                  >
                    <Send size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {input.trim() === '' && isChatEmpty && (
            <div className="suggestions-container-warm">
              <div className="input-suggestions-grid-warm">
                <button
                  type="button"
                  onClick={() => setInput(language === 'fr' ? 'Écrire un texte' : 'Write a text')}
                  className="suggestion-card-warm"
                >
                  <div className="suggestion-card-icon-warm">
                    <PenLine size={20} />
                  </div>
                  <div className="suggestion-card-content-warm">
                    <span className="suggestion-card-title-warm">
                      {language === 'fr' ? 'Écrire un texte' : 'Write a text'}
                    </span>
                    <span className="suggestion-card-desc-warm">
                      {language === 'fr' ? 'Rédiger, reformuler, structurer.' : 'Write, rephrase, structure.'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setInput(language === 'fr' ? 'Analyser un document' : 'Analyze a document')}
                  className="suggestion-card-warm"
                >
                  <div className="suggestion-card-icon-warm">
                    <FileText size={20} />
                  </div>
                  <div className="suggestion-card-content-warm">
                    <span className="suggestion-card-title-warm">
                      {language === 'fr' ? 'Analyser un document' : 'Analyze a document'}
                    </span>
                    <span className="suggestion-card-desc-warm">
                      {language === 'fr' ? 'Comprendre, résumer, extraire.' : 'Understand, summarize, extract.'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setInput(language === 'fr' ? 'Préparer une décision' : 'Prepare a decision')}
                  className="suggestion-card-warm"
                >
                  <div className="suggestion-card-icon-warm">
                    <Scale size={20} />
                  </div>
                  <div className="suggestion-card-content-warm">
                    <span className="suggestion-card-title-warm">
                      {language === 'fr' ? 'Préparer une décision' : 'Prepare a decision'}
                    </span>
                    <span className="suggestion-card-desc-warm">
                      {language === 'fr' ? 'Comparer, évaluer, recommander.' : 'Compare, evaluate, recommend.'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setInput(language === 'fr' ? 'Apprendre quelque chose' : 'Learn something')}
                  className="suggestion-card-warm"
                >
                  <div className="suggestion-card-icon-warm">
                    <GraduationCap size={20} />
                  </div>
                  <div className="suggestion-card-content-warm">
                    <span className="suggestion-card-title-warm">
                      {language === 'fr' ? 'Apprendre quelque chose' : 'Learn something'}
                    </span>
                    <span className="suggestion-card-desc-warm">
                      {language === 'fr' ? 'Expliquer, enseigner, comprendre.' : 'Explain, teach, understand.'}
                    </span>
                  </div>
                </button>
              </div>

              {/* Profile incompleteness warning banner placed under suggestions */}
              {session && isProfileIncomplete && (
                <div className="profile-warning-banner-warm">
                  <span>{language === 'fr' ? 'Pour mieux vous connaître, complétez votre profil.' : 'To know you better, complete your profile.'}</span>
                  <button 
                    type="button" 
                    onClick={() => navigate('/profile')} 
                    className="banner-action-btn-warm"
                  >
                    {language === 'fr' ? 'Compléter mon profil' : 'Complete my profile'}
                  </button>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
