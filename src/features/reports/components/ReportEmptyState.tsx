interface ReportEmptyStateProps {
  disabled?: boolean;
  isReadOnly?: boolean;
  message?: string;
  actionLabel?: string;
  onGenerate?: () => void;
}

export const ReportEmptyState = ({
  disabled = false,
  isReadOnly = false,
  message,
  actionLabel,
  onGenerate,
}: ReportEmptyStateProps) => {
  return (
    <div className="reports-state reports-empty">
      <p>
        {message ??
          (isReadOnly
            ? 'وضع مشاهدة فقط: لا تتوفر بيانات تقرير حقيقية.'
            : 'لا يوجد تقرير لهذا العميل حتى الآن.')}
      </p>

      {!isReadOnly && onGenerate && (
        <button
          type="button"
          className="clients-btn clients-btn-primary"
          disabled={disabled}
          onClick={onGenerate}
        >
          {actionLabel ?? 'إنشاء تقرير'}
        </button>
      )}
    </div>
  );
};
