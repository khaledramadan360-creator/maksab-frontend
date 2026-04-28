import { authFetch } from '../http/authFetch';
import type {
  ClientEmailCampaignDetails,
  ClientEmailCampaignListItem,
  ClientEmailCampaignRecipientDetails,
  ClientEmailCampaignRecipientPreview,
  ClientEmailCampaignStatus,
  EmailEligibilityLevel,
  EmailEligibilityReason,
  ListClientEmailCampaignsParams,
  ListClientEmailCampaignsResult,
  PreviewClientEmailCampaignRequest,
  PreviewClientEmailCampaignResponse,
  SendClientEmailCampaignRequest,
  SendClientEmailCampaignResponse,
} from '../../types/client-email-campaigns';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://maksab-backend-production.up.railway.app'}/api/v1/client-email-campaigns`;

const CAMPAIGN_STATUSES: ClientEmailCampaignStatus[] = [
  'draft',
  'previewed',
  'sending',
  'sent',
  'partially_failed',
  'failed',
];

const ELIGIBILITY_LEVELS: EmailEligibilityLevel[] = [
  'sendable',
  'warning',
  'blocked',
];

const ELIGIBILITY_REASONS: EmailEligibilityReason[] = [
  'missing_email',
  'invalid_format',
  'duplicate_email',
  'unknown_status',
  'unverified_email',
  'risky_email',
  'suppressed',
  'bounced',
  'complained',
  'unsubscribed',
  'access_denied',
  'provider_rejected',
];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toCleanString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const toNullableString = (value: unknown): string | null => {
  const cleaned = toCleanString(value);
  return cleaned.length > 0 ? cleaned : null;
};

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
  }
  return fallback;
};

const pickDataObject = (value: unknown): Record<string, unknown> => {
  if (isObject(value) && isObject(value.data)) {
    return value.data;
  }
  return isObject(value) ? value : {};
};

const pickDataArray = (value: unknown): Array<Record<string, unknown>> => {
  if (Array.isArray(value)) {
    return value.filter(isObject);
  }
  if (!isObject(value)) return [];

  const keys = ['items', 'rows', 'results', 'recipients', 'data'] as const;
  for (const key of keys) {
    const candidate = value[key];
    if (Array.isArray(candidate)) {
      return candidate.filter(isObject);
    }
  }

  if (isObject(value.data)) {
    for (const key of keys) {
      const candidate = value.data[key];
      if (Array.isArray(candidate)) {
        return candidate.filter(isObject);
      }
    }
  }

  return [];
};

const toCampaignStatus = (value: unknown): ClientEmailCampaignStatus => {
  if (typeof value === 'string' && (CAMPAIGN_STATUSES as string[]).includes(value)) {
    return value as ClientEmailCampaignStatus;
  }
  return 'draft';
};

const toEligibilityLevel = (value: unknown): EmailEligibilityLevel => {
  if (typeof value === 'string' && (ELIGIBILITY_LEVELS as string[]).includes(value)) {
    return value as EmailEligibilityLevel;
  }
  return 'blocked';
};

const toEligibilityReason = (value: unknown): EmailEligibilityReason | null => {
  if (typeof value === 'string' && (ELIGIBILITY_REASONS as string[]).includes(value)) {
    return value as EmailEligibilityReason;
  }
  return null;
};

const toPreviewRecipient = (
  raw: Record<string, unknown>,
  fallbackLevel?: EmailEligibilityLevel,
): ClientEmailCampaignRecipientPreview => ({
  clientId: toCleanString(raw.clientId ?? raw.client_id ?? raw.id),
  name: toNullableString(raw.name ?? raw.clientName ?? raw.client_name),
  email: toNullableString(raw.email),
  eligibilityLevel: toEligibilityLevel(raw.eligibilityLevel ?? raw.eligibility_level ?? fallbackLevel),
  eligibilityReason: toEligibilityReason(raw.eligibilityReason ?? raw.eligibility_reason),
  canOverride: toBoolean(raw.canOverride, false),
});

const toCampaignListItem = (raw: Record<string, unknown>): ClientEmailCampaignListItem => ({
  id: toCleanString(raw.id ?? raw.campaignId ?? raw.campaign_id),
  title: toCleanString(raw.title ?? raw.campaignTitle ?? raw.campaign_title),
  subject: toCleanString(raw.subject),
  status: toCampaignStatus(raw.status),
  totalSelected: toFiniteNumber(raw.totalSelected ?? raw.total_selected),
  sendableCount: toFiniteNumber(raw.sendableCount ?? raw.sendable_count),
  warningCount: toFiniteNumber(raw.warningCount ?? raw.warning_count),
  blockedCount: toFiniteNumber(raw.blockedCount ?? raw.blocked_count),
  overrideCount: toFiniteNumber(raw.overrideCount ?? raw.override_count),
  sentCount: toFiniteNumber(raw.sentCount ?? raw.sent_count),
  failedCount: toFiniteNumber(raw.failedCount ?? raw.failed_count),
  skippedCount: toFiniteNumber(raw.skippedCount ?? raw.skipped_count),
  createdAt: toNullableString(raw.createdAt ?? raw.created_at),
  sentAt: toNullableString(raw.sentAt ?? raw.sent_at),
  createdByUserId: toNullableString(raw.createdByUserId ?? raw.created_by_user_id),
  createdByName: toNullableString(raw.createdByName ?? raw.created_by_name),
});

