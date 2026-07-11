import { ReactNode, useEffect, useRef } from 'react';
import { Message } from '../../lib/providers/providerTypes';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  isSearching?: boolean;
  language?: string;
  workStatus?: {
    title: string;
    detail: string;
    steps: string[];
    activeStep: number;
    progress: number;
  } | null;
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

export function MessageList({ messages, isStreaming, isSearching, language, workStatus }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAdminMode = window.localStorage.getItem('petaw-admin-mode') === 'true';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, isSearching]);

  const visibleMessages = messages.filter((message) => !message.content.trim().startsWith('ShakurOS a traite la demande via'));

  const renderMessageContent = (content: string) => {
    const thinkingMatch = content.match(/\[Chaîne de Pensée - Raisonnement DeepSeek-R1\]\n([\s\S]*?)\n\n/);
    let mainContent = content;

    if (thinkingMatch) {
      mainContent = content.replace(thinkingMatch[0], '');
    }

    return (
      <div className="message-content-wrapper-warm">
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

  const renderArtifacts = (msg: Message) => {
    if (!msg.artifacts?.length) {
      return null;
    }

    return (
      <div className="message-artifacts-warm">
        {msg.artifacts.map((artifact) => {
          if (artifact.type === 'image') {
            return (
              <figure key={artifact.id} className="image-artifact-warm">
                <img
                  src={artifact.dataUrl ?? artifact.url}
                  alt={artifact.prompt}
                  width={artifact.width}
                  height={artifact.height}
                  loading="lazy"
                />
                <figcaption>{artifact.prompt}</figcaption>
              </figure>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const renderAttachments = (msg: Message) => {
    if (!msg.attachments?.length) {
      return null;
    }

    return (
      <div className="message-attachments-warm">
        {msg.attachments.map((attachment) => (
          <div key={attachment.id} className="message-attachment-chip-warm">
            <span className="message-attachment-name-warm">{attachment.name}</span>
            <span className="message-attachment-meta-warm">
              {attachment.status === 'processing'
                ? 'processing'
                : attachment.extractionStatus === 'full_text'
                  ? 'text'
                  : attachment.extractionStatus === 'partial'
                    ? 'partial'
                    : attachment.status === 'failed'
                      ? 'failed'
                      : 'file'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderWorkStatus = () => {
    if (!workStatus) {
      return (
        <div className="typing-indicator-warm">
          <span></span>
          <span></span>
          <span></span>
        </div>
      );
    }

    return (
      <div className="assistant-thinking-warm" role="status" aria-live="polite">
        <span className="assistant-thinking-dots-warm" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div className="assistant-thinking-line-warm">
          <span className="assistant-thinking-title-warm">{workStatus.title}</span>
          <span className="assistant-thinking-separator-warm">—</span>
          <span key={workStatus.detail} className="assistant-thinking-detail-warm">{workStatus.detail}</span>
        </div>
      </div>
    );
  };

  const renderRetrievedDocuments = (msg: Message) => {
    const selectedChunks = msg.routingTrace?.documentRetrieval?.selectedChunks;
    if (!selectedChunks || selectedChunks.length === 0) {
      return null;
    }

    const uniqueDocuments = Array.from(new Map(
      selectedChunks.map((chunk) => [chunk.documentId, {
        documentId: chunk.documentId,
        documentName: chunk.documentName ?? `doc ${chunk.documentId.slice(0, 8)}`,
        chunkCount: selectedChunks.filter((entry) => entry.documentId === chunk.documentId).length
      }])
    ).values());

    return (
      <div className="message-retrieval-summary-warm">
        <div className="message-retrieval-label-warm">
          {language === 'fr' ? 'Documents utilisés' : 'Documents used'}
        </div>
        <div className="message-retrieval-docs-warm">
          {uniqueDocuments.map((document) => (
            <div key={document.documentId} className="message-retrieval-doc-chip-warm">
              <span className="message-retrieval-doc-name-warm">{document.documentName}</span>
              <span className="message-retrieval-doc-meta-warm">
                {language === 'fr'
                  ? `${document.chunkCount} extrait${document.chunkCount > 1 ? 's' : ''}`
                  : `${document.chunkCount} excerpt${document.chunkCount > 1 ? 's' : ''}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSources = (content: string) => {
    const sources = extractMarkdownLinks(content);
    if (sources.length === 0) {
      return null;
    }

    return (
      <div className="message-sources-container-warm" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {sources.map((src, idx) => (
          <a
            key={idx}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="source-card-warm"
          >
            <span style={{ fontWeight: 600, color: '#d97706' }}>{idx + 1}</span>
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '145px' }}>{src.title}</span>
            <span style={{ fontSize: '10px', opacity: 0.55 }}>• {src.domain}</span>
          </a>
        ))}
      </div>
    );
  };

  const renderRoutingTrace = (msg: Message) => {
    if (!isAdminMode || msg.role !== 'assistant' || !msg.routingTrace) {
      return null;
    }

    const summaryBits = [
      msg.routingTrace.provider ? `provider: ${msg.routingTrace.provider}` : null,
      msg.routingTrace.model ? `model: ${msg.routingTrace.model}` : null,
      msg.routingTrace.toolStatus ? `tools: ${msg.routingTrace.toolStatus}` : null,
      msg.routingTrace.handoffTarget ? `handoff: ${msg.routingTrace.handoffTarget}` : null
    ].filter(Boolean);

    return (
      <div className="shakuros-routing-details-warm">
        <details className="routing-details-toggle">
          <summary className="routing-details-summary">
            {summaryBits.join(' • ') || 'routing trace'}
          </summary>
          <div className="routing-details-content">
            {msg.routingTrace.documentRetrieval ? (
              <div style={{ marginBottom: '10px' }}>
                <p>
                  <strong>retrieval</strong>{' '}
                  [{msg.routingTrace.documentRetrieval.strategy ?? 'unknown'}]
                  {msg.routingTrace.documentRetrieval.query ? ` ${msg.routingTrace.documentRetrieval.query}` : ''}
                </p>
                {msg.routingTrace.documentRetrieval.selectedChunks?.length ? (
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {msg.routingTrace.documentRetrieval.selectedChunks.map((chunk) => (
                      <p key={`${chunk.documentId}-${chunk.chunkIndex}`} style={{ margin: 0 }}>
                        <strong>chunk</strong> doc={chunk.documentId.slice(0, 8)} idx={chunk.chunkIndex}
                        {typeof chunk.finalScore === 'number' ? ` final=${chunk.finalScore.toFixed(3)}` : ''}
                        {typeof chunk.vectorScore === 'number' ? ` vector=${chunk.vectorScore.toFixed(3)}` : ''}
                        {typeof chunk.lexicalScore === 'number' ? ` lexical=${chunk.lexicalScore.toFixed(3)}` : ''}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p><strong>retrieval</strong> no chunk selected</p>
                )}
              </div>
            ) : null}
            {msg.routingTrace.actions?.map((action) => (
              <p key={`${action.kind}-${action.priority}`}>
                <strong>{action.kind}</strong>{' '}
                [{action.status}] {action.reason}
              </p>
            ))}
          </div>
        </details>
      </div>
    );
  };

  const renderAssistantSignal = (msg: Message) => {
    if (msg.role !== 'assistant') {
      return null;
    }

    const hasDocumentSupport = Boolean(msg.routingTrace?.documentRetrieval?.selectedChunks?.length);
    const hasWebSources = extractMarkdownLinks(msg.content).length > 0;
    if (!hasDocumentSupport && !hasWebSources) {
      return null;
    }

    return (
      <div className="message-signal-row-warm">
        {hasDocumentSupport ? (
          <span className="message-signal-pill-warm">
            {language === 'fr' ? 'Appuyé sur documents' : 'Document-backed'}
          </span>
        ) : null}
        {hasWebSources ? (
          <span className="message-signal-pill-warm is-web">
            {language === 'fr' ? 'Sources web' : 'Web sources'}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <div className="message-list-warm">
      {visibleMessages.map((msg, index) => {
        const isUser = msg.role === 'user';
        const isLast = index === visibleMessages.length - 1;
        const isGenerating = isLast && isStreaming;
        return (
          <div
            key={msg.id}
            className={`message-bubble-warm ${isUser ? 'message-bubble-warm--user' : 'message-bubble-warm--assistant'} ${isGenerating ? 'is-generating-warm' : ''}`}
          >
            <div className="message-payload-warm">
              <div className="message-header-warm">
                <div className="message-header-main-warm">
                  <span className="message-sender-label-warm">
                    {isUser ? 'Vous' : 'PETAW'}
                  </span>
                  {!isUser ? renderAssistantSignal(msg) : null}
                </div>
                <span className="message-time-warm">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="message-body-warm">
                {msg.content || msg.artifacts?.length ? (
                  <>
                    {msg.content ? renderMessageContent(msg.content) : null}
                    {renderAttachments(msg)}
                    {!isUser ? renderRetrievedDocuments(msg) : null}
                    {!isUser && msg.content ? renderSources(msg.content) : null}
                    {!isUser ? renderRoutingTrace(msg) : null}
                    {renderArtifacts(msg)}
                  </>
                ) : (
                  renderWorkStatus()
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {(isStreaming || isSearching) && (visibleMessages.length === 0 || visibleMessages[visibleMessages.length - 1].role !== 'assistant') && (
        <div className="message-bubble-warm message-bubble-warm--assistant is-typing-warm is-generating-warm">
          <div className="message-payload-warm">
            <div className="message-body-warm">
              {isSearching ? (
                renderWorkStatus()
              ) : (
                renderWorkStatus()
              )}
            </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
}

function extractMarkdownLinks(text: string): { title: string; url: string; domain: string }[] {
  const links: { title: string; url: string; domain: string }[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let match;
  const urlsSeen = new Set<string>();

  while ((match = regex.exec(text)) !== null) {
    const title = match[1];
    const url = match[2];
    if (!urlsSeen.has(url)) {
      urlsSeen.add(url);
      let domain = '';
      try {
        domain = new URL(url).hostname.replace('www.', '');
      } catch {
        domain = url;
      }
      links.push({ title, url, domain });
    }
  }

  return links;
}
