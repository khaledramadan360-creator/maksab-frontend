import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pagination } from '../../../components/admin/Pagination';
import { getClientEmailCampaignRecipientEvents } from '../../../services/api/client-email-campaigns';
import { AuthApiError } from '../../../services/api/auth';
import {
  TRACKING_EVENT_LABELS,
  type ClientEmailCampaignRecipientDetails,
  type ClientEmailCampaignRecipientEvents,
  type ClientEmailCampaignTrackingEventType,
} from '../../../types/client-email-campaigns';
import { formatCampaignDateTime } from '../utils/tracking';

interface ClientEmailCampaignRecipientTimelineModalProps {
  campaignId: string;
  recipient: ClientEmailCampaignRecipientDetails | null;
  isPreviewMode?: boolean;
  onClose: () => void;
}

type LoadState = 'loading' | 'ok' | 'error';

const PAGE_SIZE = 50;

const EVENT_SOURCE_LABELS: Record<string, string> = {
  marketing: 'الحملة',
  inbound: 'وارد',
};

const EVENT_TONE_CLASSES: Record<ClientEmailCampaignTrackingEventType, string> = {
  delivered: 'tone-success',
  opened: 'tone-info',
  proxy_opened: 'tone-muted',
  clicked: 'tone-accent',
  soft_bounced: 'tone-warning',
  hard_bounced: 'tone-danger',
  unsubscribed: 'tone-danger',
  complained: 'tone-danger',
};

export const ClientEmailCampaignRecipientTimelineModal = ({
  campaignId,
  recipient,
  isPreviewMode = false,
  onClose,
}: ClientEmailCampaignRecipientTimelineModalProps) => {
  const [page, setPage] = useState(1);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [timeline, setTimeline] = useState<ClientEmailCampaignRecipientEvents | null>(null);

  useEffect(() => {
    setPage(1);
  }, [recipient?.id]);

  const loadTimeline = useCallback(async () => {
    if (!recipient) return;

    if (isPreviewMode) {
      setTimeline({
        recipient,
        events: {
          items: [],
          total: 0,
          page,
          pageSize: PAGE_SIZE,
        },
      });
      setLoadState('ok');
      setErrorMessage('');
      return;
    }

    setLoadState('loading');
    setErrorMessage('');

    try {
      const response = await getClientEmailCampaignRecipientEvents(campaignId, recipient.id, {
        page,
        pageSize: PAGE_SIZE,
      });
      setTimeline(response);
      setLoadState('ok');
    } catch (error) {
      setTimeline(null);
      setLoadState('error');
      setErrorMessage(
        error instanceof AuthApiError ? error.message : 'تعذر تحميل التسلسل الزمني للمستلم.',
      );
    }
  }, [campaignId, isPreviewMode, page, recipient]);

  useEffect(() => {
    if (!recipient) return;
    loadTimeline();
  }, [loadTimeline, recipient]);

  const title = useMemo(() => {
    if (!recipient) return '';
    return recipient.name || recipient.clientName || recipient.email || 'المستلم';
  }, [recipient]);

  if (!recipient) return null;

  return (
    <div className="clients-modal-overlay" onClick={onClose}>
      <div
        className="clients-modal-card lg client-email-tracking-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="client-email-tracking-modal-head">
          <div>
            <h3 className="clients-section-title">Timeline المستلم</h3>
            <p className="clients-muted">
              {title}
              {recipient.email ? ` • ${recipient.email}` : ''}
            </p>
          </div>
          <button type="button" className="clients-btn clients-btn-ghost" onClick={onClose}>
            إغلاق
          </button>
        </div>

        <div className="client-email-quick-badges">
          <span className="client-email-quick-badge tone-success">
            Opened: {recipient.openCount}
          </span>
          <span className="client-email-quick-badge tone-accent">
            Clicked: {recipient.clickCount}
          </span>
          <span className="client-email-quick-badge tone-muted">
            Proxy Open: {recipient.proxyOpenCount}
          </span>
        </div>

        {loadState === 'loading' && (
          <div className="clients-card clients-state">جاري تحميل التسلسل الزمني...</div>
        )}

        {loadState === 'error' && (
          <div className="clients-card clients-state">
            <p>{errorMessage}</p>
            <button className="clients-btn clients-btn-primary" onClick={loadTimeline}>
              إعادة المحاولة
            </button>
          </div>
        )}

        {loadState === 'ok' && timeline && (
          <>
            {timeline.events.items.length === 0 ? (
              <div className="client-email-timeline-empty">
                لا توجد أحداث متاحة لهذا المستلم حتى الآن.
              </div>
            ) : (
              <div className="client-email-timeline">
                {timeline.events.items.map((eventItem) => (
                  <article
                    key={eventItem.id}
                    className={`client-email-timeline-item ${EVENT_TONE_CLASSES[eventItem.eventType]}`}
                  >
                    <div className="client-email-timeline-head">
                      <div className="client-email-timeline-title">
                        {TRACKING_EVENT_LABELS[eventItem.eventType]}
                      </div>
                      <div className="client-email-timeline-meta">
                        {formatCampaignDateTime(eventItem.eventAt)}
                      </div>
                    </div>

                    <div className="client-email-timeline-body">
                      <div className="clients-muted">
                        المصدر: {EVENT_SOURCE_LABELS[eventItem.source] ?? eventItem.source}
                      </div>
                      {eventItem.reason && (
                        <div className="client-email-timeline-text">
                          السبب: {eventItem.reason}
                        </div>
                      )}
                      {eventItem.linkUrl && (
                        <a
                          href={eventItem.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="client-email-recipient-link"
                          dir="ltr"
                        >
                          {eventItem.linkUrl}
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="client-email-timeline-footer">
              <span className="clients-muted">إجمالي الأحداث: {timeline.events.total}</span>
              <Pagination
                page={timeline.events.page}
                pageSize={timeline.events.pageSize}
                total={timeline.events.total}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
