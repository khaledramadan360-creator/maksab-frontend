export type EmailEligibilityLevel = 'sendable' | 'warning' | 'blocked';

export type EmailEligibilityReason =
  | 'missing_email'
  | 'invalid_format'
  | 'duplicate_email'
  | 'unknown_status'
  | 'unverified_email'
  | 'risky_email'
  | 'suppressed'
  | 'bounced'
  | 'complained'
  | 'unsubscribed'
  | 'access_denied'
  | 'provider_rejected';

export type ClientEmailCampaignStatus =
  | 'draft'
  | 'previewed'
  | 'sending'
  | 'sent'
  | 'partially_failed'
  | 'failed';

export type ClientEmailCampaignRecipientStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'skipped'
  | 'blocked'
  | 'warning_not_selected';

export type ClientEmailCampaignTrackingEventType =
  | 'delivered'
  | 'opened'
  | 'proxy_opened'
  | 'clicked'
  | 'soft_bounced'
  | 'hard_bounced'
  | 'unsubscribed'
  | 'complained';

export type ClientEmailCampaignBounceType = 'hard_bounced' | 'soft_bounced';

export type ClientEmailCampaignEventSource = 'marketing' | 'inbound';

export interface ClientEmailCampaignRecipientPreview {
  clientId: string;
  name: string | null;
  email: string | null;
  eligibilityLevel: EmailEligibilityLevel;
  eligibilityReason: EmailEligibilityReason | null;
  canOverride: boolean;
}

export interface ClientEmailCampaignPreviewData {
  totalSelected: number;
  sendableCount: number;
  warningCount: number;
  blockedCount: number;
  breakdown: Record<string, number>;
  sendableRecipients: ClientEmailCampaignRecipientPreview[];
  warningRecipients: ClientEmailCampaignRecipientPreview[];
  blockedRecipients: ClientEmailCampaignRecipientPreview[];
}

export interface PreviewClientEmailCampaignResponse {
  success: boolean;
  data: ClientEmailCampaignPreviewData;
}

export interface PreviewClientEmailCampaignRequest {
  title: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  htmlContent?: string;
  textContent?: string;
  clientIds: string[];
}

export interface SendClientEmailCampaignRequest
  extends PreviewClientEmailCampaignRequest {
  overrideWarningClientIds?: string[];
  overrideReason?: string;
}

export interface SendClientEmailCampaignResponse {
  success: boolean;
  message: string;
  data: {
    campaignId: string;
    status: ClientEmailCampaignStatus;
    totalSelected: number;
    sendableCount: number;
    warningCount: number;
    blockedCount: number;
    overrideCount: number;
    sentCount: number;
    failedCount: number;
    skippedCount: number;
    providerCampaignId?: string | null;
    providerListId?: string | null;
  };
}

export interface ClientEmailCampaignListItem {
  id: string;
  title: string;
  subject: string;
  senderName: string | null;
  senderEmail: string | null;
  status: ClientEmailCampaignStatus;
  provider: 'brevo';
  providerCampaignId: string | null;
  providerListId: string | null;
  totalSelected: number;
  sendableCount: number;
  warningCount: number;
  blockedCount: number;
  overrideCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  requestedByUserId: string | null;
  failureReason: string | null;
  createdAt: string | null;
  sentAt: string | null;
  updatedAt: string | null;
}

export interface ListClientEmailCampaignsParams {
  page?: number;
  pageSize?: number;
  status?: ClientEmailCampaignStatus | 'all';
  createdAtFrom?: string;
  createdAtTo?: string;
}

