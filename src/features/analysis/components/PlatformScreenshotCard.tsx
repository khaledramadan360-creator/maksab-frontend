import { useMemo, useState } from 'react';
import type { ClientAnalysisScreenshot } from '../../../types/analysis';

const PLATFORM_LABELS: Record<ClientAnalysisScreenshot['platform'], string> = {
  website: 'Website',
  facebook: 'Facebook',
  instagram: 'Instagram',
  snapchat: 'Snapchat',
  linkedin: 'LinkedIn',
  x: 'X',
  tiktok: 'TikTok',
};

interface PlatformScreenshotCardProps {
  screenshot: ClientAnalysisScreenshot;
  isPreviewMode?: boolean;
}

const getStatusLabel = (
  captureStatus: ClientAnalysisScreenshot['captureStatus'],
): string => {
  if (captureStatus === 'captured') return 'تم الالتقاط';
  if (captureStatus === 'failed') return 'فشل الالتقاط';
  return 'قيد الالتقاط';
};

const getFallbackMessage = (
  captureStatus: ClientAnalysisScreenshot['captureStatus'],
  isPreviewMode: boolean,
): string => {
  if (isPreviewMode) return 'وضع مشاهدة فقط';
  if (captureStatus === 'failed') return 'تعذر التقاط الصورة';
  if (captureStatus === 'pending') return 'جاري التقاط الصورة...';
  return 'لا توجد صورة متاحة';
};

export const PlatformScreenshotCard = ({
  screenshot,
  isPreviewMode = false,
}: PlatformScreenshotCardProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  const canRenderImage = useMemo(() => {
    if (isPreviewMode) return false;
    if (imageFailed) return false;
    if (screenshot.captureStatus !== 'captured') return false;
    return Boolean(screenshot.publicUrl);
  }, [imageFailed, isPreviewMode, screenshot.captureStatus, screenshot.publicUrl]);

  const capturedAtLabel = screenshot.capturedAt
    ? new Date(screenshot.capturedAt).toLocaleString('ar-EG')
    : 'غير متوفر';

  return (
    <article className="analysis-screenshot-card">
      <header className="analysis-screenshot-head">
        <h4>{PLATFORM_LABELS[screenshot.platform]}</h4>
        <span
          className={`analysis-screenshot-status analysis-screenshot-status--${screenshot.captureStatus}`}
        >
          {getStatusLabel(screenshot.captureStatus)}
        </span>
      </header>

      <div className="analysis-screenshot-media">
        {canRenderImage && screenshot.publicUrl ? (
          <img
            src={screenshot.publicUrl}
            alt={`لقطة منصة ${PLATFORM_LABELS[screenshot.platform]}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : screenshot.captureStatus === 'pending' && !isPreviewMode ? (
          <div className="analysis-screenshot-skeleton-wrap" aria-hidden="true">
            <div className="analysis-screenshot-skeleton" />
            <p className="analysis-screenshot-skeleton-text">جاري التقاط الصورة...</p>
          </div>
        ) : (
          <div className="analysis-screenshot-placeholder">
            <span>{getFallbackMessage(screenshot.captureStatus, isPreviewMode)}</span>
          </div>
        )}
      </div>

      <div className="analysis-screenshot-meta">
        <p className="analysis-screenshot-url" dir="ltr">
          {screenshot.platformUrl || '-'}
        </p>
        <p className="analysis-screenshot-time">وقت الالتقاط: {capturedAtLabel}</p>
      </div>
    </article>
  );
};
