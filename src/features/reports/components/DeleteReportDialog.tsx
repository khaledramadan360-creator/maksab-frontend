interface DeleteReportDialogProps {
  reportTitle: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteReportDialog = ({
  reportTitle,
  isLoading = false,
  onCancel,
  onConfirm,
}: DeleteReportDialogProps) => {
  return (
    <div className="reports-modal-overlay" onClick={onCancel}>
      <div className="reports-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>حذف التقرير</h3>
        <p>
          هل أنت متأكد من حذف التقرير الخاص بـ <strong>{reportTitle}</strong>؟
        </p>
        <p className="reports-modal-warning">لا يمكن التراجع عن هذا الإجراء بعد التأكيد.</p>

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
            className="clients-btn clients-btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'جارٍ الحذف...' : 'تأكيد الحذف'}
          </button>
        </div>
      </div>
    </div>
  );
};
