import { useState } from 'react';
import { FileCode, Edit3, Copy, Check, Play } from 'lucide-react';
import { translate } from '../../i18n/config';
import { Language } from '../../i18n/translations';

interface WorkspacePageProps {
  language: Language;
}

export function WorkspacePage({ language }: WorkspacePageProps) {
  const [activeFileId, setActiveFileId] = useState('1');
  const [copied, setCopied] = useState(false);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  const files = [
    {
      id: '1',
      name: 'router_african_languages.ts',
      type: 'typescript',
      content: `// PETAW AI — Routing & Translating African dialects
import { detectLanguage } from './helpers';

export interface DialogueNode {
  id: string;
  dialect: 'wolof' | 'swahili' | 'lingala' | 'yoruba' | 'pulaar' | 'hausa';
  text: string;
}

export function translatePrompt(input: string): string {
  const dialect = detectLanguage(input);
  console.log(\`[PETAW Router] Routing prompt with detected dialect: \${dialect}\`);
  
  switch (dialect) {
    case 'wolof':
      return "Jërëjëf, waaw, tontu bi mu ngi lay xar.";
    case 'swahili':
      return "Asante, ndiyo, jibu lako liko tayari.";
    case 'pulaar':
      return "Aarabe, eyo, jaabi maa ko tayari.";
    default:
      return "Welcome. Processing your request.";
  }
}`
    },
    {
      id: '2',
      name: 'cahier_des_charges_petaOS.md',
      type: 'markdown',
      content: `# Spécifications Techniques — PetaOS

## 1. Objectifs
Créer un système d'exploitation d'agent vocal capable de fonctionner à bas débit.

## 2. Langues supportées
- Français (Langue officielle administrative)
- Wolof (Sénégal, Gambie)
- Swahili (Afrique de l'Est)
- Lingala (RDC, Congo)
- Pulaar (Guinée, Sénégal, Mali)
- Yoruba (Nigeria, Bénin)
- Hausa (Nigeria, Niger)`
    },
    {
      id: '3',
      name: 'styles_glassmorphism.css',
      type: 'css',
      content: `/* Premium Sable & Bronze visual systems */
.petaw-glass-card {
  background: rgba(18, 18, 21, 0.45);
  border: 1px solid rgba(216, 200, 184, 0.05);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
}`
    }
  ];

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-wrapper-warm">
      <div className="page-header-warm">
        <div>
          <h1 className="page-title-warm">{t('nav.workspace')}</h1>
          <p className="page-subtitle-warm">
            {language === 'fr' 
              ? 'Vos projets actifs et documents rédigés.' 
              : 'Your active projects and documents.'}
          </p>
        </div>
      </div>

      <div className="workspace-container-warm">
        {/* Files sidebar tree */}
        <aside className="workspace-file-sidebar-warm">
          <nav className="workspace-sidebar-nav-warm">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`workspace-sidebar-nav-item-warm ${activeFileId === file.id ? 'active' : ''}`}
              >
                {file.type === 'typescript' ? <FileCode size={12} className="icon-bronze-warm" /> : <Edit3 size={12} className="icon-sand-warm" />}
                <span className="file-name-label-warm">{file.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Editor preview canvas */}
        <section className="workspace-editor-canvas-warm">
          <div className="editor-control-header-warm">
            <div className="file-info-group-warm">
              <span className="file-pill-warm">{activeFile.type}</span>
              <h4>{activeFile.name}</h4>
            </div>
            
            <div className="editor-actions-warm">
              <button onClick={handleCopy} className="editor-action-btn-warm" title="Copier le code">
                {copied ? <Check size={12} className="icon-green-warm" /> : <Copy size={12} />}
                <span>{copied ? (language === 'fr' ? 'Copié' : 'Copied') : (language === 'fr' ? 'Copier' : 'Copy')}</span>
              </button>
              
              <button className="editor-action-btn-warm run-btn-warm" title="Simuler l'exécution">
                <Play size={12} />
              </button>
            </div>
          </div>

          <div className="editor-textarea-preview-warm">
            <pre className="code-pre-render-warm">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
