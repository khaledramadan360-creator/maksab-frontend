import { useCallback, useEffect, useState } from 'react';
import { AuthApiError } from '../../../services/api/auth';
import { getClientEmailCampaignDetails } from '../../../services/api/client-email-campaigns';
import type { ClientEmailCampaignDetails } from '../../../types/client-email-campaigns';

type LoadState = 'loading' | 'ok' | 'error';

interface UseClientEmailCampaignDetailsOptions {
  campaignId?: string;
  page: number;
  pageSize: number;
  isPreviewMode?: boolean;
}

const PREVIEW_DETAILS: ClientEmailCampaignDetails = {
  campaign: {
    id: 'preview-campaign',
    title: 'حملة تجريبية (وضع المشاهدة)',
    subject: 'عنوان تجريبي',
    senderName: 'Maksab',
    senderEmail: 'marketing@example.com',
    status: 'previewed',
    provider: 'brevo',
    providerCampaignId: null,
    providerListId: null,
    totalSelected: 120,
    sendableCount: 100,
    warningCount: 10,
    blockedCount: 10,
    overrideCount: 2,
    sentCount: 0,
    failedCount: 0,
    skippedCount: 0,
    requestedByUserId: null,
    failureReason: null,
    createdAt: new Date().toISOString(),
    sentAt: null,
    updatedAt: null,
    htmlContent: null,
    textContent: null,
    lastEventAt: null,
  },
  trackingSummary: {
    deliveredCount: 0,
    openedCount: 0,
    proxyOpenedCount: 0,
    clickedCount: 0,
    hardBouncedCount: 0,
    softBouncedCount: 0,
    unsubscribedCount: 0,
    complainedCount: 0,
    lastEventAt: null,
  },
  recipients: [],
  totalRecipients: 0,
  recipientsPage: 1,
  recipientsPageSize: 20,
};

export const useClientEmailCampaignDetails = ({
  campaignId,
  page,
  pageSize,
  isPreviewMode = false,
}: UseClientEmailCampaignDetailsOptions) => {
  const [details, setDetails] = useState<ClientEmailCampaignDetails | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    if (!campaignId) {
      setDetails(null);
      setLoadState('error');
      setErrorMessage('معرف الحملة غير متوفر.');
      return;
    }

    if (isPreviewMode) {
      setDetails({
        ...PREVIEW_DETAILS,
        campaign: {
          ...PREVIEW_DETAILS.campaign,
          id: campaignId,
        },
      });
      setLoadState('ok');
      setErrorMessage('');
      return;
    }

    setLoadState('loading');
    setErrorMessage('');

    try {
      const response = await getClientEmailCampaignDetails(campaignId, { page, pageSize });
      setDetails(response);
      setLoadState('ok');
    } catch (error) {
      setDetails(null);
      setLoadState('error');
      setErrorMessage(
        error instanceof AuthApiError
          ? error.message
          : 'تعذر تحميل تفاصيل الحملة.',
      );
    }
  }, [campaignId, isPreviewMode, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    details,
    loadState,
    errorMessage,
    refetch: load,
    setDetails,
  };
};
