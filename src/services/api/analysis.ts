import { authFetch } from '../http/authFetch';
import { AuthApiError } from './auth';
import type {
  AnalysisSourcePlatform,
  AnalysisScreenshotCaptureStatus,
  AnalysisStatus,
  ClientAnalysis,
  ClientAnalysisScreenshot,
  ClientPlatformAnalysis,
  TeamAnalysisOverviewItem,
} from '../../types/analysis';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://maksab-backend-production.up.railway.app'}/api/v1/clients`;

const SUPPORTED_PLATFORMS: AnalysisSourcePlatform[] = [
  'website',
  'facebook',
  'instagram',
  'snapchat',
  'linkedin',
  'x',
  'tiktok',
];

const SUPPORTED_STATUSES: AnalysisStatus[] = ['pending', 'completed', 'failed'];
const SUPPORTED_CAPTURE_STATUSES: AnalysisScreenshotCaptureStatus[] = [
  'captured',
  'failed',
  'pending',
];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

const toNonEmptyString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const isLikelyHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const toPlatform = (value: unknown): AnalysisSourcePlatform => {
  if (typeof value === 'string' && (SUPPORTED_PLATFORMS as string[]).includes(value)) {
    return value as AnalysisSourcePlatform;
  }
  return 'website';
};

const toStatus = (value: unknown): AnalysisStatus => {
  if (typeof value === 'string' && (SUPPORTED_STATUSES as string[]).includes(value)) {
    return value as AnalysisStatus;
  }
  return 'completed';
};

const toCaptureStatus = (
  value: unknown,
  hasPublicUrl: boolean,
): AnalysisScreenshotCaptureStatus => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if ((SUPPORTED_CAPTURE_STATUSES as string[]).includes(normalized)) {
      return normalized as AnalysisScreenshotCaptureStatus;
    }

    if (['success', 'succeeded', 'completed', 'done', 'ok'].includes(normalized)) {
      return 'captured';
    }

    if (['error', 'rejected', 'capture_failed'].includes(normalized)) {
      return 'failed';
    }

    if (['processing', 'in_progress', 'queued', 'running'].includes(normalized)) {
      return 'pending';
    }
  }

  if (hasPublicUrl) {
    return 'captured';
  }

  return 'failed';
};

const toClientPlatformAnalysis = (raw: Record<string, unknown>): ClientPlatformAnalysis => ({
  id: String(raw.id ?? ''),
  platform: toPlatform(raw.platform),
  platformUrl: String(raw.platformUrl ?? ''),
  platformScore: Number(raw.platformScore ?? 0),
  summary: String(raw.summary ?? ''),
  strengths: asStringArray(raw.strengths),
  weaknesses: asStringArray(raw.weaknesses),
  recommendations: asStringArray(raw.recommendations),
});

const toClientAnalysisScreenshot = (
  raw: Record<string, unknown>,
): ClientAnalysisScreenshot => {
  const platformUrl =
    toNonEmptyString(
      raw.platformUrl ??
      raw.platform_url ??
      raw.sourceUrl ??
      raw.source_url ??
      raw.profileUrl ??
      raw.profile_url ??
      raw.link,
    ) ?? '';

  const urlCandidate = toNonEmptyString(raw.url);
  const rawPublicUrl =
    toNonEmptyString(raw.publicUrl) ??
    toNonEmptyString(raw.public_url) ??
    toNonEmptyString(raw.screenshotUrl) ??
    toNonEmptyString(raw.screenshot_url) ??
    toNonEmptyString(raw.imageUrl) ??
    toNonEmptyString(raw.image_url) ??
    toNonEmptyString(raw.storageUrl) ??
    toNonEmptyString(raw.storage_url) ??
    toNonEmptyString(raw.fileUrl) ??
    toNonEmptyString(raw.file_url) ??
    toNonEmptyString(raw.signedUrl) ??
    toNonEmptyString(raw.signed_url) ??
    toNonEmptyString(raw.cdnUrl) ??
    toNonEmptyString(raw.cdn_url) ??
    toNonEmptyString(raw.downloadUrl) ??
    toNonEmptyString(raw.download_url);

  const publicUrl =
    rawPublicUrl ??
    (urlCandidate &&
    isLikelyHttpUrl(urlCandidate) &&
    (!platformUrl || urlCandidate !== platformUrl)
      ? urlCandidate
      : null);

  return {
    platform: toPlatform(raw.platform ?? raw.sourcePlatform ?? raw.source_platform),
    platformUrl,
    supabasePath: toNonEmptyString(raw.supabasePath ?? raw.supabase_path),
    publicUrl,
    captureStatus: toCaptureStatus(
      raw.captureStatus ??
      raw.capture_status ??
      raw.screenshotStatus ??
      raw.screenshot_status ??
      raw.status,
      Boolean(publicUrl),
    ),
    capturedAt: toNonEmptyString(
      raw.capturedAt ??
      raw.captured_at ??
      raw.takenAt ??
      raw.taken_at ??
      raw.createdAt ??
      raw.created_at,
    ),
  };
};