const toRecipientStatus = (value: unknown): ClientEmailCampaignRecipientDetails['sendStatus'] => {
  const allowed: Array<ClientEmailCampaignRecipientDetails['sendStatus']> = [
    'pending',
    'sent',
    'failed',
    'skipped',
    'blocked',
    'warning_not_selected',
  ];
  if (typeof value === 'string' && (allowed as string[]).includes(value)) {
    return value as ClientEmailCampaignRecipientDetails['sendStatus'];
  }
  return 'pending';
};

const toRecipientDetails = (
  raw: Record<string, unknown>,
): ClientEmailCampaignRecipientDetails => ({
  id: toCleanString(raw.id ?? raw.recipientId ?? raw.recipient_id),
  clientId: toNullableString(raw.clientId ?? raw.client_id),
  clientName: toNullableString(raw.clientName ?? raw.client_name ?? raw.name),
  email: toNullableString(raw.email),
  sendStatus: toRecipientStatus(raw.sendStatus ?? raw.send_status ?? raw.status),
  eligibilityLevel: raw.eligibilityLevel || raw.eligibility_level
    ? toEligibilityLevel(raw.eligibilityLevel ?? raw.eligibility_level)
    : null,
  eligibilityReason: toEligibilityReason(raw.eligibilityReason ?? raw.eligibility_reason),
  overrideUsed: toBoolean(raw.overrideUsed ?? raw.override_used),
  overrideReason: toNullableString(raw.overrideReason ?? raw.override_reason),
  failureReason: toNullableString(raw.failureReason ?? raw.failure_reason),
  sentAt: toNullableString(raw.sentAt ?? raw.sent_at),
});

const buildListQueryString = (params?: ListClientEmailCampaignsParams): string => {
  if (!params) return '';
  const query = new URLSearchParams();

  if (typeof params.page === 'number' && params.page > 0) {
    query.set('page', String(Math.floor(params.page)));
  }
  if (typeof params.pageSize === 'number' && params.pageSize > 0) {
    query.set('pageSize', String(Math.floor(params.pageSize)));
  }
  if (params.status && params.status !== 'all') {
    query.set('status', params.status);
  }
  if (params.createdAtFrom?.trim()) {
    query.set('createdAtFrom', params.createdAtFrom.trim());
  }
  if (params.createdAtTo?.trim()) {
    query.set('createdAtTo', params.createdAtTo.trim());
  }

  const asString = query.toString();
  return asString ? `?${asString}` : '';
};

const normalizeCampaignPayload = <
  T extends PreviewClientEmailCampaignRequest | SendClientEmailCampaignRequest,
