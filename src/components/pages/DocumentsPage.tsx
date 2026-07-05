import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, FileText } from 'lucide-react';
import { ShakurOS, DocumentItem } from '../../lib/shakurOS';
import { translate } from '../../i18n/config';
import { Language } from '../../i18n/translations';

interface DocumentsPageProps {
  language: Language;
}

export function DocumentsPage({ language }: DocumentsPageProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  useEffect(() => {
    setDocuments(ShakurOS.getDocuments());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateUpload(files[0]);
    }
  };

  const simulateUpload = (file: File) => {
    setUploadingName(file.name);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            ShakurOS.uploadDocument(file.name, file.size, file.type || 'application/octet-stream');
            setDocuments(ShakurOS.getDocuments());
            setUploadingName(null);
            setUploadProgress(0);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleDelete = (id: string) => {
    ShakurOS.deleteDocument(id);
    setDocuments(ShakurOS.getDocuments());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      simulateUpload(files[0]);
    }
  };

  return (
    <div className="page-wrapper-warm">
      <div className="page-header-warm">
        <div>
          <h1 className="page-title-warm">{t('nav.documents')}</h1>
          <p className="page-subtitle-warm">
            {language === 'fr' 
              ? 'Contexte documentaire de PETAW.' 
              : 'PETAW context documents.'}
          </p>
        </div>
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

        {/* Documents listing */}
        <div className="documents-list-warm">
          {documents.length > 0 && (
            <div className="documents-table-wrapper-warm">
              <table className="documents-table-warm">
                <thead>
                  <tr>
                    <th>{language === 'fr' ? 'Nom' : 'Name'}</th>
                    <th>{language === 'fr' ? 'Taille' : 'Size'}</th>
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
                      <td className="doc-actions-cell-warm">
                        <button
                          onClick={() => handleDelete(doc.id)}
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