const toClientAnalysis = (raw: Record<string, unknown>): ClientAnalysis => {
  const platformAnalysesRaw = Array.isArray(raw.platformAnalyses)
    ? raw.platformAnalyses.filter(isObject)
    : [];
  const screenshotsRaw = pickDataArray(
    raw.screenshots ??
    raw.platformScreenshots ??
    raw.platform_screenshots ??
    raw.screenshotCaptures ??
    raw.screenshot_captures ??
    raw.captures,
  );
  const nestedScreenshotsRaw = platformAnalysesRaw.flatMap((platformAnalysis) => {
    const fromArray = pickDataArray(
      platformAnalysis.screenshots ??
      platformAnalysis.platformScreenshots ??
      platformAnalysis.screenshotCaptures ??
      platformAnalysis.screenshot_captures,
    );
    if (fromArray.length > 0) {
      return fromArray;
    }

    if (isObject(platformAnalysis.screenshot)) {
      return [platformAnalysis.screenshot];
    }

    // Fallback: build a screenshot-like record from platform analysis itself when
    // backend embeds screenshot fields there.
    if (
      platformAnalysis.screenshotUrl ||
      platformAnalysis.screenshot_url ||
      platformAnalysis.imageUrl ||
      platformAnalysis.image_url ||
      platformAnalysis.captureStatus ||
      platformAnalysis.capture_status
    ) {
      return [platformAnalysis];
    }

    return [];
  });
  const allScreenshotsRaw =
    screenshotsRaw.length > 0 ? screenshotsRaw : nestedScreenshotsRaw;

  return {
    id: String(raw.id ?? ''),
    clientId: String(raw.clientId ?? ''),
    ownerUserId: String(raw.ownerUserId ?? ''),
    status: toStatus(raw.status),
    summary: String(raw.summary ?? ''),
    overallScore: Number(raw.overallScore ?? 0),
    strengths: asStringArray(raw.strengths),
    weaknesses: asStringArray(raw.weaknesses),
    recommendations: asStringArray(raw.recommendations),
    analyzedAt: String(raw.analyzedAt ?? ''),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    platformAnalyses: platformAnalysesRaw.map(toClientPlatformAnalysis),
    screenshots: allScreenshotsRaw.map(toClientAnalysisScreenshot),
  };
};

const toTeamOverviewItem = (raw: Record<string, unknown>): TeamAnalysisOverviewItem => ({
  clientId: String(raw.clientId ?? raw.id ?? raw.client_id ?? ''),
  clientName: String(raw.clientName ?? raw.name ?? raw.client_name ?? ''),
  ownerUserId: String(raw.ownerUserId ?? raw.employeeId ?? raw.owner_user_id ?? ''),
  ownerName: String(raw.ownerName ?? raw.employeeName ?? raw.owner_name ?? ''),
  overallScore:
    raw.overallScore === null ||
    raw.overallScore === undefined ||
    raw.score === null ||
    raw.score === undefined
      ? null
      : Number(raw.overallScore ?? raw.score),
  analyzedAt:
    raw.analyzedAt === null ||
    raw.analyzedAt === undefined ||
    raw.lastAnalyzedAt === null ||
    raw.lastAnalyzedAt === undefined
      ? null
      : String(raw.analyzedAt ?? raw.lastAnalyzedAt),
  hasAnalysis:
    typeof raw.hasAnalysis === 'boolean'
      ? raw.hasAnalysis
      : Boolean(raw.overallScore ?? raw.score ?? raw.analyzedAt ?? raw.lastAnalyzedAt),
});

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

  const candidateKeys = ['items', 'rows', 'results', 'overview', 'teamOverview'] as const;

  for (const key of candidateKeys) {
    const candidate = value[key];
    if (Array.isArray(candidate)) {
      return candidate.filter(isObject);
    }
  }

  if (isObject(value.data)) {
    for (const key of candidateKeys) {
      const candidate = value.data[key];
      if (Array.isArray(candidate)) {
        return candidate.filter(isObject);
      }
    }
  }

  if (Array.isArray(value.data)) {
    return value.data.filter(isObject);
  }

  return [];
};

export const runClientAnalysis = async (clientId: string) => {
  const response = await authFetch<{ data: Record<string, unknown> }>(
    `${BASE_URL}/${clientId}/analysis`,
    { method: 'POST', body: JSON.stringify({}) },
  );

  const data = pickDataObject(response);
  const analysisRaw = isObject(data.analysis) ? data.analysis : data;

  return { data: toClientAnalysis(analysisRaw) };
};

export const getClientAnalysis = async (clientId: string) => {
  try {
    const response = await authFetch<{ data: Record<string, unknown> | null }>(
      `${BASE_URL}/${clientId}/analysis`,
    );
    if (!response.data) {
      return { data: null };
    }
    const data = pickDataObject(response);
    const analysisRaw = isObject(data.analysis) ? data.analysis : data;

    return { data: toClientAnalysis(analysisRaw) };
  } catch (error) {
    if (error instanceof AuthApiError && error.httpStatus === 404) {
      return { data: null };
    }
    throw error;
  }
};

export const deleteClientAnalysis = async (clientId: string) => {
  await authFetch<void>(`${BASE_URL}/${clientId}/analysis`, {
    method: 'DELETE',
  });
};

export const getTeamAnalysisOverview = async () => {
  const response = await authFetch<unknown>(
    `${BASE_URL}/analysis/overview/team`,
  );

  const items = pickDataArray(response).map(toTeamOverviewItem);

  return { data: items };
};
