import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Trash2, StopCircle, RefreshCw } from 'lucide-react';
import { QuickActions } from '../chat/QuickActions';
import { ModelSelector } from '../chat/ModelSelector';
import { MessageList } from '../chat/MessageList';
import { ShakurOS, Conversation } from '../../lib/shakurOS';
import { Message } from '../../lib/providers/providerTypes';
import { RoutePath } from '../../lib/router';
import { translate } from '../../i18n/config';
import { Language } from '../../i18n/translations';

interface ChatPageProps {
  language: Language;
  navigate: (to: RoutePath) => void;
  activeChat: Conversation | null;
  onResetActiveChat: () => void;
}

export function ChatPage({ language, navigate, activeChat, onResetActiveChat }: ChatPageProps) {
  const [profile, setProfile] = useState(() => ShakurOS.getProfile());
  const [providerId, setProviderId] = useState(profile.defaultProviderId);
  const [modelId, setModelId] = useState(profile.defaultModelId);
  
  const [input, setInput] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

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

  const handleQuickAction = (actionKey: 'ask' | 'upload' | 'search' | 'continue') => {
    if (actionKey === 'upload') {
      navigate('/documents');
    } else if (actionKey === 'continue') {
      navigate('/history');
    } else if (actionKey === 'search') {
      setWebSearchEnabled(true);
      textareaRef.current?.focus();
    } else if (actionKey === 'ask') {
      textareaRef.current?.focus();
    }
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

  return (
    <div className="chat-container-warm">
      {/* Header bar */}
      <div className="chat-header-bar-warm">
        <div className="chat-header-left">
          <ModelSelector
            selectedProviderId={providerId}
            selectedModelId={modelId}
            onChange={handleModelChange}
          />
        </div>
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
      <div className="chat-viewport-warm">
        {isChatEmpty ? (
          <div className="chat-greeting-view-warm">
            <h1 className="greeting-title-warm">
              {language === 'fr' ? 'Bonjour' : 'Hello'} {profile.name}.
            </h1>
            <p className="greeting-subtitle-warm">{t('chat.prompt')}</p>
            
            <QuickActions language={language} onSelectAction={handleQuickAction} />
          </div>
        ) : (
          <MessageList messages={currentChat.messages} isStreaming={isStreaming} />
        )}
      </div>

      {/* Input panel */}
      <div className="chat-input-panel-warm">
        <form onSubmit={handleSubmit} className="chat-input-form-warm">
          <div className="chat-input-wrapper-warm">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.inputPlaceholder')}
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
        </form>
        <p className="chat-footer-disclaimer-warm">
          PETAW AI
        </p>
      </div>
    </div>
  );
}
