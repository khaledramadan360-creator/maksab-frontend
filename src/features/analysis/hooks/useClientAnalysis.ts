import { useCallback, useEffect, useState } from 'react';
import type { ClientPlatformLinks } from '../../../types/clients';
import type { ClientAnalysis, ClientAnalysisScreenshot } from '../../../types/analysis';
import { getClientAnalysis } from '../../../services/api/analysis';
import { AuthApiError } from '../../../services/api/auth';

type LoadState = 'loading' | 'ok' | 'error';

interface UseClientAnalysisOptions {
  clientId?: string;
  isPreviewMode?: boolean;
  previewLinks?: ClientPlatformLinks;
}

const toPreviewPlatformAnalyses = (links?: ClientPlatformLinks) => {
  if (!links) return [];

  const entries = Object.entries(links).filter(
    ([, url]) => typeof url === 'string' && url.trim().length > 0,
  );

  if (entries.length === 0) {
    return [
      {
        id: 'preview-platform-website',
        platform: 'website' as const,
        platformUrl: 'https://preview.example.com',
        platformScore: 76,
        summary: 'Preview summary for platform analysis',
        strengths: ['Clear value proposition'],
        weaknesses: ['Missing conversion hooks'],
        recommendations: ['Add explicit contact CTA above the fold'],
      },
    ];
  }

  return entries.map(([platform, url], index) => ({
    id: `preview-platform-${platform}-${index}`,
    platform: platform as
      | 'website'
      | 'facebook'
      | 'instagram'
      | 'snapchat'
      | 'linkedin'
      | 'x'
      | 'tiktok',
    platformUrl: String(url),
    platformScore: 70 + (index % 3) * 7,
    summary: 'Preview summary for platform analysis',
    strengths: ['Strong profile consistency'],
    weaknesses: ['Content cadence can improve'],
    recommendations: ['Increase posting frequency with clearer offers'],
  }));
};

const toPreviewScreenshots = (
  links?: ClientPlatformLinks,
): ClientAnalysisScreenshot[] => {
  if (!links) {
    return [
      {
        platform: 'website',
        platformUrl: 'https://preview.example.com',
        supabasePath: null,
        publicUrl: null,
        captureStatus: 'pending',
        capturedAt: null,
      },
      {
        platform: 'instagram',
        platformUrl: 'https://instagram.com/preview-account',
        supabasePath: null,
        publicUrl: null,
        captureStatus: 'failed',
        capturedAt: null,
      },
    ];
  }

  const entries = Object.entries(links).filter(
    ([, url]) => typeof url === 'string' && url.trim().length > 0,
  );

  if (entries.length === 0) {
    return [
      {
        platform: 'website',
        platformUrl: 'https://preview.example.com',
        supabasePath: null,
        publicUrl: null,
        captureStatus: 'pending',
        capturedAt: null,
      },
    ];
  }

  return entries.map(([platform, url], index) => ({
    platform: platform as
      | 'website'
      | 'facebook'
      | 'instagram'
      | 'snapchat'
      | 'linkedin'
      | 'x'
      | 'tiktok',
    platformUrl: String(url),
    supabasePath: null,
    publicUrl: null,
    captureStatus: index % 2 === 0 ? 'pending' : 'failed',
    capturedAt: null,
  }));
};

const buildPreviewAnalysis = (
  clientId: string,
  links?: ClientPlatformLinks,
): ClientAnalysis => ({
  id: `preview-analysis-${clientId}`,
  clientId,
  ownerUserId: 'preview-owner',
  status: 'completed',
  summary: 'Preview analysis for UI-only viewer mode.',
  overallScore: 78,
  strengths: ['Consistent brand voice', 'Good category alignment'],
  weaknesses: ['Limited CTA clarity', 'Uneven content freshness'],
  recommendations: [
    'Strengthen CTA language across channels',
    'Publish content on a fixed weekly cadence',
  ],
  analyzedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  platformAnalyses: toPreviewPlatformAnalyses(links),
  screenshots: toPreviewScreenshots(links),
});

export const useClientAnalysis = ({
  clientId,
  isPreviewMode = false,
  previewLinks,
}: UseClientAnalysisOptions) => {
  const [analysis, setAnalysis] = useState<ClientAnalysis | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    if (!clientId) {
      setAnalysis(null);
      setLoadState('error');
      setErrorMessage('Client id is missing');
      return;
    }

    if (isPreviewMode) {
      setAnalysis(buildPreviewAnalysis(clientId, previewLinks));
      setLoadState('ok');
      setErrorMessage('');
      return;
    }

    setLoadState('loading');
    setErrorMessage('');

    try {
      const response = await getClientAnalysis(clientId);
      setAnalysis(response.data);
      setLoadState('ok');
    } catch (error) {
      setAnalysis(null);
      setLoadState('error');
      setErrorMessage(
        error instanceof AuthApiError
          ? error.message
          : 'Unable to load client analysis',
      );
    }
  }, [clientId, isPreviewMode, previewLinks]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    analysis,
    loadState,
    errorMessage,
    refetch: load,
    setAnalysis,
  };
};
