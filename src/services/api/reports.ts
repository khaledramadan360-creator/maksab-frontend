import { authFetch } from '../http/authFetch';
import { AuthApiError } from './auth';
import type {
  ClientReport,
  GenerateClientReportResponse,
  ReportClientSnapshot,
  ReportFormat,
  ReportPlatformScore,
  ReportPreviewPayload,
  ReportRecipientSource,
  ReportScreenshot,
  ReportStatus,
  ReportsListItem,
  SendReportToWhatChimpAttempt,
  SendReportToWhatChimpRequest,
  SendReportToWhatChimpResponse,
  WhatChimpPhoneNumberOption,
  WhatChimpPhoneNumberOptionsResponse,
} from '../../types/reports';

const CLIENTS_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://maksab-backend-production.up.railway.app'}/api/v1/clients`;
const REPORTS_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://maksab-backend-production.up.railway.app'}/api/v1/reports`;

const REPORT_STATUSES: ReportStatus[] = ['generating', 'ready', 'failed'];
const REPORT_FORMATS: ReportFormat[] = ['pdf', 'html'];
const RECIPIENT_SOURCES: ReportRecipientSource[] = ['whatsapp', 'mobile', 'custom'];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toCleanString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const toNullableString = (value: unknown): string | null => {
  const cleaned = toCleanString(value);
  return cleaned.length > 0 ? cleaned : null;
};

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
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
    if (['true', '1', 'yes', 'accepted', 'success', 'ok'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'failed', 'error', 'rejected'].includes(normalized)) {
      return false;
    }
  }

  return fallback;
};

const toStatus = (value: unknown): ReportStatus => {
  if (typeof value === 'string' && (REPORT_STATUSES as string[]).includes(value)) {
    return value as ReportStatus;
  }

  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';

  if (
    [
      'ready',
      'completed',
      'success',
      'succeeded',
      'done',
      'ok',
      'published',
    ].includes(normalized)
  ) {
    return 'ready';
  }

  if (
    ['failed', 'error', 'rejected', 'provider_error', 'generation_failed'].includes(
      normalized,
    )
  ) {
    return 'failed';
  }

  return 'generating';
};

const toFormat = (value: unknown): ReportFormat => {
  if (typeof value === 'string' && (REPORT_FORMATS as string[]).includes(value)) {
    return value as ReportFormat;
  }
  return 'pdf';
};

const toRecipientSource = (value: unknown): ReportRecipientSource => {
  if (typeof value === 'string' && (RECIPIENT_SOURCES as string[]).includes(value)) {
    return value as ReportRecipientSource;
  }
  return 'custom';
};

const stripCssPrefixIfAny = (value: string): string => {
  const firstTagIndex = value.indexOf('<');
  if (firstTagIndex <= 0) return value;

  const prefix = value.slice(0, firstTagIndex).trim();
  const looksLikeCss = prefix.includes('{') && prefix.includes('}') && prefix.includes(':');
  return looksLikeCss ? value.slice(firstTagIndex).trim() : value;
};

const looksLikeHtml = (value: string): boolean => {
  if (!value) return false;
  if (!value.includes('<') || !value.includes('>')) return false;
  return /<\s*(html|head|body|main|section|article|div|h1|h2|h3|p|ul|table|header)\b/i.test(
    value,
  );
};

const pickReportHtml = (raw: Record<string, unknown>): string => {
  const candidates = [
    raw.renderedHtml,
    raw.rendered_html,
    raw.reportHtml,
    raw.previewHtml,
    raw.htmlContent,
    raw.html_content,
  ];

  for (const candidate of candidates) {
    const cleaned = stripCssPrefixIfAny(toCleanString(candidate));
    if (looksLikeHtml(cleaned)) return cleaned;
  }

  for (const candidate of candidates) {
    const cleaned = stripCssPrefixIfAny(toCleanString(candidate));
    if (cleaned.includes('<') && cleaned.includes('>')) return cleaned;
  }

  return '';
};

const pickDataObject = (value: unknown): Record<string, unknown> => {
  if (isObject(value) && isObject(value.data)) {
    return value.data;
  }
  if (isObject(value)) {
    return value;
  }
  return {};
};

