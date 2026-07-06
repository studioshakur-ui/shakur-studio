import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Trash2, StopCircle, RefreshCw, PenLine, Camera, Mic, Search, Briefcase, Brain, Sparkles, BookOpenCheck } from 'lucide-react';
import { ModelSelector } from '../chat/ModelSelector';
import { MessageList } from '../chat/MessageList';
import { ShakurOS, Conversation } from '../../lib/shakurOS';
import { Message } from '../../lib/providers/providerTypes';
import { RoutePath } from '../../lib/router';
import { translate } from '../../i18n/config';
import { Language } from '../../i18n/translations';
import { Session } from '@supabase/supabase-js';
import { userUnderstandingService, UserContext } from '../../lib/userUnderstandingService';
import { PetawIntentId, PetawIntentPreset, PetawModeId, resolvePetawIntent, ShakurTaskType } from '../../lib/intentRouter';

interface ChatPageProps {
  language: Language;
  navigate: (to: RoutePath) => void;
  activeChat: Conversation | null;
  onResetActiveChat: () => void;
  session: Session | null;
}

interface SuggestionAction {
  id: PetawIntentId;
  title: string;
  description: string;
  prompt: string;
  icon: React.ComponentType<{ size?: number }>;
  accent: 'gold' | 'copper' | 'pearl' | 'sage';
  modeId: PetawModeId;
  taskType: ShakurTaskType;
  enableWebSearch?: boolean;
}

