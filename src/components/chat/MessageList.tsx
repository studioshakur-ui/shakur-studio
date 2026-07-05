import { useEffect, useRef } from 'react';
import { Message } from '../../lib/providers/providerTypes';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const renderMessageContent = (content: string) => {
    // If it contains DeepSeek-R1 thinking blocks
    const thinkingMatch = content.match(/\[Chaîne de Pensée - Raisonnement DeepSeek-R1\]\n([\s\S]*?)\n\n/);
    let mainContent = content;
    let thinkingBlock = '';

    if (thinkingMatch) {
      thinkingBlock = thinkingMatch[1];
      mainContent = content.replace(thinkingMatch[0], '');
    }

    return (
      <div className="message-content-wrapper-warm">
        {thinkingBlock && (
          <details className="thinking-details-warm">
            <summary className="thinking-summary-warm">Raisonnement PETAW (DeepSeek-R1)</summary>
            <div className="thinking-content-warm">
              {thinkingBlock.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </details>
        )}
        <div className="message-text-warm">
          {mainContent.split('\n').map((line, index) => {
            if (line.startsWith('* ')) {
              return <li key={index} className="list-item-warm">{line.substring(2)}</li>;
            }
            if (line.startsWith('### ')) {
              return <h3 key={index} className="message-heading-3-warm">{line.substring(4)}</h3>;
            }
            if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
              return <p key={index} className="numbered-item-warm">{line}</p>;
            }
            return (
              <p key={index} className="message-paragraph-warm">
                {line}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="message-list-warm">
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={msg.id}
            className={`message-bubble-warm ${isUser ? 'message-bubble-warm--user' : 'message-bubble-warm--assistant'}`}
          >
            <div className="message-payload-warm">
              <div className="message-header-warm">
                <span className="message-sender-warm">
                  {isUser ? 'Vous' : 'PETAW AI'}
                </span>
                <span className="message-time-warm">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="message-body-warm">
                {renderMessageContent(msg.content)}
              </div>
            </div>
          </div>
        );
      })}
      
      {isStreaming && (
        <div className="message-bubble-warm message-bubble-warm--assistant is-typing-warm">
          <div className="message-payload-warm">
            <div className="message-header-warm">
              <span className="message-sender-warm">PETAW AI</span>
            </div>
            <div className="message-body-warm">
              <div className="typing-indicator-warm">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
}
