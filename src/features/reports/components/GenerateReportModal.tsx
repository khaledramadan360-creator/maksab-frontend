interface GenerateReportModalProps {
  clientName: string;
  isRegenerate?: boolean;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const GenerateReportModal = ({
  clientName,
  isRegenerate = false,
  isLoading = false,
  isReadOnly = false,
  onCancel,
  onConfirm,
}: GenerateReportModalProps) => {
  return (
    <div className="reports-modal-overlay" onClick={onCancel}>
      <div className="reports-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>{isRegenerate ? 'إعادة توليد التقرير' : 'إنشاء تقرير جديد'}</h3>
        <p>
          {isRegenerate
            ? `سيتم إعادة توليد التقرير للعميل ${clientName}.`
            : `سيتم إنشاء تقرير جديد للعميل ${clientName}.`}
        </p>

        {isRegenerate && (
          <p className="reports-modal-warning">
            التقرير الحالي سيتم استبداله بالإصدار الجديد.
          </p>
        )}

        {isReadOnly && (
          <p className="reports-modal-warning">
            وضع مشاهدة فقط: لا يمكنك إنشاء أو إعادة توليد التقرير.
          </p>
        )}

        <div className="reports-modal-actions">
          <button
            type="button"
            className="clients-btn clients-btn-ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="button"
            className="clients-btn clients-btn-primary"
            onClick={onConfirm}
            disabled={isLoading || isReadOnly}
          >
            {isLoading
              ? 'جارٍ التنفيذ...'
              : isRegenerate
                ? 'تأكيد إعادة التوليد'
                : 'تأكيد الإنشاء'}
          </button>
        </div>
      </div>
    </div>
  );
};
