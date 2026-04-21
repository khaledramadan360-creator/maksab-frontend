interface AnalysisErrorStateProps {
  message: string;
  onRetry?: () => void;
  disabled?: boolean;
}

export const AnalysisErrorState = ({
  message,
  onRetry,
  disabled = false,
}: AnalysisErrorStateProps) => {
  return (
    <div className="analysis-state analysis-error">
      <p>{message || 'تعذر تحميل بيانات التحليل.'}</p>
      {onRetry && (
        <button
          type="button"
          className="clients-btn clients-btn-primary"
          onClick={onRetry}
          disabled={disabled}
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
};