const pickDataArray = (value: unknown): Array<Record<string, unknown>> => {
  if (Array.isArray(value)) {
    return value.filter(isObject);
  }

  if (!isObject(value)) {
    return [];
  }

  const keys = ['items', 'rows', 'results', 'reports', 'data'] as const;

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

const WHAT_CHIMP_ATTEMPT_KEYS = [
  'attemptId',
  'reportId',
  'clientId',
  'recipientPhone',
  'recipientSource',
  'whatchimpPhoneNumberId',
  'resolvedWhatChimpAccountId',
  'provider',
  'providerMessageId',
  'providerStatusCode',
  'failureReason',
  'status',
] as const;

const isWhatChimpAttemptLike = (value: unknown): value is Record<string, unknown> => {
  if (!isObject(value)) return false;
  return WHAT_CHIMP_ATTEMPT_KEYS.some((key) => value[key] !== undefined && value[key] !== null);
};

const pickWhatChimpAttemptRaw = (value: unknown): Record<string, unknown> => {
  if (!isObject(value)) return {};

  const candidates: unknown[] = [
    value.data,
    isObject(value.data) ? value.data.data : null,
    value.attempt,
    isObject(value.data) ? value.data.attempt : null,
    value,
  ];

  for (const candidate of candidates) {
    if (isWhatChimpAttemptLike(candidate)) {
      return candidate;
    }
  }

  const dataObject = pickDataObject(value);
  return isObject(dataObject) ? dataObject : {};
};

const toWhatChimpAttempt = (
  value: unknown,
  fallbackSource: ReportRecipientSource,
): SendReportToWhatChimpAttempt => {
  const raw = pickWhatChimpAttemptRaw(value);
  const source = toRecipientSource(raw.recipientSource ?? raw.recipient_source ?? fallbackSource);
  const success = toBoolean(raw.success, raw.failureReason === undefined || raw.failureReason === null);

  return {
    success,
    status: toCleanString(raw.status) || (success ? 'accepted' : 'failed'),
    attemptId: toNullableString(raw.attemptId ?? raw.attempt_id),
    reportId: toNullableString(raw.reportId ?? raw.report_id),
    clientId: toNullableString(raw.clientId ?? raw.client_id),
    recipientPhone: toCleanString(raw.recipientPhone ?? raw.recipient_phone),
    recipientSource: source,
    provider: toCleanString(raw.provider) || 'whatchimp',
    providerMessageId: toNullableString(raw.providerMessageId ?? raw.provider_message_id),
    providerStatusCode: toNullableString(
      raw.providerStatusCode ?? raw.provider_status_code,
    ),
    failureReason: toNullableString(raw.failureReason ?? raw.failure_reason),
    whatchimpPhoneNumberId: toNullableString(
      raw.whatchimpPhoneNumberId ?? raw.whatchimp_phone_number_id,
    ),
    resolvedWhatChimpAccountId: toNullableString(
      raw.resolvedWhatChimpAccountId ??
        raw.resolvedWhatchimpAccountId ??
        raw.resolved_whatchimp_account_id ??
        raw.resolved_what_chimp_account_id,
    ),
    createdAt: toNullableString(raw.createdAt ?? raw.created_at),
  };
};

const toSendReportToWhatChimpResponse = (
  value: unknown,
  fallbackSource: ReportRecipientSource,
): SendReportToWhatChimpResponse => {
  const root = isObject(value) ? value : {};
  const nested = isObject(root.data) ? root.data : {};
  const attempt = toWhatChimpAttempt(value, fallbackSource);

  const success = toBoolean(
    root.success ?? nested.success,
    attempt.success && attempt.status !== 'failed',
  );
  const message =
    toCleanString(root.message ?? nested.message) ||
    (success
      ? 'تم إرسال التقرير عبر WhatChimp بنجاح.'
      : 'تعذر إرسال التقرير عبر WhatChimp.');

  return {
    success,
    message,
    data: {
      ...attempt,
      success,
    },
  };
};

const toWhatChimpPhoneNumberOption = (
  value: unknown,
): WhatChimpPhoneNumberOption | null => {
  if (!isObject(value)) return null;

  const id = toCleanString(value.id);
  if (!id) return null;

  const name = toCleanString(value.name);
  const phoneNumber = toNullableString(value.phoneNumber ?? value.phone_number);
  const fallbackLabel = [name, phoneNumber ? `(${phoneNumber})` : null]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    id,
    name,
    phoneNumber,
    label: toCleanString(value.label) || fallbackLabel || id,
    isDefault: toBoolean(value.isDefault ?? value.is_default),
  };
};

