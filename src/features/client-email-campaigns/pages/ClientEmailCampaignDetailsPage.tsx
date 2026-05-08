import { Link, useParams } from 'react-router-dom';
import { usePermissions } from '../../../store/authStore';
import { ClientEmailCampaignRecipientsTable } from '../components/ClientEmailCampaignRecipientsTable';
import { ClientEmailCampaignStatusBadge } from '../components/ClientEmailCampaignStatusBadge';
import { useClientEmailCampaignDetails } from '../hooks/useClientEmailCampaignDetails';
import '../styles/client-email-campaigns.css';

const formatDate = (value: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('ar-EG');
};

export const ClientEmailCampaignDetailsPage = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { isReadOnlyUser } = usePermissions();

  const { details, loadState, errorMessage, refetch } = useClientEmailCampaignDetails({
    campaignId,
    page: 1,
    pageSize: 100,
    isPreviewMode: isReadOnlyUser,
  });

  return (
    <div className="clients-page client-email-campaigns-page">
      <header className="clients-header">
        <div>
          <h2 className="clients-title">تفاصيل حملة البريد الإلكتروني</h2>
          <p className="clients-muted">عرض ملخص الحملة وحالة كل Recipient.</p>
        </div>
        <div className="clients-header-actions">
          {isReadOnlyUser && <span className="clients-preview-pill-text">Preview Mode</span>}
          {campaignId && (
            <Link to={`/client-email-tracking/${campaignId}`} className="clients-btn clients-btn-ghost">
              شاشة التتبع
            </Link>
          )}
          <Link to="/client-email-campaigns" className="clients-btn clients-btn-ghost">
            العودة للقائمة
          </Link>
        </div>
      </header>

      {loadState === 'loading' && (
        <section className="clients-card clients-state">جاري تحميل التفاصيل...</section>
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
            <h3 className="clients-section-title">{details.campaign.title || '-'}</h3>
            <div className="clients-details-grid">
              <div>
                <span className="clients-muted">الموضوع</span>
                <div>{details.campaign.subject || '-'}</div>
              </div>
              <div>
                <span className="clients-muted">الحالة</span>
                <div>
                  <ClientEmailCampaignStatusBadge status={details.campaign.status} />
                </div>
              </div>
              <div>
                <span className="clients-muted">اسم المرسل</span>
                <div>{details.campaign.senderName || '-'}</div>
              </div>
              <div>
                <span className="clients-muted">بريد المرسل</span>
                <div dir="ltr">{details.campaign.senderEmail || '-'}</div>
              </div>
              <div>
                <span className="clients-muted">Brevo Campaign ID</span>
                <div>{details.campaign.providerCampaignId || '-'}</div>
              </div>
              <div>
                <span className="clients-muted">Brevo List ID</span>
                <div>{details.campaign.providerListId || '-'}</div>
              </div>
              <div>
                <span className="clients-muted">تاريخ الإنشاء</span>
                <div>{formatDate(details.campaign.createdAt)}</div>
              </div>
              <div>
                <span className="clients-muted">تاريخ الإرسال</span>
                <div>{formatDate(details.campaign.sentAt)}</div>
              </div>
            </div>

            <div className="client-email-campaign-preview-stats compact">
              <div className="client-email-campaign-preview-stat">
                <span>الإجمالي</span>
                <strong>{details.campaign.totalSelected}</strong>
              </div>
              <div className="client-email-campaign-preview-stat sendable">
                <span>صالح</span>
                <strong>{details.campaign.sendableCount}</strong>
              </div>
              <div className="client-email-campaign-preview-stat warning">
                <span>تحذير</span>
                <strong>{details.campaign.warningCount}</strong>
              </div>
              <div className="client-email-campaign-preview-stat blocked">
                <span>ممنوع</span>
                <strong>{details.campaign.blockedCount}</strong>
              </div>
              <div className="client-email-campaign-preview-stat">
                <span>تم الإرسال</span>
                <strong>{details.campaign.sentCount}</strong>
              </div>
              <div className="client-email-campaign-preview-stat">
                <span>فشل</span>
                <strong>{details.campaign.failedCount}</strong>
              </div>
            </div>
          </section>

          <ClientEmailCampaignRecipientsTable
            recipients={details.recipients}
            isPreviewMode={isReadOnlyUser}
          />
        </>
      )}
    </div>
  );
};
