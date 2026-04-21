interface DeleteClientDialogProps {
  clientName: string;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteClientDialog = ({
  clientName,
  isLoading = false,
  isReadOnly = false,
  onCancel,
  onConfirm,
}: DeleteClientDialogProps) => {
  return (
    <div className="clients-modal-overlay" onClick={onCancel}>
      <div className="clients-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="clients-section-title">حذف العميل</h3>
        <p className="clients-muted" style={{ marginBottom: '1rem' }}>
          هل أنت متأكد من حذف العميل <strong>{clientName}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="clients-form-actions">
          <button type="button" className="clients-btn clients-btn-ghost" onClick={onCancel} disabled={isLoading}>
            إلغاء
          </button>
          <button
            type="button"
            className="clients-btn clients-btn-danger"
            onClick={onConfirm}
            disabled={isLoading || isReadOnly}
            title={isReadOnly ? 'وضع مشاهدة فقط' : ''}
          >
            {isLoading ? 'جاري الحذف...' : 'تأكيد الحذف'}
          </button>
        </div>
      </div>
    </div>
  );
};
