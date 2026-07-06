import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Trash2, StopCircle, RefreshCw } from 'lucide-react';
import { MessageList } from '../chat/MessageList';
import { ShakurOS, Conversation } from '../../lib/shakurOS';
import { Message } from '../../lib/providers/providerTypes';
import { translate } from '../../i18n/config';
import { Language } from '../../i18n/translations';
import { Session } from '@supabase/supabase-js';
import { userUnderstandingService, UserContext } from '../../lib/userUnderstandingService';
import { PetawIntentId, PetawIntentPreset, PetawModeId, resolvePetawIntent, ShakurTaskType } from '../../lib/intentRouter';

interface ChatPageProps {
  language: Language;
  activeChat: Conversation | null;
  onResetActiveChat: () => void;
  session: Session | null;
}

interface SuggestionAction {
  id: PetawIntentId;
  title: string;
  description: string;
  prompt: string;
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
          accent: 'gold',
          modeId: 'auto',
          taskType: 'general'
        },
        {
          id: 'capture',
          title: 'Capturer et comprendre',
          description: 'Photo, document ou capture: explique, résume, extrait.',
          prompt: 'Je vais envoyer une photo ou un document. Prépare-toi à l’analyser clairement.',
          accent: 'pearl',
          modeId: 'premium',
          taskType: 'document'
        },
        {
          id: 'search',
          title: 'Recherche en direct',
          description: 'Trouve des infos récentes et synthétise le vrai signal.',
          prompt: 'Fais une recherche web et donne-moi une synthèse fiable et courte.',
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
          accent: 'copper',
          modeId: 'premium',
          taskType: 'writing'
        },
        {
          id: 'study',
          title: 'Apprendre vite',
          description: 'Explique comme un coach, avec étapes et mini quiz.',
          prompt: 'Explique-moi ce sujet simplement puis teste ma compréhension.',
          accent: 'gold',
          modeId: 'premium',
          taskType: 'education'
        },
        {
          id: 'work',
          title: 'Mode travail',
          description: 'Décision, résumé, devis, plan d’action, argumentaire.',
          prompt: 'Aide-moi à produire un résultat concret pour le travail.',
          accent: 'pearl',
          modeId: 'premium',
          taskType: 'reasoning'
        },
        {
          id: 'voice',
          title: 'Pensée vocale',
          description: 'Parle naturellement, PËTAW structure ensuite.',
          prompt: 'Je vais te dicter une idée brute. Structure-la proprement.',
          accent: 'sage',
          modeId: 'fast',
          taskType: 'general'
        },
        {
          id: 'memory',
          title: hasProfile ? 'Mémoire personnelle' : 'Mieux me connaître',
          description: hasProfile ? 'Reprends mon contexte et avance sans repartir de zéro.' : 'Construisons un contexte personnel utile pour mieux t’aider.',
          prompt: hasProfile ? 'Reprends ce que tu sais déjà de moi et aide-moi à avancer.' : 'Aide-moi à construire mon profil d’usage étape par étape.',
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
          accent: 'gold',
          modeId: 'auto',
          taskType: 'general'
        },
        {
          id: 'capture',
          title: 'Capture and understand',
          description: 'Photo, document, screenshot: explain, summarize, extract.',
          prompt: 'I am about to send a photo or document. Be ready to analyze it clearly.',
          accent: 'pearl',
          modeId: 'premium',
          taskType: 'document'
        },
        {
          id: 'search',
          title: 'Live search',
          description: 'Find fresh information and compress the real signal.',
          prompt: 'Search the web and give me a short reliable synthesis.',
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
          accent: 'copper',
          modeId: 'premium',
          taskType: 'writing'
        },
        {
          id: 'study',
          title: 'Learn faster',
          description: 'Explain like a coach, then test me briefly.',
          prompt: 'Teach me this simply, then test my understanding.',
          accent: 'gold',
          modeId: 'premium',
          taskType: 'education'
        },
        {
          id: 'work',
          title: 'Work mode',
          description: 'Decision prep, summary, quote, plan, argument, brief.',
          prompt: 'Help me produce a concrete result for work.',
          accent: 'pearl',
          modeId: 'premium',
          taskType: 'reasoning'
        },
        {
          id: 'voice',
          title: 'Voice thought',
          description: 'Speak naturally, PËTAW structures it afterwards.',
          prompt: 'I am about to dictate a raw idea. Structure it clearly.',
          accent: 'sage',
          modeId: 'fast',
          taskType: 'general'
        },
        {
          id: 'memory',
          title: hasProfile ? 'Personal memory' : 'Know me better',
          description: hasProfile ? 'Resume from my context instead of restarting.' : 'Let’s build useful personal context to help me better.',
          prompt: hasProfile ? 'Resume from what you already know about me and help me move forward.' : 'Help me build my usage profile step by step.',
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

export function ChatPage({ language, activeChat, onResetActiveChat, session }: ChatPageProps) {
  const [profile, setProfile] = useState(() => ShakurOS.getProfile());
  const [providerId, setProviderId] = useState(profile.defaultProviderId);
  const [modelId, setModelId] = useState(profile.defaultModelId);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  
  const [input, setInput] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PetawIntentPreset | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const [memoryProject, setMemoryProject] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  useEffect(() => {
    // Proactive Project Recall: check recent work
    const history = ShakurOS.getConversations();
    const candidates = ['JANGAI', 'BILLING', 'PETAW'];
    let foundProj: string | null = null;
    for (const proj of candidates) {
      const exists = history.some(c => 
        (currentChat ? c.id !== currentChat.id : true) && 
        (c.title?.toUpperCase().includes(proj) || 
         c.messages.some(m => m.content.toUpperCase().includes(proj)))
      );
      if (exists) {
        foundProj = proj;
        break;
      }
    }
    setMemoryProject(foundProj);
  }, [currentChat]);

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

  const toImageMode = (mode: PetawModeId) => {
    if (mode === 'premium') return 'premium';
    if (mode === 'economy') return 'economical';
    if (mode === 'local') return 'local';
    return 'auto';
  };

  const getGreetingStructure = () => {
    const hour = new Date().getHours();
    const isEvening = hour >= 18;
    
    let greet = 'Bonjour';
    if (language === 'en') {
      greet = 'Hello';
    } else if (isEvening) {
      greet = 'Bonsoir';
    }

    const nameToUse = userContext?.firstName || (profile.name !== 'Utilisateur' ? profile.name : '');
    
    let title = '';
    if (nameToUse && nameToUse.trim()) {
      title = `${greet}, ${nameToUse.trim()}.`;
    } else {
      title = `${greet}.`;
    }

    let subtitle = '';
    if (language === 'fr') {
      subtitle = isEvening ? 'Ton second esprit est prêt.' : "Que souhaites-tu accomplir aujourd'hui ?";
    } else {
      subtitle = isEvening ? 'Your second mind is ready.' : 'What would you like to accomplish today?';
    }

    return { title, subtitle };
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

    const isSearchQuery = resolvedIntent.webSearchEnabled || webSearchEnabled;
    if (isSearchQuery) {
      setIsSearching(true);
    }

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
      if (resolvedIntent.id === 'image_generation') {
        const imageResult = await ShakurOS.generateImage({
          prompt: userMessageText,
          mode: toImageMode(resolvedIntent.modeId),
          quality: resolvedIntent.modeId === 'premium' ? 'high' : 'standard',
          style: 'african-premium',
          size: '1024x1024',
          count: 1,
          locale: language
        });

        setCurrentChat((prevChat) => {
          if (!prevChat) return null;
          const msgs = [...prevChat.messages];
          const lastMsgIdx = msgs.findIndex(m => m.id === assistantMsgId);
          if (lastMsgIdx >= 0) {
            msgs[lastMsgIdx] = {
              ...msgs[lastMsgIdx],
              content: language === 'fr' ? "Voici l'image." : 'Here is the image.',
              artifacts: imageResult.images.map((image) => ({
                type: 'image',
                id: image.id,
                prompt: image.prompt,
                mimeType: image.mimeType,
                dataUrl: image.dataUrl,
                url: image.url,
                width: image.width,
                height: image.height,
                provider: imageResult.provider,
                model: imageResult.model,
                estimatedCost: imageResult.estimatedCost,
                fallbackUsed: imageResult.fallbackUsed
              }))
            };
          }
          const finalChat = { ...prevChat, messages: msgs };
          ShakurOS.saveConversation(finalChat);
          return finalChat;
        });
      } else {
        await ShakurOS.chat(
          providerId,
          providerId === 'auto' ? resolvedIntent.modeId : modelId,
          chat.messages,
          webSearchEnabled,
          (progressText) => {
            setIsSearching(false);
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
      }
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
      setIsSearching(false);
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
  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 18;
  const adaptiveActions = buildAdaptiveActions(language, isEvening, Boolean(userContext?.firstName || userContext?.lastName || session?.user?.email));

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
            </div>
            <h1 className="greeting-title-warm">
              {getGreetingStructure().title}
            </h1>
            <p className="greeting-subtitle-warm">
              {getGreetingStructure().subtitle}
            </p>

            {/* Premium Widgets Row */}
            <div className="greeting-widgets-row-warm">
              {/* Proactive project recall */}
              {memoryProject && (
                <div 
                  className="widget-card-warm memory-widget-warm" 
                  onClick={() => {
                    const history = ShakurOS.getConversations();
                    const foundConv = history.find(c => 
                      c.title?.toUpperCase().includes(memoryProject) || 
                      c.messages.some(m => m.content.toUpperCase().includes(memoryProject))
                    );
                    if (foundConv) {
                      setCurrentChat(foundConv);
                      setProviderId(foundConv.providerId);
                      setModelId(foundConv.modelId);
                    }
                  }}
                >
                  <div className="widget-icon-copper">🧠</div>
                  <div className="widget-content-warm">
                    <span className="widget-label-warm">{language === 'fr' ? 'Reprendre' : 'Resume'}</span>
                    <p className="widget-text-warm">
                      {language === 'fr' 
                        ? `Tu travaillais récemment sur ${memoryProject}. Souhaites-tu continuer ?`
                        : `You were recently working on ${memoryProject}. Do you wish to continue?`}
                    </p>
                  </div>
                </div>
              )}

              {/* Profile completeness card */}
              {userContext && userUnderstandingService.calculateCompleteness(userContext, session?.user?.email || '') < 100 && (
                <div 
                  className="widget-card-warm profile-widget-warm" 
                  onClick={() => {
                    window.location.hash = '#/profile';
                  }}
                >
                  <div className="widget-icon-gold">👤</div>
                  <div className="widget-content-warm">
                    <div className="widget-header-row-warm">
                      <span className="widget-label-warm">{language === 'fr' ? 'Personnalisation' : 'Personalization'}</span>
                      <span className="widget-percentage-warm">
                        {userUnderstandingService.calculateCompleteness(userContext, session?.user?.email || '')}%
                      </span>
                    </div>
                    <p className="widget-text-warm">
                      {language === 'fr'
                        ? "Complète ton profil pour affiner mes réponses."
                        : "Complete your profile to refine my responses."}
                    </p>
                    <div className="widget-progressbar-outer-warm">
                      <div 
                        className="widget-progressbar-inner-warm" 
                        style={{ width: `${userUnderstandingService.calculateCompleteness(userContext, session?.user?.email || '')}%` }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="greeting-manifesto-warm">
              {language === 'fr'
                ? "Pose ta question naturellement. Je choisis le bon chemin derrière."
                : "Ask naturally. I’ll choose the right path behind the scenes."}
            </p>
          </div>
        ) : (
          <MessageList messages={currentChat.messages} isStreaming={isStreaming} isSearching={isSearching} language={language} />
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
                <p className="suggestions-heading-warm">
                  {language === 'fr'
                    ? "Quelques idées pour démarrer."
                    : "A few ways to begin."}
                </p>
              </div>
              <div className="input-suggestions-grid-warm">
                {adaptiveActions.map((action) => {
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleActionSelect(action)}
                      className={`suggestion-card-warm accent-${action.accent} ${selectedPreset?.id === action.id ? 'is-selected' : ''}`}
                    >
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
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
