import { ReactNode, useEffect, useRef } from 'react';
import { Message } from '../../lib/providers/providerTypes';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
}

function parseInlineMarkdown(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldIdx = remaining.indexOf('**');
    const italicIdx = remaining.indexOf('*');
    const codeIdx = remaining.indexOf('`');

    const indices = [
      { type: 'bold', index: boldIdx },
      { type: 'italic', index: italicIdx },
      { type: 'code', index: codeIdx }
    ].filter(item => item.index !== -1)
     .sort((a, b) => a.index - b.index);

    if (indices.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = indices[0];

    if (first.index > 0) {
      parts.push(remaining.substring(0, first.index));
    }

    remaining = remaining.substring(first.index);

    if (first.type === 'bold') {
      const endIdx = remaining.indexOf('**', 2);
      if (endIdx !== -1) {
        const content = remaining.substring(2, endIdx);
        parts.push(
          <strong key={`b-${keyIdx++}`} className="bold-inline-warm">
            {content}
          </strong>
        );
        remaining = remaining.substring(endIdx + 2);
      } else {
        parts.push('**');
        remaining = remaining.substring(2);
      }
    } else if (first.type === 'italic') {
      const endIdx = remaining.indexOf('*', 1);
      if (endIdx !== -1) {
        const content = remaining.substring(1, endIdx);
        parts.push(
          <em key={`i-${keyIdx++}`} className="italic-inline-warm">
            {content}
          </em>
        );
        remaining = remaining.substring(endIdx + 1);
      } else {
        parts.push('*');
        remaining = remaining.substring(1);
      }
    } else if (first.type === 'code') {
      const endIdx = remaining.indexOf('`', 1);
      if (endIdx !== -1) {
        const content = remaining.substring(1, endIdx);
        parts.push(
          <code key={`c-${keyIdx++}`} className="code-inline-warm">
            {content}
          </code>
        );
        remaining = remaining.substring(endIdx + 1);
      } else {
        parts.push('`');
        remaining = remaining.substring(1);
      }
    }
  }

  return <>{parts}</>;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const renderMessageContent = (content: string) => {
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
                <p key={i}>{parseInlineMarkdown(line)}</p>
              ))}
            </div>
          </details>
        )}
        <div className="message-text-warm">
          {mainContent.split('\n').map((line, index) => {
            const delayStyle = { animationDelay: `${index * 0.05}s` };
            if (line.startsWith('* ')) {
              return (
                <li
                  key={index}
                  className="list-item-warm staggered-item"
                  style={delayStyle}
                >
                  {parseInlineMarkdown(line.substring(2))}
                </li>
              );
            }
            if (line.startsWith('### ')) {
              return (
                <h3
                  key={index}
                  className="message-heading-3-warm staggered-item"
                  style={delayStyle}
                >
                  {parseInlineMarkdown(line.substring(4))}
                </h3>
              );
            }
            if (/^\d+\.\s/.test(line)) {
              return (
                <p
                  key={index}
                  className="numbered-item-warm staggered-item"
                  style={delayStyle}
                >
                  {parseInlineMarkdown(line)}
                </p>
              );
            }
            return (
              <p
                key={index}
                className="message-paragraph-warm staggered-item"
                style={delayStyle}
              >
                {parseInlineMarkdown(line)}
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
              <div className="message-header-warm" aria-hidden="true">
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
