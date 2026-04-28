import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthApiError } from '../../../services/api/auth';
import { listClients } from '../../../services/api/clients';
import type { ClientListItem, ClientsListFilters } from '../../../types/clients';

interface ClientEmailCampaignClientSelectorProps {
  selectedClientIds: string[];
  onSelectionChange: (nextClientIds: string[]) => void;
  disabled?: boolean;
  isPreviewMode?: boolean;
}

const buildDefaultFilters = (keyword: string): ClientsListFilters => ({
  keyword,
  city: '',
  status: '',
  type: '',
  primaryPlatform: '',
  ownerUserId: '',
  createdFrom: '',
  createdTo: '',
  page: 1,
  pageSize: 50,
});

export const ClientEmailCampaignClientSelector = ({
  selectedClientIds,
  onSelectionChange,
  disabled = false,
  isPreviewMode = false,
}: ClientEmailCampaignClientSelectorProps) => {
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState<ClientListItem[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedSet = useMemo(() => new Set(selectedClientIds), [selectedClientIds]);

  const load = useCallback(async () => {
    if (isPreviewMode) {
      setItems([]);
      setLoadState('ok');
      setErrorMessage('');
      return;
    }

    setLoadState('loading');
    setErrorMessage('');

    try {
      const response = await listClients(buildDefaultFilters(keyword.trim()));
      setItems(response.data.items ?? []);
      setLoadState('ok');
    } catch (error) {
      setItems([]);
      setLoadState('error');
      setErrorMessage(
        error instanceof AuthApiError ? error.message : 'تعذر تحميل قائمة العملاء.',
      );
    }
  }, [isPreviewMode, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleClient = (clientId: string) => {
    if (disabled) return;
    if (selectedSet.has(clientId)) {
      onSelectionChange(selectedClientIds.filter((id) => id !== clientId));
      return;
    }
    onSelectionChange([...selectedClientIds, clientId]);
  };

  return (
    <section className="clients-card">
      <div className="client-email-campaign-selector-head">
        <h3 className="clients-section-title">اختيار العملاء</h3>
        <span className="clients-muted">المختارون: {selectedClientIds.length}</span>
      </div>

      <div className="clients-filters-grid">
        <label className="clients-field">
          <span>بحث بالاسم</span>
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="ابحث عن عميل..."
            disabled={disabled || isPreviewMode}
          />
        </label>
      </div>

      {loadState === 'loading' && <div className="clients-muted">جاري تحميل العملاء...</div>}
      {loadState === 'error' && <div className="clients-inline-error">{errorMessage}</div>}

      {isPreviewMode ? (
        <div className="client-email-campaigns-preview-shape large">
          <span className="clients-preview-line" />
          <span className="clients-preview-line" />
          <span className="clients-preview-line short" />
        </div>
      ) : (
        <div className="clients-table-wrap">
          <table className="clients-table">
            <thead>
              <tr>
                <th>تحديد</th>
                <th>العميل</th>
                <th>المدينة</th>
                <th>المنصة الأساسية</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="clients-empty-cell" colSpan={4}>
                    لا توجد نتائج.
                  </td>
                </tr>
              ) : (
                items.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedSet.has(client.id)}
                        onChange={() => toggleClient(client.id)}
                        disabled={disabled}
                      />
                    </td>
                    <td>{client.name}</td>
                    <td>{client.city}</td>
                    <td>{client.primaryPlatform}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