function buildAdaptiveActions(language: Language, isEvening: boolean, hasProfile: boolean): SuggestionAction[] {
  const actions: SuggestionAction[] = language === 'fr'
    ? [
        {
          id: 'ask',
          title: isEvening ? 'Clarifier une idée' : 'Poser une question',
          description: isEvening ? 'Démêle vite un sujet avant de finir la journée.' : 'Une réponse nette, directe et contextualisée.',
          prompt: isEvening ? 'Aide-moi à clarifier cette idée étape par étape.' : 'J’ai une question précise et je veux une réponse claire.',
          icon: Sparkles,
          accent: 'gold',
          modeId: 'auto',
          taskType: 'general'
        },
        {
          id: 'capture',
          title: 'Capturer et comprendre',
          description: 'Photo, document ou capture: explique, résume, extrait.',
          prompt: 'Je vais envoyer une photo ou un document. Prépare-toi à l’analyser clairement.',
          icon: Camera,
          accent: 'pearl',
          modeId: 'premium',
          taskType: 'document'
        },
        {
          id: 'search',
          title: 'Recherche en direct',
          description: 'Trouve des infos récentes et synthétise le vrai signal.',
          prompt: 'Fais une recherche web et donne-moi une synthèse fiable et courte.',
          icon: Search,
          accent: 'sage',
          enableWebSearch: true,
          modeId: 'fast',
          taskType: 'general'
        },
        {
          id: 'write',
          title: 'Écrire pour moi',
          description: 'Message, mail, post ou texte déjà bien formulé.',
          prompt: 'Rédige un texte utile, propre et prêt à envoyer.',
          icon: PenLine,
          accent: 'copper',
          modeId: 'premium',
          taskType: 'writing'
        },
        {
          id: 'study',
          title: 'Apprendre vite',
          description: 'Explique comme un coach, avec étapes et mini quiz.',
          prompt: 'Explique-moi ce sujet simplement puis teste ma compréhension.',
          icon: BookOpenCheck,
          accent: 'gold',
          modeId: 'premium',
          taskType: 'education'
        },
        {
          id: 'work',
          title: 'Mode travail',
          description: 'Décision, résumé, devis, plan d’action, argumentaire.',
          prompt: 'Aide-moi à produire un résultat concret pour le travail.',
          icon: Briefcase,
          accent: 'pearl',
          modeId: 'premium',
          taskType: 'reasoning'
        },
        {
          id: 'voice',
          title: 'Pensée vocale',
          description: 'Parle naturellement, PËTAW structure ensuite.',
          prompt: 'Je vais te dicter une idée brute. Structure-la proprement.',
          icon: Mic,
          accent: 'sage',
          modeId: 'fast',
          taskType: 'general'
        },
        {
          id: 'memory',
          title: hasProfile ? 'Mémoire personnelle' : 'Mieux me connaître',
          description: hasProfile ? 'Reprends mon contexte et avance sans repartir de zéro.' : 'Construisons un contexte personnel utile pour mieux t’aider.',
          prompt: hasProfile ? 'Reprends ce que tu sais déjà de moi et aide-moi à avancer.' : 'Aide-moi à construire mon profil d’usage étape par étape.',
          icon: Brain,
          accent: 'copper',
          modeId: 'auto',
          taskType: 'reasoning'
        }
      ]
    : [
        {
          id: 'ask',
          title: isEvening ? 'Untangle an idea' : 'Ask anything',
          description: isEvening ? 'Get clarity quickly before ending your day.' : 'A direct, clean, contextual answer.',
          prompt: isEvening ? 'Help me untangle this idea step by step.' : 'I have a precise question and want a clear answer.',
          icon: Sparkles,
          accent: 'gold',
          modeId: 'auto',
          taskType: 'general'
        },
        {
          id: 'capture',
          title: 'Capture and understand',
          description: 'Photo, document, screenshot: explain, summarize, extract.',
          prompt: 'I am about to send a photo or document. Be ready to analyze it clearly.',
          icon: Camera,
          accent: 'pearl',
          modeId: 'premium',
          taskType: 'document'
        },
        {
          id: 'search',
          title: 'Live search',
          description: 'Find fresh information and compress the real signal.',
          prompt: 'Search the web and give me a short reliable synthesis.',
          icon: Search,
          accent: 'sage',
          enableWebSearch: true,
          modeId: 'fast',
          taskType: 'general'
        },
        {
          id: 'write',
          title: 'Write for me',
          description: 'Message, email, post, or text ready to send.',
          prompt: 'Write something useful, polished, and ready to send.',
          icon: PenLine,
          accent: 'copper',
          modeId: 'premium',
          taskType: 'writing'
        },
        {
          id: 'study',
          title: 'Learn faster',
          description: 'Explain like a coach, then test me briefly.',
          prompt: 'Teach me this simply, then test my understanding.',
          icon: BookOpenCheck,
          accent: 'gold',
          modeId: 'premium',
          taskType: 'education'
        },
        {
          id: 'work',
          title: 'Work mode',
          description: 'Decision prep, summary, quote, plan, argument, brief.',
          prompt: 'Help me produce a concrete result for work.',
          icon: Briefcase,
          accent: 'pearl',
          modeId: 'premium',
          taskType: 'reasoning'
        },
        {
          id: 'voice',
          title: 'Voice thought',
          description: 'Speak naturally, PËTAW structures it afterwards.',
          prompt: 'I am about to dictate a raw idea. Structure it clearly.',
          icon: Mic,
          accent: 'sage',
          modeId: 'fast',
          taskType: 'general'
        },
        {
          id: 'memory',
          title: hasProfile ? 'Personal memory' : 'Know me better',
          description: hasProfile ? 'Resume from my context instead of restarting.' : 'Let’s build useful personal context to help me better.',
          prompt: hasProfile ? 'Resume from what you already know about me and help me move forward.' : 'Help me build my usage profile step by step.',
          icon: Brain,
          accent: 'copper',
          modeId: 'auto',
          taskType: 'reasoning'
        }
      ];

  const priority: PetawIntentId[] = isEvening
    ? ['ask', 'work', 'memory', 'write', 'study', 'search', 'capture', 'voice']
    : ['ask', 'capture', 'search', 'study', 'work', 'write', 'voice', 'memory'];

  return [...actions].sort((left, right) => priority.indexOf(left.id) - priority.indexOf(right.id));
}

