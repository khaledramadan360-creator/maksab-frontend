import { useMemo, useState } from 'react';
import { usePermissions } from '../../../store/authStore';
import {
  ClientEmailCampaignsFilters,
  type ClientEmailCampaignsFiltersValues,
} from '../components/ClientEmailCampaignsFilters';
import { ClientEmailCampaignsTable } from '../components/ClientEmailCampaignsTable';
import { useClientEmailCampaignsList } from '../hooks/useClientEmailCampaignsList';
import '../styles/client-email-campaigns.css';

const DEFAULT_FILTERS: ClientEmailCampaignsFiltersValues = {
  keyword: '',
  status: 'all',
  createdAtFrom: '',
  createdAtTo: '',
};

export const ClientEmailCampaignTrackingListPage = () => {
  const { isReadOnlyUser } = usePermissions();
  const [filters, setFilters] = useState<ClientEmailCampaignsFiltersValues>(DEFAULT_FILTERS);

  const { items, total, loadState, errorMessage, refetch } = useClientEmailCampaignsList({
    filters: {
      status: filters.status,
      createdAtFrom: filters.createdAtFrom,
      createdAtTo: filters.createdAtTo,
      page: 1,
      pageSize: 100,
    },
    isPreviewMode: isReadOnlyUser,
  });

  const filteredItems = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(keyword) ||
        item.subject.toLowerCase().includes(keyword)
      );
    });
  }, [filters.keyword, items]);

  return (
    <div className="clients-page client-email-campaigns-page">
      <header className="clients-header">
        <div>
          <h2 className="clients-title">تتبع البريد الإلكتروني</h2>
          <p className="clients-muted">
            شاشة مستقلة لمراقبة التسليم والفتح والنقر والردود لكل حملة.
          </p>
        </div>
        <div className="clients-header-actions">
          {isReadOnlyUser && <span className="clients-preview-pill-text">Preview Mode</span>}
        </div>
      </header>

      <ClientEmailCampaignsFilters
        values={filters}
        disabled={isReadOnlyUser}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {loadState === 'loading' && (
        <section className="clients-card clients-state">جاري تحميل شاشة التتبع...</section>
      )}

      {loadState === 'error' && (
        <section className="clients-card clients-state">
          <p>{errorMessage}</p>
          <button className="clients-btn clients-btn-primary" onClick={refetch}>
            إعادة المحاولة
          </button>
        </section>
      )}

      {loadState === 'ok' && (
        <>
          <div className="clients-muted">الإجمالي: {isReadOnlyUser ? '-' : total}</div>
          <ClientEmailCampaignsTable
            items={filteredItems}
            isPreviewMode={isReadOnlyUser}
            actionLabel="فتح التتبع"
            buildActionHref={(item) => `/client-email-tracking/${item.id}`}
          />
        </>
      )}
    </div>
  );
};
