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
  status: ClientEmailCampaignStatus;
  totalSelected: number;
  sendableCount: number;
  warningCount: number;
  blockedCount: number;
  overrideCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  createdAt: string | null;
  sentAt: string | null;
  createdByUserId: string | null;
  createdByName: string | null;
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

export interface ClientEmailCampaignRecipientDetails {
  id: string;
  clientId: string | null;
  clientName: string | null;
  email: string | null;
  sendStatus: ClientEmailCampaignRecipientStatus;
  eligibilityLevel: EmailEligibilityLevel | null;
  eligibilityReason: EmailEligibilityReason | null;
  overrideUsed: boolean;
  overrideReason: string | null;
  failureReason: string | null;
  sentAt: string | null;
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
  };
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
