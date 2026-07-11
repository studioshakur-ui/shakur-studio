import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, FileText, RefreshCw, ScanSearch, Sparkles } from 'lucide-react';
import { ShakurOS, DocumentItem } from '../../lib/shakurOS';
import { translate } from '../../i18n/config';
import { Language } from '../../i18n/translations';
import { friendlyErrorMessage } from '../../lib/friendlyError';

interface DocumentsPageProps {
  language: Language;
}

export function DocumentsPage({ language }: DocumentsPageProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backfillMessage, setBackfillMessage] = useState<string | null>(null);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdminMode = window.localStorage.getItem('petaw-admin-mode') === 'true';
  
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  useEffect(() => {
    setDocuments(ShakurOS.getDocuments());
    void refreshDocuments();
  }, []);

  useEffect(() => {
    const pending = documents.filter((document) => document.status === 'uploaded' || document.status === 'processing');
    if (pending.length === 0) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      void refreshPendingDocuments(pending.map((document) => document.id));
    }, 2500);

    return () => window.clearInterval(interval);
  }, [documents]);

  const refreshDocuments = async () => {
    try {
      setErrorMessage(null);
      setDocuments(await ShakurOS.refreshDocuments());
    } catch (error) {
      setDocuments(ShakurOS.getDocuments());
      setErrorMessage(friendlyErrorMessage(error, language));
    }
  };

  const refreshPendingDocuments = async (documentIds: string[]) => {
    try {
      const refreshed = await Promise.all(documentIds.map((documentId) => ShakurOS.refreshDocument(documentId)));
      setDocuments((previous) => {
        const updates = new Map(refreshed.map((document) => [document.id, document]));
        return previous.map((document) => updates.get(document.id) ?? document);
      });
    } catch {
      // keep quiet during background polling
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      void registerDocument(files[0]);
    }
    e.target.value = '';
  };

  const registerDocument = async (file: File) => {
    setErrorMessage(null);
    setUploadingName(file.name);
    setUploadProgress(20);

    try {
      setUploadProgress(55);
      const document = await ShakurOS.uploadDocument(file);
      setDocuments((previous) => [document, ...previous.filter((item) => item.id !== document.id)]);
      setUploadProgress(document.status === 'ready' || document.status === 'partial' ? 100 : 80);
    } catch (error) {
      setErrorMessage(friendlyErrorMessage(error, language));
    } finally {
      window.setTimeout(() => {
        setUploadingName(null);
        setUploadProgress(0);
      }, 350);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setErrorMessage(null);
      await ShakurOS.deleteDocument(id);
      setDocuments(ShakurOS.getDocuments());
    } catch (error) {
      setErrorMessage(friendlyErrorMessage(error, language));
    }
  };

  const handleBackfillEmbeddings = async () => {
    try {
      setErrorMessage(null);
      setBackfillMessage(null);
      setIsBackfilling(true);
      const result = await ShakurOS.backfillEmbeddings();
      const summary = result.summary;
      if (summary) {
        setBackfillMessage(
          language === 'fr'
            ? `Backfill terminé: ${summary.documentsEmbedded ?? 0} documents, ${summary.chunksEmbedded ?? 0} chunks indexés.`
            : `Backfill complete: ${summary.documentsEmbedded ?? 0} documents, ${summary.chunksEmbedded ?? 0} chunks indexed.`
        );
      } else {
        setBackfillMessage(result.message ?? (language === 'fr' ? 'Backfill terminé.' : 'Backfill complete.'));
      }
      setDocuments(await ShakurOS.refreshDocuments());
    } catch (error) {
      setErrorMessage(friendlyErrorMessage(error, language));
    } finally {
      setIsBackfilling(false);
    }
  };

  const handleReprocessDocument = async (documentId: string) => {
    try {
      setErrorMessage(null);
      setBackfillMessage(null);
      const updated = await ShakurOS.reprocessDocument(documentId);
      setDocuments((previous) => [updated, ...previous.filter((item) => item.id !== updated.id)]);
      setBackfillMessage(
        language === 'fr'
          ? 'Relance OCR envoyée au serveur.'
          : 'OCR reprocessing sent to the server.'
      );
    } catch (error) {
      setErrorMessage(friendlyErrorMessage(error, language));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      void registerDocument(files[0]);
    }
  };

  return (
    <div className="page-wrapper-warm">
      <div className="page-header-warm">
        <div>
          <h1 className="page-title-warm">{t('nav.documents')}</h1>
          <p className="page-subtitle-warm">
            {language === 'fr' 
              ? 'Documents synchronisés avec le pipeline serveur.'
              : 'Documents synced with the server pipeline.'}
          </p>
        </div>
        {isAdminMode ? (
          <button
            type="button"
            onClick={() => void handleBackfillEmbeddings()}
            className="chat-header-action-btn-warm"
            disabled={isBackfilling}
            title={language === 'fr' ? 'Relancer l’indexation embeddings' : 'Run embeddings backfill'}
          >
            {isBackfilling ? <RefreshCw size={13} className="spin-warm" /> : <ScanSearch size={13} />}
            <span>{language === 'fr' ? 'Backfill embeddings' : 'Embeddings backfill'}</span>
          </button>
        ) : null}
      </div>

      <div className="documents-container-warm">
        {/* Upload dropzone */}
        <div 
          className="upload-dropzone-warm"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="dropzone-inner-warm">
            <Upload size={20} className="dropzone-icon-warm" />
            <h3>{language === 'fr' ? 'Déposer un document' : 'Drop a document here'}</h3>
          </div>
        </div>

        {/* Upload progress feedback */}
        {uploadingName && (
          <div className="upload-progress-warm">
            <div className="progress-details-warm">
              <span>{uploadingName}</span>
              <span className="percent-text-warm">{uploadProgress}%</span>
            </div>
            <div className="progress-bar-track-warm">
              <div className="progress-bar-fill-warm" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="upload-progress-warm" role="alert">
            <div className="progress-details-warm">
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {backfillMessage && (
          <div className="upload-progress-warm">
            <div className="progress-details-warm">
              <span>{backfillMessage}</span>
            </div>
          </div>
        )}

        {/* Documents listing */}
        <div className="documents-list-warm">
          {documents.length > 0 && (
            <div className="documents-table-wrapper-warm">
              <table className="documents-table-warm">
                <thead>
                  <tr>
                    <th>{language === 'fr' ? 'Nom' : 'Name'}</th>
                    <th>{language === 'fr' ? 'Taille' : 'Size'}</th>
                    <th>{language === 'fr' ? 'Statut serveur' : 'Server status'}</th>
                    <th>{language === 'fr' ? 'Contenu' : 'Content'}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="doc-name-cell-warm">
                        <FileText size={13} className="doc-type-icon-warm" />
                        <span className="doc-filename-warm" title={doc.name}>{doc.name}</span>
                      </td>
                      <td className="doc-size-cell-warm">{doc.size}</td>
                      <td className="doc-size-cell-warm">
                        {renderServerStatus(doc, language)}
                      </td>
                      <td className="doc-size-cell-warm">
                        {renderContentStatus(doc, language)}
                      </td>
                      <td className="doc-actions-cell-warm">
                        {needsPremiumOcr(doc) ? (
                          <button
                            onClick={() => void handleReprocessDocument(doc.id)}
                            className="delete-doc-btn-warm"
                            title={language === 'fr' ? 'Relancer OCR premium' : 'Retry premium OCR'}
                          >
                            <Sparkles size={13} />
                          </button>
                        ) : null}
                        <button
                          onClick={() => void handleDelete(doc.id)}
                          className="delete-doc-btn-warm"
                          title="Supprimer le document"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderServerStatus(document: DocumentItem, language: Language): string {
  switch (document.status) {
    case 'processing':
      return language === 'fr' ? 'Traitement' : 'Processing';
    case 'ready':
      return language === 'fr' ? 'Prêt' : 'Ready';
    case 'partial':
      return language === 'fr' ? 'Partiel' : 'Partial';
    case 'failed':
      return language === 'fr' ? 'Échec' : 'Failed';
    case 'deleted':
      return language === 'fr' ? 'Supprimé' : 'Deleted';
    default:
      return language === 'fr' ? 'Reçu' : 'Uploaded';
  }
}

function renderContentStatus(document: DocumentItem, language: Language): string {
  if (needsPremiumOcr(document)) {
    return language === 'fr' ? 'OCR premium requis' : 'Premium OCR required';
  }

  if (document.extractionStatus === 'full_text') {
    return language === 'fr' ? 'Texte complet' : 'Full text';
  }

  if (document.extractionStatus === 'partial') {
    return language === 'fr' ? 'Extrait partiel' : 'Partial extract';
  }

  return language === 'fr' ? 'Métadonnées seules' : 'Metadata only';
}

function needsPremiumOcr(document: DocumentItem): boolean {
  const parserType = (document.parserType ?? '').toLowerCase();
  const errorCode = (document.errorCode ?? '').toLowerCase();
  const errorMessage = (document.errorMessage ?? '').toLowerCase();
  const isImageLike = document.type.startsWith('image/');

  return (
    document.extractionStatus === 'none' &&
    (
      isImageLike ||
      parserType.includes('ocr') ||
      parserType.includes('image') ||
      parserType.includes('binary') ||
      errorCode.includes('ocr') ||
      errorCode.includes('extract') ||
      errorMessage.includes('ocr') ||
      errorMessage.includes('scanned') ||
      errorMessage.includes('image')
    )
  );
}
