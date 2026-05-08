import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pagination } from '../../../components/admin/Pagination';
import { usePermissions } from '../../../store/authStore';
import type { ClientEmailCampaignRecipientDetails } from '../../../types/client-email-campaigns';
import {
  ClientEmailCampaignTrackingFilters,
  type ClientEmailCampaignTrackingFiltersValues,
} from '../components/ClientEmailCampaignTrackingFilters';
import { ClientEmailCampaignRecipientTimelineModal } from '../components/ClientEmailCampaignRecipientTimelineModal';
import { ClientEmailCampaignStatusBadge } from '../components/ClientEmailCampaignStatusBadge';
import { ClientEmailCampaignTrackingRecipientsTable } from '../components/ClientEmailCampaignTrackingRecipientsTable';
import { ClientEmailCampaignTrackingSummaryCards } from '../components/ClientEmailCampaignTrackingSummaryCards';
import { useClientEmailCampaignDetails } from '../hooks/useClientEmailCampaignDetails';
import '../styles/client-email-campaigns.css';
import {
  formatCampaignDateTime,
  hasBounced,
  hasClicked,
  hasComplained,
  hasConfirmedOpen,
  hasUnsubscribed,
  matchesBooleanFilter,
} from '../utils/tracking';

const DEFAULT_FILTERS: ClientEmailCampaignTrackingFiltersValues = {
  keyword: '',
  hasOpened: 'all',
  hasClicked: 'all',
  hasBounced: 'all',
  hasUnsubscribed: 'all',
  hasComplained: 'all',
  lastEventType: 'all',
};

export const ClientEmailCampaignTrackingDetailsPage = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { isReadOnlyUser } = usePermissions();
  const [recipientsPage, setRecipientsPage] = useState(1);
  const [filters, setFilters] = useState<ClientEmailCampaignTrackingFiltersValues>(
    DEFAULT_FILTERS,
  );
  const [selectedRecipient, setSelectedRecipient] =
    useState<ClientEmailCampaignRecipientDetails | null>(null);

  const { details, loadState, errorMessage, refetch } = useClientEmailCampaignDetails({
    campaignId,
    page: recipientsPage,
    pageSize: 25,
    isPreviewMode: isReadOnlyUser,
  });

  const deferredKeyword = useDeferredValue(filters.keyword.trim().toLowerCase());

  const filteredRecipients = useMemo(() => {
    if (!details) return [];

    return details.recipients.filter((recipient) => {
      const keywordSource = [
        recipient.name,
        recipient.clientName,
        recipient.email,
        recipient.clientId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (deferredKeyword && !keywordSource.includes(deferredKeyword)) {
        return false;
      }

      if (
        filters.lastEventType !== 'all' &&
        recipient.lastEventType !== filters.lastEventType
      ) {
        return false;
      }

      if (!matchesBooleanFilter(filters.hasOpened, hasConfirmedOpen(recipient))) return false;
      if (!matchesBooleanFilter(filters.hasClicked, hasClicked(recipient))) return false;
      if (!matchesBooleanFilter(filters.hasBounced, hasBounced(recipient))) return false;
      if (
        !matchesBooleanFilter(filters.hasUnsubscribed, hasUnsubscribed(recipient))
      ) {
        return false;
      }
      if (!matchesBooleanFilter(filters.hasComplained, hasComplained(recipient))) return false;

      return true;
    });
  }, [deferredKeyword, details, filters]);

  return (
    <div className="clients-page client-email-campaigns-page">
      <header className="clients-header">
        <div>
          <h2 className="clients-title">تفاصيل تتبع الحملة</h2>
          <p className="clients-muted">
            شاشة مستقلة لتحليل نشاط المستلمين بعيدًا عن تبويب إدارة الحملات.
          </p>
        </div>
        <div className="clients-header-actions">
          {isReadOnlyUser && <span className="clients-preview-pill-text">Preview Mode</span>}
          <Link to="/client-email-tracking" className="clients-btn clients-btn-ghost">
            العودة لقائمة التتبع
          </Link>
          {campaignId && (
            <Link
              to={`/client-email-campaigns/${campaignId}`}
              className="clients-btn clients-btn-ghost"
            >
              صفحة الحملة
            </Link>
          )}
        </div>
      </header>

      {loadState === 'loading' && (
        <section className="clients-card clients-state">جاري تحميل بيانات التتبع...</section>
      )}

      {loadState === 'error' && (
        <section className="clients-card clients-state">
          <p>{errorMessage}</p>
          <button className="clients-btn clients-btn-primary" onClick={refetch}>
            إعادة المحاولة
          </button>
        </section>
      )}

      {loadState === 'ok' && details && (
        <>
          <section className="clients-card">
            <div className="client-email-tracking-summary-head">
              <div>
                <h3 className="clients-section-title">{details.campaign.title || '-'}</h3>
                <p className="clients-muted">{details.campaign.subject || '-'}</p>
              </div>
              <ClientEmailCampaignStatusBadge status={details.campaign.status} />
            </div>

            <div className="clients-details-grid">
              <div>
                <span className="clients-muted">المرسل</span>
                <div>{details.campaign.senderName || '-'}</div>
              </div>
              <div>
                <span className="clients-muted">بريد المرسل</span>
                <div dir="ltr">{details.campaign.senderEmail || '-'}</div>
              </div>
              <div>
                <span className="clients-muted">تاريخ الإنشاء</span>
                <div>{formatCampaignDateTime(details.campaign.createdAt)}</div>
              </div>
              <div>
                <span className="clients-muted">تاريخ الإرسال</span>
                <div>{formatCampaignDateTime(details.campaign.sentAt)}</div>
              </div>
              <div>
                <span className="clients-muted">آخر نشاط للحملة</span>
                <div>{formatCampaignDateTime(details.campaign.lastEventAt)}</div>
              </div>
              <div>
                <span className="clients-muted">إجمالي المستلمين</span>
                <div>{details.totalRecipients}</div>
              </div>
            </div>
          </section>

          <ClientEmailCampaignTrackingSummaryCards
            summary={details.trackingSummary}
          />

          <ClientEmailCampaignTrackingFilters
            values={filters}
            disabled={isReadOnlyUser}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />

          <div className="client-email-tracking-results-bar">
            <span className="clients-muted">
              مطابقة الفلاتر في الصفحة الحالية: {filteredRecipients.length}
            </span>
            <span className="clients-muted">
              صفحة {details.recipientsPage} من{' '}
              {Math.max(1, Math.ceil(details.totalRecipients / details.recipientsPageSize))}
            </span>
          </div>

          <ClientEmailCampaignTrackingRecipientsTable
            recipients={filteredRecipients}
            isPreviewMode={isReadOnlyUser}
            onViewTimeline={setSelectedRecipient}
          />

          <Pagination
            page={details.recipientsPage}
            pageSize={details.recipientsPageSize}
            total={details.totalRecipients}
            disabled={isReadOnlyUser}
            onPageChange={setRecipientsPage}
          />
        </>
      )}

      {campaignId && selectedRecipient && (
        <ClientEmailCampaignRecipientTimelineModal
          campaignId={campaignId}
          recipient={selectedRecipient}
          isPreviewMode={isReadOnlyUser}
          onClose={() => setSelectedRecipient(null)}
        />
      )}
    </div>
  );
};