const isWhatChimpPhoneNumberOptionsLike = (
  value: unknown,
): value is Record<string, unknown> => {
  if (!isObject(value)) return false;

  return (
    Array.isArray(value.options) ||
    value.defaultPhoneNumberId !== undefined ||
    value.default_phone_number_id !== undefined ||
    value.allowCustomPhoneNumberId !== undefined ||
    value.allow_custom_phone_number_id !== undefined
  );
};

const pickWhatChimpPhoneNumberOptionsRaw = (value: unknown): Record<string, unknown> => {
  if (!isObject(value)) return {};

  const candidates: unknown[] = [
    isObject(value.data) ? value.data.data : null,
    value.data,
    value,
  ];

  for (const candidate of candidates) {
    if (isWhatChimpPhoneNumberOptionsLike(candidate)) {
      return candidate;
    }
  }

  return {};
};

const toWhatChimpPhoneNumberOptionsResponse = (
  value: unknown,
): WhatChimpPhoneNumberOptionsResponse => {
  const data = pickWhatChimpPhoneNumberOptionsRaw(value);
  const parsedOptions = Array.isArray(data.options)
    ? data.options
        .map((item) => toWhatChimpPhoneNumberOption(item))
        .filter((item): item is WhatChimpPhoneNumberOption => item !== null)
    : [];
  const defaultPhoneNumberId =
    toNullableString(data.defaultPhoneNumberId ?? data.default_phone_number_id) ??
    parsedOptions.find((item) => item.isDefault)?.id ??
    null;
  const options =
    parsedOptions.length > 0
      ? parsedOptions
      : defaultPhoneNumberId
        ? [
            {
              id: defaultPhoneNumberId,
              name: 'Default',
              phoneNumber: null,
              label: 'Default',
              isDefault: true,
            },
          ]
        : [];

  return {
    options,
    defaultPhoneNumberId,
    allowCustomPhoneNumberId: toBoolean(
      data.allowCustomPhoneNumberId ?? data.allow_custom_phone_number_id,
      true,
    ),
  };
};

const pickReportContainer = (value: unknown): Record<string, unknown> => {
  const dataObject = pickDataObject(value);
  if (isObject(dataObject.report)) {
    return dataObject;
  }
  if (isObject(dataObject.clientReport)) {
    return {
      report: dataObject.clientReport,
      client: dataObject.client ?? null,
      preview: dataObject.preview ?? null,
    };
  }
  if (isObject(dataObject.generatedReport)) {
    return {
      report: dataObject.generatedReport,
      client: dataObject.client ?? null,
      preview: dataObject.preview ?? null,
    };
  }

  return {
    report: dataObject,
    client: isObject(dataObject.client) ? dataObject.client : null,
    preview: isObject(dataObject.preview) ? dataObject.preview : null,
  };
};

const toClientSnapshot = (value: unknown): ReportClientSnapshot | null => {
  if (!isObject(value)) return null;

  const id = toCleanString(value.id);
  const name = toCleanString(value.name ?? value.clientName ?? value.client_name);
  if (!id || !name) return null;

  return {
    id,
    name,
    saudiCity: toNullableString(value.saudiCity ?? value.saudi_city ?? value.city),
  };
};

const toPlatformScores = (value: unknown): ReportPlatformScore[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isObject)
    .map((item) => ({
      platform: toCleanString(item.platform ?? item.sourcePlatform ?? ''),
      score: toNumberOrNull(item.score ?? item.platformScore ?? item.value),
    }))
    .filter((item) => item.platform.length > 0);
};

const toScreenshots = (value: unknown): ReportScreenshot[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isObject)
    .map((item) => ({
      platform: toCleanString(item.platform),
      platformUrl: toNullableString(item.platformUrl ?? item.platform_url),
      publicUrl: toNullableString(item.publicUrl ?? item.public_url),
      captureStatus: toCleanString(item.captureStatus ?? item.capture_status ?? 'pending') || 'pending',
      capturedAt: toNullableString(item.capturedAt ?? item.captured_at),
    }))
    .filter((item) => item.platform.length > 0);
};

const toPreviewPayload = (value: unknown): ReportPreviewPayload | null => {
  if (!isObject(value)) return null;

  return {
    overallScore: toNumberOrNull(value.overallScore ?? value.overall_score),
    analysisSummary: toNullableString(value.analysisSummary ?? value.summary ?? value.analysis_summary),
    analyzedAt: toNullableString(value.analyzedAt ?? value.analyzed_at),
    platformScores: toPlatformScores(value.platformScores ?? value.platform_scores),
    screenshots: toScreenshots(value.screenshots),
  };
};

