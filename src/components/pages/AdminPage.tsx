import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Language } from '../../i18n/translations';
import { fetchProviderStatus, ProviderStatus, ProvidersStatusResponse } from '../../lib/shakurosClient';

interface AdminPageProps {
  language: Language;
}

function formatCost(value: number): string {
  return `$${value.toFixed(4)}`;
}

function statusLabel(provider: ProviderStatus, language: Language): string {
  if (!provider.configured) {
    return language === 'fr' ? 'Non configuré' : 'Not configured';
  }
  if (provider.runtimeStatus === 'rate_limited') {
    return language === 'fr' ? 'Limité (rate limit)' : 'Rate limited';
  }
  if (provider.runtimeStatus === 'quota_exhausted') {
    return language === 'fr' ? 'Quota épuisé' : 'Quota exhausted';
  }
  if (provider.runtimeStatus === 'credit_exhausted') {
    return language === 'fr' ? 'Crédit épuisé' : 'Credit exhausted';
  }
  if (!provider.healthy) {
    return language === 'fr' ? 'Dégradé' : 'Degraded';
  }
  return language === 'fr' ? 'Opérationnel' : 'Healthy';
}

function statusIcon(provider: ProviderStatus) {
  if (!provider.configured) {
    return <AlertTriangle size={14} className="admin-status-icon-warm neutral" />;
  }
  if (provider.healthy) {
    return <CheckCircle2 size={14} className="admin-status-icon-warm ok" />;
  }
  return <XCircle size={14} className="admin-status-icon-warm bad" />;
}

export function AdminPage({ language }: AdminPageProps) {
  const [data, setData] = useState<ProvidersStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchProviderStatus();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page-wrapper-warm">
      <div className="page-header-warm">
        <div>
          <h1 className="page-title-warm">{language === 'fr' ? 'Fournisseurs IA' : 'AI Providers'}</h1>
          <p className="page-subtitle-warm">
            {language === 'fr'
              ? 'Santé et consommation de quota par fournisseur ShakurOS.'
              : 'Health and quota consumption per ShakurOS provider.'}
          </p>
        </div>
        <button
          type="button"
          className="footer-control-btn"
          onClick={load}
          disabled={isLoading}
          title={language === 'fr' ? 'Rafraîchir' : 'Refresh'}
        >
          <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
          <span>{language === 'fr' ? 'Rafraîchir' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="upload-progress-warm">
          <span>{error}</span>
        </div>
      )}

      {data && (
        <>
          <div className="admin-summary-grid-warm">
            <div className="admin-summary-card-warm">
              <span className="admin-summary-value-warm">{data.summary.total}</span>
              <span className="admin-summary-label-warm">{language === 'fr' ? 'Total' : 'Total'}</span>
            </div>
            <div className="admin-summary-card-warm">
              <span className="admin-summary-value-warm">{data.summary.configured}</span>
              <span className="admin-summary-label-warm">{language === 'fr' ? 'Configurés' : 'Configured'}</span>
            </div>
            <div className="admin-summary-card-warm">
              <span className="admin-summary-value-warm">{data.summary.healthy}</span>
              <span className="admin-summary-label-warm">{language === 'fr' ? 'Opérationnels' : 'Healthy'}</span>
            </div>
            <div className="admin-summary-card-warm">
              <span className="admin-summary-value-warm">{data.summary.degraded}</span>
              <span className="admin-summary-label-warm">{language === 'fr' ? 'Dégradés' : 'Degraded'}</span>
            </div>
          </div>

          <div className="documents-table-wrapper-warm">
            <table className="documents-table-warm">
              <thead>
                <tr>
                  <th>{language === 'fr' ? 'Fournisseur' : 'Provider'}</th>
                  <th>{language === 'fr' ? 'Configuré' : 'Configured'}</th>
                  <th>{language === 'fr' ? 'Statut' : 'Status'}</th>
                  <th>{language === 'fr' ? 'Requêtes' : 'Requests'}</th>
                  <th>{language === 'fr' ? 'Tokens' : 'Tokens'}</th>
                  <th>{language === 'fr' ? 'Coût estimé' : 'Est. cost'}</th>
                </tr>
              </thead>
              <tbody>
                {data.providers.map((provider) => (
                  <tr key={provider.provider}>
                    <td className="doc-name-cell-warm">
                      <span className="doc-filename-warm">{provider.provider}</span>
                    </td>
                    <td>{provider.configured ? (language === 'fr' ? 'Oui' : 'Yes') : (language === 'fr' ? 'Non' : 'No')}</td>
                    <td className="doc-name-cell-warm">
                      {statusIcon(provider)}
                      <span title={provider.lastError ?? undefined}>{statusLabel(provider, language)}</span>
                    </td>
                    <td>{provider.usage.requests}</td>
                    <td>{provider.usage.tokens}</td>
                    <td>{formatCost(provider.usage.estimatedCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
