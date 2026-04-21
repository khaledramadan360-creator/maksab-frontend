export type AnalysisStatus = 'pending' | 'completed' | 'failed';

export type AnalysisSourcePlatform =
  | 'website'
  | 'facebook'
  | 'instagram'
  | 'snapchat'
  | 'linkedin'
  | 'x'
  | 'tiktok';

export interface ClientPlatformAnalysis {
  id: string;
  platform: AnalysisSourcePlatform;
  platformUrl: string;
  platformScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export type AnalysisScreenshotCaptureStatus = 'captured' | 'failed' | 'pending';

export interface ClientAnalysisScreenshot {
  platform: AnalysisSourcePlatform;
  platformUrl: string;
  supabasePath: string | null;
  publicUrl: string | null;
  captureStatus: AnalysisScreenshotCaptureStatus;
  capturedAt: string | null;
}

export interface ClientAnalysis {
  id: string;
  clientId: string;
  ownerUserId: string;
  status: AnalysisStatus;
  summary: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  analyzedAt: string;
  createdAt: string;
  updatedAt: string;
  platformAnalyses: ClientPlatformAnalysis[];
  screenshots: ClientAnalysisScreenshot[];
}

export interface RunClientAnalysisResponse {
  data: ClientAnalysis;
}

export interface TeamAnalysisOverviewItem {
  clientId: string;
  clientName: string;
  ownerUserId: string;
  ownerName: string;
  overallScore: number | null;
  analyzedAt: string | null;
  hasAnalysis: boolean;
}