const toClientReport = (value: unknown): ClientReport => {
  const container = pickReportContainer(value);
  const reportRaw = isObject(container.report) ? container.report : {};
  const clientSnapshot =
    toClientSnapshot(container.client) ?? toClientSnapshot(reportRaw.client);
  const previewPayload =
    toPreviewPayload(container.preview) ??
    toPreviewPayload(reportRaw.preview) ??
    null;

  const clientName = clientSnapshot?.name ?? toCleanString(reportRaw.clientName);
  const generatedTitle = clientName ? `تقرير ${clientName}` : 'تقرير العميل';

  return {
    id: String(reportRaw.id ?? reportRaw.reportId ?? ''),
    clientId: String(reportRaw.clientId ?? reportRaw.client_id ?? clientSnapshot?.id ?? ''),
    analysisId: toNullableString(reportRaw.analysisId ?? reportRaw.analysis_id),
    ownerUserId: toNullableString(reportRaw.ownerUserId ?? reportRaw.owner_user_id),
    ownerName: toNullableString(reportRaw.ownerName ?? reportRaw.owner_name),
    status: toStatus(reportRaw.status ?? reportRaw.reportStatus),
    format: toFormat(reportRaw.format ?? reportRaw.reportFormat),
    title: toCleanString(reportRaw.title ?? reportRaw.reportTitle) || generatedTitle,
    htmlContent: pickReportHtml(reportRaw),
    pdfUrl: toNullableString(
      reportRaw.pdfUrl ??
        reportRaw.pdf_url ??
        reportRaw.publicPdfUrl ??
        reportRaw.public_pdf_url ??
        reportRaw.downloadUrl ??
        reportRaw.download_url,
    ),
    pdfStoragePath: toNullableString(
      reportRaw.pdfStoragePath ??
        reportRaw.pdf_storage_path ??
        reportRaw.storagePath ??
        reportRaw.storage_path,
    ),
    generatedAt: toNullableString(
      reportRaw.generatedAt ??
        reportRaw.generated_at ??
        reportRaw.completedAt ??
        reportRaw.completed_at,
    ),
    createdAt: String(reportRaw.createdAt ?? reportRaw.created_at ?? new Date().toISOString()),
    updatedAt: String(reportRaw.updatedAt ?? reportRaw.updated_at ?? new Date().toISOString()),
    client: clientSnapshot,
    preview: previewPayload,
  };
};

const toReportsListItem = (raw: Record<string, unknown>): ReportsListItem => ({
  id: String(raw.id ?? raw.reportId ?? ''),
  clientId: String(
    raw.clientId ?? raw.client_id ?? (isObject(raw.client) ? raw.client.id : '') ?? '',
  ),
  clientName: String(
    raw.clientName ??
      raw.client_name ??
      (isObject(raw.client) ? raw.client.name : '') ??
      'عميل',
  ),
  ownerUserId: toNullableString(
    raw.ownerUserId ??
      raw.owner_user_id ??
      (isObject(raw.owner) ? raw.owner.id : null) ??
      (isObject(raw.client) && isObject(raw.client.owner) ? raw.client.owner.id : null),
  ),
  ownerName: toNullableString(
    raw.ownerName ??
      raw.owner_name ??
      (isObject(raw.owner) ? raw.owner.fullName : null) ??
      (isObject(raw.client) && isObject(raw.client.owner)
        ? raw.client.owner.fullName
        : null),
  ),
  status: toStatus(raw.status ?? raw.reportStatus),
  format: toFormat(raw.format ?? raw.reportFormat),
  pdfUrl: toNullableString(
    raw.pdfUrl ??
      raw.pdf_url ??
      raw.publicPdfUrl ??
      raw.public_pdf_url ??
      raw.downloadUrl ??
      raw.download_url,
  ),
  generatedAt: toNullableString(
    raw.generatedAt ??
      raw.generated_at ??
      raw.completedAt ??
      raw.completed_at,
  ),
  createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  updatedAt: String(raw.updatedAt ?? raw.updated_at ?? new Date().toISOString()),
});

export interface ListReportsParams {
  keyword?: string;
  ownerUserId?: string;
  status?: ReportStatus | 'all';
  generatedAtFrom?: string;
  generatedAtTo?: string;
  page?: number;
  pageSize?: number;
}

