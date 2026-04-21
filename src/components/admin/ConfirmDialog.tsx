interface ConfirmDialogProps {
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  title,
  body,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  isDanger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <div className="admin-modal-overlay" onClick={onCancel}>
    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
      <h2 className="admin-modal-title">{title}</h2>
      <p className="admin-modal-body">{body}</p>
      <div className="admin-modal-footer">
        <button
          className="admin-btn admin-btn-ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelLabel}
        </button>
        <button
          className={`admin-btn ${isDanger ? 'admin-btn-danger' : 'admin-btn-primary'}`}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'جاري التنفيذ...' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);
