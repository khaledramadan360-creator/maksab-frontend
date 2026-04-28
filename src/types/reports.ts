export type ReportStatus = 'generating' | 'ready' | 'failed';
export type LegacyReportStatus = 'pending' | 'completed';
export type AnyReportStatus = ReportStatus | LegacyReportStatus;

export type ReportFormat = 'pdf' | 'html';
export type ReportRecipientSource = 'whatsapp' | 'mobile' | 'custom';

export interface ReportClientSnapshot {
  id: string;
  name: string;
  saudiCity: string | null;
}

export interface ReportPlatformScore {
  platform: string;
  score: number | null;
}

export interface ReportScreenshot {
  platform: string;
  platformUrl: string | null;
  publicUrl: string | null;
  captureStatus: 'pending' | 'captured' | 'failed' | string;
  capturedAt: string | null;
}

export interface ReportPreviewPayload {
  overallScore: number | null;
  analysisSummary: string | null;
  analyzedAt: string | null;
  platformScores: ReportPlatformScore[];
  screenshots: ReportScreenshot[];
}

export interface ClientReport {
  id: string;
  clientId: string;
  analysisId: string | null;
  ownerUserId: string | null;
  ownerName: string | null;
  status: AnyReportStatus;
  format: ReportFormat;
  title: string;
  htmlContent: string;
  pdfUrl: string | null;
  pdfStoragePath: string | null;
  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  client: ReportClientSnapshot | null;
  preview: ReportPreviewPayload | null;
}

export interface ReportsListItem {
  id: string;
  clientId: string;
  clientName: string;
  ownerUserId: string | null;
  ownerName: string | null;
  status: AnyReportStatus;
  format: ReportFormat;
  pdfUrl: string | null;
  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateClientReportResponse {
  data: ClientReport;
}

export interface SendReportToWhatChimpRequest {
  recipientPhone: string;
  recipientSource?: ReportRecipientSource;
  recipientName?: string;
  messageText?: string;
}

export interface SendReportToWhatChimpAttempt {
  success: boolean;
  status: string;
  attemptId: string | null;
  reportId: string | null;
  clientId: string | null;
  recipientPhone: string;
  recipientSource: ReportRecipientSource;
  provider: string;
  providerMessageId: string | null;
  providerStatusCode: string | null;
  failureReason: string | null;
  createdAt: string | null;
}

export interface SendReportToWhatChimpResponse {
  success: boolean;
  message: string;
  data: SendReportToWhatChimpAttempt;
}