export interface ListClientEmailCampaignsResult {
  items: ClientEmailCampaignListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ClientEmailCampaignTrackingSummary {
  deliveredCount: number;
  openedCount: number;
  proxyOpenedCount: number;
  clickedCount: number;
  hardBouncedCount: number;
  softBouncedCount: number;
  unsubscribedCount: number;
  complainedCount: number;
  lastEventAt: string | null;
}

export interface ClientEmailCampaignRecipientDetails {
  id: string;
  campaignId: string | null;
  clientId: string | null;
  name: string | null;
  clientName: string | null;
  email: string | null;
  status: ClientEmailCampaignRecipientStatus;
  sendStatus: ClientEmailCampaignRecipientStatus;
  eligibilityLevel: EmailEligibilityLevel | null;
  eligibilityReason: EmailEligibilityReason | null;
  skipReason: string | null;
  overrideUsed: boolean;
  overrideReason: string | null;
  overrideByUserId: string | null;
  overrideAt: string | null;
  failureReason: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  firstOpenedAt: string | null;
  lastOpenedAt: string | null;
  openCount: number;
  proxyOpenedAt: string | null;
  proxyOpenCount: number;
  firstClickedAt: string | null;
  lastClickedAt: string | null;
  clickCount: number;
  lastClickedUrl: string | null;
  bouncedAt: string | null;
  lastBounceType: ClientEmailCampaignBounceType | null;
  unsubscribedAt: string | null;
  complainedAt: string | null;
  lastEventAt: string | null;
  lastEventType: ClientEmailCampaignTrackingEventType | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ClientEmailCampaignRecipientEvent {
  id: string;
  campaignId: string | null;
  recipientId: string | null;
  clientId: string | null;
  source: ClientEmailCampaignEventSource;
  eventType: ClientEmailCampaignTrackingEventType;
  eventAt: string;
  linkUrl: string | null;
  reason: string | null;
  providerCampaignId: string | null;
  providerMessageId: string | null;
  createdAt: string | null;
}

export interface ClientEmailCampaignRecipientEvents {
  recipient: ClientEmailCampaignRecipientDetails;
  events: {
    items: ClientEmailCampaignRecipientEvent[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface ClientEmailCampaignDetails {
  campaign: ClientEmailCampaignListItem & {
    senderName: string | null;
    senderEmail: string | null;
    htmlContent: string | null;
    textContent: string | null;
    providerCampaignId: string | null;
    providerListId: string | null;
    updatedAt: string | null;
    lastEventAt: string | null;
  };
  trackingSummary: ClientEmailCampaignTrackingSummary;
  recipients: ClientEmailCampaignRecipientDetails[];
  totalRecipients: number;
  recipientsPage: number;
  recipientsPageSize: number;
}

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  previewed: 'تمت المعاينة',
  sending: 'جاري الإرسال',
  sent: 'تم الإرسال',
  partially_failed: 'فشل جزئي',
  failed: 'فشلت',
};

export const EMAIL_REASON_LABELS: Record<string, string> = {
  missing_email: 'لا يوجد بريد إلكتروني',
  invalid_format: 'صيغة البريد الإلكتروني غير صحيحة',
  duplicate_email: 'البريد الإلكتروني مكرر داخل نفس الحملة',
  unknown_status: 'حالة البريد غير معروفة',
  unverified_email: 'البريد غير موثّق',
  risky_email: 'البريد عليه درجة خطورة',
  suppressed: 'البريد موجود في قائمة منع الإرسال',
  bounced: 'البريد ارتد سابقًا',
  complained: 'تم تسجيل شكوى على هذا البريد سابقًا',
  unsubscribed: 'العميل ألغى الاشتراك',
  access_denied: 'لا تملك صلاحية على هذا العميل',
  provider_rejected: 'مزود الإرسال رفض البريد',
};

export const RECIPIENT_STATUS_LABELS: Record<string, string> = {
  pending: 'قيد التنفيذ',
  sent: 'تم الإرسال',
  failed: 'فشل',
  skipped: 'تم التخطي',
  blocked: 'ممنوع',
  warning_not_selected: 'تحذير غير محدد',
};

export const TRACKING_EVENT_LABELS: Record<ClientEmailCampaignTrackingEventType, string> = {
  delivered: 'تم التسليم',
  opened: 'فتح مؤكد',
  proxy_opened: 'فتح عبر Proxy',
  clicked: 'تم النقر',
  soft_bounced: 'ارتداد مؤقت',
  hard_bounced: 'ارتداد دائم',
  unsubscribed: 'إلغاء اشتراك',
  complained: 'شكوى',
};
