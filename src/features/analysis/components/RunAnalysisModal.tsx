import type { AnalysisSourcePlatform } from '../../../types/analysis';

const PLATFORM_LABELS: Record<AnalysisSourcePlatform, string> = {
  website: 'Website',
  facebook: 'Facebook',
  instagram: 'Instagram',
  snapchat: 'Snapchat',
  linkedin: 'LinkedIn',
  x: 'X',
  tiktok: 'TikTok',
};

interface RunAnalysisModalProps {
  clientName: string;
  platforms: AnalysisSourcePlatform[];
  isRerun: boolean;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const RunAnalysisModal = ({
  clientName,
  platforms,
  isRerun,
  isLoading = false,
  isReadOnly = false,
  onCancel,
  onConfirm,
}: RunAnalysisModalProps) => {
  return (
    <div className="analysis-modal-overlay" onClick={onCancel}>
      <div className="analysis-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>{isRerun ? 'Re-run Client Analysis' : 'Run Client Analysis'}</h3>

        <p>
          Client: <strong>{clientName}</strong>
        </p>

        <div className="analysis-modal-platforms">
          <span>Platforms to analyze automatically:</span>
          {platforms.length === 0 ? (
            <p>No valid saved links found.</p>
          ) : (
            <ul>
              {platforms.map((platform) => (
                <li key={platform}>{PLATFORM_LABELS[platform]}</li>
              ))}
            </ul>
          )}
        </div>

        <p className="analysis-modal-warning">
          Existing analysis will be replaced if it already exists.
        </p>

        <div className="analysis-modal-actions">
          <button
            type="button"
            className="clients-btn clients-btn-ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="clients-btn clients-btn-primary"
            onClick={onConfirm}
            disabled={isLoading || isReadOnly || platforms.length === 0}
            title={isReadOnly ? 'Read-only preview mode' : ''}
          >
            {isLoading ? 'Running...' : 'Start analysis'}
          </button>
        </div>
      </div>
    </div>
  );
};
