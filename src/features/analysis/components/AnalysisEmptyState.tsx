interface AnalysisEmptyStateProps {
  onRun: () => void;
  disabled?: boolean;
}

export const AnalysisEmptyState = ({
  onRun,
  disabled = false,
}: AnalysisEmptyStateProps) => {
  return (
    <div className="analysis-state analysis-empty">
      <p>No analysis has been generated for this client yet.</p>
      <button
        type="button"
        className="clients-btn clients-btn-primary"
        onClick={onRun}
        disabled={disabled}
        title={disabled ? 'Read-only preview mode' : ''}
      >
        Run analysis
      </button>
    </div>
  );
};