export function ChatPage({ language, navigate, activeChat, onResetActiveChat, session }: ChatPageProps) {
  const [profile, setProfile] = useState(() => ShakurOS.getProfile());
  const [providerId, setProviderId] = useState(profile.defaultProviderId);
  const [modelId, setModelId] = useState(profile.defaultModelId);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  
  const [input, setInput] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PetawIntentPreset | null>(null);
  
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
    setSelectedPreset((current) => current ? { ...current, modeId: mId as PetawModeId } : current);
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
    const resolvedIntent = resolvePetawIntent({
      text: userMessageText,
      messages: currentChat?.messages ?? [],
      webSearchEnabled,
      preset: selectedPreset ?? undefined
    });

    if (providerId === 'auto') {
      setModelId(resolvedIntent.modeId);
    }

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
        providerId === 'auto' ? resolvedIntent.modeId : modelId,
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
        },
        resolvedIntent
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
      setSelectedPreset(null);
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
    setSelectedPreset(null);
    setProviderId('auto');
    setModelId('auto');
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
  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 18;
  const adaptiveActions = buildAdaptiveActions(language, isEvening, Boolean(userContext?.firstName || userContext?.lastName || session?.user?.email));
  const highlightedAction = selectedPreset
    ? adaptiveActions.find((action) => action.id === selectedPreset.id) ?? adaptiveActions[0]
    : adaptiveActions[0];

  const handleActionSelect = (action: SuggestionAction) => {
    const preset: PetawIntentPreset = {
      id: action.id,
      modeId: action.modeId,
      taskType: action.taskType,
      requiredCapabilities: ['chat'],
      webSearchEnabled: action.enableWebSearch,
      metadata: {
        source: 'adaptive-action',
        adaptiveActionId: action.id
      }
    };

    setSelectedPreset(preset);
    setInput(action.prompt);
    setWebSearchEnabled(Boolean(action.enableWebSearch));
    setProviderId('auto');
    setModelId(action.modeId);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

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
            <div className="greeting-brand-kicker-warm">
              <span className="greeting-brand-mark-warm">P<span className="brand-diaeresis">Ë</span>TAW</span>
              <span className="greeting-brand-copy-warm">
                {language === 'fr' ? 'Assistant personnel vivant' : 'Living personal assistant'}
              </span>
            </div>
            <h1 className="greeting-title-warm">
              {getGreeting()}
            </h1>
            <p className="greeting-subtitle-warm">
              {language === 'fr' ? "Que souhaites-tu accomplir aujourd'hui ?" : "What do you wish to accomplish today?"}
            </p>
            <p className="greeting-manifesto-warm">
              {language === 'fr'
                ? "Écris, parle, capture, cherche, apprends ou produis un résultat concret. PËTAW adapte son mode à ton moment."
                : "Write, speak, capture, search, learn, or produce something concrete. PËTAW adapts its mode to your moment."}
            </p>
            <div className="landing-routing-preview-warm">
              <span className="routing-preview-label-warm">
                {language === 'fr' ? 'Mode en avant' : 'Featured mode'}
              </span>
              <div className="routing-preview-track-warm">
                <span className="routing-preview-pill-warm">{highlightedAction.title}</span>
                <span className="routing-preview-meta-warm">
                  {language === 'fr'
                    ? `Routage ${highlightedAction.modeId} • tâche ${highlightedAction.taskType}`
                    : `${highlightedAction.modeId} routing • ${highlightedAction.taskType} task`}
                </span>
              </div>
            </div>
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
              <div className="suggestions-header-warm">
                <span className="suggestions-eyebrow-warm">
                  {language === 'fr' ? 'Modes adaptatifs' : 'Adaptive modes'}
                </span>
                <p className="suggestions-heading-warm">
                  {language === 'fr'
                    ? "Huit façons d’utiliser PËTAW, réordonnées selon ton contexte."
                    : "Eight ways to use PËTAW, reordered for your context."}
                </p>
              </div>
              <div className="input-suggestions-grid-warm">
                {adaptiveActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleActionSelect(action)}
                      className={`suggestion-card-warm accent-${action.accent} ${selectedPreset?.id === action.id ? 'is-selected' : ''}`}
                    >
                      <div className="suggestion-card-icon-warm">
                        <Icon size={20} />
                      </div>
                      <div className="suggestion-card-content-warm">
                        <span className="suggestion-card-title-warm">
                          {action.title}
                        </span>
                        <span className="suggestion-card-desc-warm">
                          {action.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
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