const buildReportsQueryString = (params?: ListReportsParams): string => {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.keyword?.trim()) searchParams.set('keyword', params.keyword.trim());
  if (params.ownerUserId?.trim()) searchParams.set('ownerUserId', params.ownerUserId.trim());
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.generatedAtFrom?.trim()) searchParams.set('generatedAtFrom', params.generatedAtFrom.trim());
  if (params.generatedAtTo?.trim()) searchParams.set('generatedAtTo', params.generatedAtTo.trim());
  if (typeof params.page === 'number' && Number.isFinite(params.page) && params.page > 0) {
    searchParams.set('page', String(Math.floor(params.page)));
  }
  if (
    typeof params.pageSize === 'number' &&
    Number.isFinite(params.pageSize) &&
    params.pageSize > 0
  ) {
    searchParams.set('pageSize', String(Math.floor(params.pageSize)));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

const compactWhatChimpPayload = (
  payload: SendReportToWhatChimpRequest,
): SendReportToWhatChimpRequest => {
  const recipientPhone = toCleanString(payload.recipientPhone);
  const recipientSource = toRecipientSource(payload.recipientSource ?? 'custom');
  const recipientName = toNullableString(payload.recipientName);
  const messageText = toNullableString(payload.messageText);
  const whatchimpPhoneNumberId = toNullableString(payload.whatchimpPhoneNumberId);

  const compacted: SendReportToWhatChimpRequest = {
    recipientPhone,
    recipientSource,
  };

  if (recipientName) {
    compacted.recipientName = recipientName;
  }

  if (messageText) {
    compacted.messageText = messageText;
  }

  if (whatchimpPhoneNumberId) {
    compacted.whatchimpPhoneNumberId = whatchimpPhoneNumberId;
  }

  return compacted;
};

export const generateClientReport = async (
  clientId: string,
): Promise<GenerateClientReportResponse> => {
  const response = await authFetch<unknown>(`${CLIENTS_BASE_URL}/${clientId}/report`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  return { data: toClientReport(response) };
};

export const getClientReport = async (
  clientId: string,
): Promise<{ data: ClientReport | null }> => {
  try {
    const response = await authFetch<unknown>(`${CLIENTS_BASE_URL}/${clientId}/report`);
    return { data: toClientReport(response) };
  } catch (error) {
    if (error instanceof AuthApiError && error.httpStatus === 404) {
      return { data: null };
    }
    throw error;
  }
};

export const getReportById = async (
  reportId: string,
): Promise<{ data: ClientReport | null }> => {
  try {
    const response = await authFetch<unknown>(`${REPORTS_BASE_URL}/${reportId}`);
    return { data: toClientReport(response) };
  } catch (error) {
    if (error instanceof AuthApiError && error.httpStatus === 404) {
      return { data: null };
    }
    throw error;
  }
};

export const listReports = async (
  params?: ListReportsParams,
): Promise<{ data: ReportsListItem[]; total: number; page: number; pageSize: number }> => {
  const response = await authFetch<unknown>(
    `${REPORTS_BASE_URL}${buildReportsQueryString(params)}`,
  );

  const root = pickDataObject(response);
  const items = pickDataArray(root).map(toReportsListItem);

  const total = toNumberOrNull(root.total) ?? items.length;
  const page = toNumberOrNull(root.page) ?? 1;
  const pageSize = toNumberOrNull(root.pageSize ?? root.page_size) ?? items.length;

  return {
    data: items,
    total,
    page,
    pageSize,
  };
};

export const sendClientReportToWhatChimp = async (
  clientId: string,
  payload: SendReportToWhatChimpRequest,
): Promise<SendReportToWhatChimpResponse> => {
  const requestBody = compactWhatChimpPayload(payload);
  const response = await authFetch<unknown>(
    `${CLIENTS_BASE_URL}/${clientId}/report/send-whatchimp`,
    {
      method: 'POST',
      body: JSON.stringify(requestBody),
    },
  );

  return toSendReportToWhatChimpResponse(response, requestBody.recipientSource ?? 'custom');
};

export const getWhatChimpPhoneNumberOptions = async (): Promise<WhatChimpPhoneNumberOptionsResponse> => {
  const response = await authFetch<unknown>(
    `${REPORTS_BASE_URL}/whatchimp-phone-number-options`,
  );

  return toWhatChimpPhoneNumberOptionsResponse(response);
};

export const deleteReport = (reportId: string) =>
  authFetch<void>(`${REPORTS_BASE_URL}/${reportId}`, {
    method: 'DELETE',
  });
