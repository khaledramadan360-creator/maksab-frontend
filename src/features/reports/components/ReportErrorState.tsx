interface ReportErrorStateProps {
  message: string;
  onRetry?: () => void;
  disabled?: boolean;
}

export const ReportErrorState = ({
  message,
  onRetry,
  disabled = false,
}: ReportErrorStateProps) => {
  return (
    <div className="reports-state reports-error">
      <p>{message || 'تعذر تحميل التقرير.'}</p>
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
