import { useMemo, useState } from 'react';
import type { AnalysisSourcePlatform } from '../../../types/analysis';
import type { ClientPlatformLinks } from '../../../types/clients';
import { AnalysisEmptyState } from './AnalysisEmptyState';
import { AnalysisErrorState } from './AnalysisErrorState';
import { AnalysisLoadingState } from './AnalysisLoadingState';
import { AnalysisRecommendationsList } from './AnalysisRecommendationsList';
import { AnalysisStrengthsList } from './AnalysisStrengthsList';
import { AnalysisSummaryCard } from './AnalysisSummaryCard';
import { AnalysisWeaknessesList } from './AnalysisWeaknessesList';
import { AnalysisScreenshotsSection } from './AnalysisScreenshotsSection';
import { PlatformAnalysisCard } from './PlatformAnalysisCard';
import { RunAnalysisModal } from './RunAnalysisModal';
import { useClientAnalysis } from '../hooks/useClientAnalysis';
import { useRunClientAnalysis } from '../hooks/useRunClientAnalysis';
import '../styles/analysis.css';

interface ClientAnalysisSectionProps {
  clientId: string;
  clientName: string;
  clientPlatformLinks?: ClientPlatformLinks;
  isReadOnly?: boolean;
  canRunAnalysis?: boolean;
  onToast?: (message: string, type: 'success' | 'error') => void;
}

const SUPPORTED_PLATFORMS: AnalysisSourcePlatform[] = [
  'website',
  'facebook',
  'instagram',
  'snapchat',
  'linkedin',
  'x',
  'tiktok',
];

const getSavedPlatforms = (
  links?: ClientPlatformLinks,
): AnalysisSourcePlatform[] => {
  if (!links) return [];

  return SUPPORTED_PLATFORMS.filter((platform) => {
    const value = links[platform];
    return typeof value === 'string' && value.trim().length > 0;
  });
};

export const ClientAnalysisSection = ({
  clientId,
  clientName,
  clientPlatformLinks,
  isReadOnly = false,
  canRunAnalysis = true,
  onToast,
}: ClientAnalysisSectionProps) => {
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const savedPlatforms = useMemo(
    () => getSavedPlatforms(clientPlatformLinks),
    [clientPlatformLinks],
  );

  const {
    analysis,
    loadState,
    errorMessage,
    refetch,
  } = useClientAnalysis({
    clientId,
    isPreviewMode: isReadOnly,
    previewLinks: clientPlatformLinks,
  });

  const {
    run,
    isRunning,
    errorMessage: runErrorMessage,
    clearError,
  } = useRunClientAnalysis();

  const handleOpenModal = () => {
    clearError();
    setIsRunModalOpen(true);
  };

  const handleRunAnalysis = async () => {
    if (isReadOnly || !canRunAnalysis || !clientId) return;

    const result = await run(clientId);
    if (!result.ok) {
      onToast?.(result.message, 'error');
      return;
    }

    setIsRunModalOpen(false);
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    onToast?.('Client analysis completed successfully.', 'success');
  };

  const isBusy = isRunning || isRefreshing;
  const hasAnalysis = Boolean(analysis);
  const analysisActionLabel = hasAnalysis ? 'Re-run analysis' : 'Run analysis';

  return (
    <section className="clients-card analysis-section">
      <header className="analysis-section-header">
        <div>
          <h3 className="analysis-title">تحليل العميل</h3>
          <p className="analysis-subtitle">
            {isReadOnly
              ? 'Preview mode: no real analysis data'
              : 'Run and review client analysis across saved platforms.'}
          </p>
        </div>

        <button
          type="button"
          className="clients-btn clients-btn-primary"
          onClick={handleOpenModal}
          disabled={isReadOnly || !canRunAnalysis || isBusy || loadState === 'loading'}
          title={
            isReadOnly
              ? 'Read-only preview mode'
              : !canRunAnalysis
                ? 'You do not have permission to run analysis for this client'
                : ''
          }
        >
          {analysisActionLabel}
        </button>
      </header>

      {isBusy && (
        <div className="analysis-inline-loading">
          Refreshing analysis results...
        </div>
      )}

      {(loadState === 'loading' || isRefreshing) && <AnalysisLoadingState />}

      {loadState === 'error' && (
        <AnalysisErrorState
          message={errorMessage}
          onRetry={refetch}
          disabled={isReadOnly || isBusy}
        />
      )}

      {loadState === 'ok' && !analysis && (
        <AnalysisEmptyState
          onRun={handleOpenModal}
          disabled={isReadOnly || !canRunAnalysis || isBusy}
        />
      )}

      {loadState === 'ok' && analysis && (
        <div className="analysis-content">
          <AnalysisSummaryCard analysis={analysis} />

          <div className="analysis-main-lists">
            <AnalysisStrengthsList strengths={analysis.strengths} />
            <AnalysisWeaknessesList weaknesses={analysis.weaknesses} />
            <AnalysisRecommendationsList
              recommendations={analysis.recommendations}
            />
          </div>

          <AnalysisScreenshotsSection
            screenshots={analysis.screenshots}
            isPreviewMode={isReadOnly}
          />

          <div className="analysis-platform-grid">
            {analysis.platformAnalyses.map((platformAnalysis) => (
              <PlatformAnalysisCard
                key={platformAnalysis.id}
                platformAnalysis={platformAnalysis}
              />
            ))}
          </div>
        </div>
      )}

      {runErrorMessage && loadState !== 'error' && (
        <AnalysisErrorState message={runErrorMessage} />
      )}

      {isRunModalOpen && (
        <RunAnalysisModal
          clientName={clientName}
          platforms={savedPlatforms}
          isRerun={hasAnalysis}
          isLoading={isBusy}
          isReadOnly={isReadOnly}
          onCancel={() => setIsRunModalOpen(false)}
          onConfirm={handleRunAnalysis}
        />
      )}
    </section>
  );
};