>(
  payload: T,
): T => {
  const normalizedClientIds = Array.from(
    new Set(payload.clientIds.map((id) => id.trim()).filter(Boolean)),
  );
  const normalizedHtml = payload.htmlContent?.trim();
  const normalizedText = payload.textContent?.trim();

  const cleaned = {
    ...payload,
    title: payload.title.trim(),
    subject: payload.subject.trim(),
    senderName: payload.senderName.trim(),
    senderEmail: payload.senderEmail.trim(),
    htmlContent: normalizedHtml || undefined,
    textContent: normalizedText || undefined,
    clientIds: normalizedClientIds,
  } as T;

  if ('overrideWarningClientIds' in cleaned) {
    const overrideIds = Array.from(
      new Set(
        (cleaned.overrideWarningClientIds ?? [])
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    );
    cleaned.overrideWarningClientIds = overrideIds.length > 0 ? overrideIds : undefined;
    cleaned.overrideReason = cleaned.overrideReason?.trim() || undefined;
  }

  return cleaned;
};

export const previewClientEmailCampaign = async (
  payload: PreviewClientEmailCampaignRequest,
): Promise<PreviewClientEmailCampaignResponse> => {
  const response = await authFetch<unknown>(`${BASE_URL}/preview`, {
    method: 'POST',
    body: JSON.stringify(normalizeCampaignPayload(payload)),
  });

  const data = pickDataObject(response);
  const sendableRecipients = pickDataArray(data.sendableRecipients).map((raw) =>
    toPreviewRecipient(raw, 'sendable'),
  );
  const warningRecipients = pickDataArray(data.warningRecipients).map((raw) =>
    toPreviewRecipient(raw, 'warning'),
  );
  const blockedRecipients = pickDataArray(data.blockedRecipients).map((raw) =>
    toPreviewRecipient(raw, 'blocked'),
  );

  return {
    success: toBoolean((isObject(response) ? response.success : null) ?? true, true),
    data: {
      totalSelected: toFiniteNumber(data.totalSelected ?? data.total_selected),
      sendableCount: toFiniteNumber(data.sendableCount ?? data.sendable_count),
      warningCount: toFiniteNumber(data.warningCount ?? data.warning_count),
      blockedCount: toFiniteNumber(data.blockedCount ?? data.blocked_count),
      breakdown: isObject(data.breakdown)
        ? Object.fromEntries(
            Object.entries(data.breakdown).map(([key, value]) => [
              key,
              toFiniteNumber(value),
            ]),
          )
        : {},
      sendableRecipients,
      warningRecipients,
      blockedRecipients,
    },
  };
};

export const sendClientEmailCampaign = async (
  payload: SendClientEmailCampaignRequest,
): Promise<SendClientEmailCampaignResponse> => {
  const response = await authFetch<unknown>(`${BASE_URL}/send`, {
    method: 'POST',
    body: JSON.stringify(normalizeCampaignPayload(payload)),
  });
  const root = isObject(response) ? response : {};
  const data = pickDataObject(response);

  return {
    success: toBoolean(root.success ?? true, true),
    message:
      toCleanString(root.message) || toCleanString(data.message) || 'Client email campaign sent.',
    data: {
      campaignId: toCleanString(data.campaignId ?? data.campaign_id ?? data.id),
      status: toCampaignStatus(data.status),
      totalSelected: toFiniteNumber(data.totalSelected ?? data.total_selected),
      sendableCount: toFiniteNumber(data.sendableCount ?? data.sendable_count),
      warningCount: toFiniteNumber(data.warningCount ?? data.warning_count),
      blockedCount: toFiniteNumber(data.blockedCount ?? data.blocked_count),
      overrideCount: toFiniteNumber(data.overrideCount ?? data.override_count),
      sentCount: toFiniteNumber(data.sentCount ?? data.sent_count),
      failedCount: toFiniteNumber(data.failedCount ?? data.failed_count),
      skippedCount: toFiniteNumber(data.skippedCount ?? data.skipped_count),
      providerCampaignId: toNullableString(
        data.providerCampaignId ?? data.provider_campaign_id,
      ),
      providerListId: toNullableString(data.providerListId ?? data.provider_list_id),
    },
  };
};

export const listClientEmailCampaigns = async (
  params?: ListClientEmailCampaignsParams,
): Promise<ListClientEmailCampaignsResult> => {
  const response = await authFetch<unknown>(`${BASE_URL}${buildListQueryString(params)}`);
  const data = pickDataObject(response);
  const items = pickDataArray(data.items ?? data).map(toCampaignListItem);

  return {
    items,
    total: toFiniteNumber(data.total, items.length),
    page: toFiniteNumber(data.page, params?.page ?? 1),
    pageSize: toFiniteNumber(data.pageSize ?? data.page_size, params?.pageSize ?? 20),
  };
};

export const getClientEmailCampaignDetails = async (
  campaignId: string,
  params?: { page?: number; pageSize?: number },
): Promise<ClientEmailCampaignDetails> => {
  const query = new URLSearchParams();
  if (typeof params?.page === 'number' && params.page > 0) {
    query.set('page', String(Math.floor(params.page)));
  }
  if (typeof params?.pageSize === 'number' && params.pageSize > 0) {
    query.set('pageSize', String(Math.floor(params.pageSize)));
  }
  const queryString = query.toString() ? `?${query.toString()}` : '';

  const response = await authFetch<unknown>(`${BASE_URL}/${campaignId}${queryString}`);
  const data = pickDataObject(response);
  const campaignRaw = isObject(data.campaign) ? data.campaign : data;
  const recipientsRaw = pickDataArray(data.recipients ?? data.items);

  return {
    campaign: {
      ...toCampaignListItem(campaignRaw),
      senderName: toNullableString(campaignRaw.senderName ?? campaignRaw.sender_name),
      senderEmail: toNullableString(campaignRaw.senderEmail ?? campaignRaw.sender_email),
      htmlContent: toNullableString(campaignRaw.htmlContent ?? campaignRaw.html_content),
      textContent: toNullableString(campaignRaw.textContent ?? campaignRaw.text_content),
      providerCampaignId: toNullableString(
        campaignRaw.providerCampaignId ?? campaignRaw.provider_campaign_id,
      ),
      providerListId: toNullableString(
        campaignRaw.providerListId ?? campaignRaw.provider_list_id,
      ),
      updatedAt: toNullableString(campaignRaw.updatedAt ?? campaignRaw.updated_at),
    },
    recipients: recipientsRaw.map(toRecipientDetails),
    totalRecipients: toFiniteNumber(data.total ?? data.totalRecipients, recipientsRaw.length),
    recipientsPage: toFiniteNumber(data.page, params?.page ?? 1),
    recipientsPageSize: toFiniteNumber(
      data.pageSize ?? data.page_size,
      params?.pageSize ?? 20,
    ),
  };
};
