interface ClientEmailCampaignConfirmSendModalProps {
  sendableCount: number;
  selectedWarningCount: number;
  skippedCount: number;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ClientEmailCampaignConfirmSendModal = ({
  sendableCount,
  selectedWarningCount,
  skippedCount,
  isLoading = false,
  onCancel,
  onConfirm,
}: ClientEmailCampaignConfirmSendModalProps) => {
  return (
    <div className="clients-modal-overlay" onClick={onCancel}>
      <div className="clients-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3 className="clients-section-title">تأكيد إرسال الحملة</h3>
        <p className="clients-muted">
          سيتم إرسال الحملة إلى:
        </p>
        <ul className="client-email-campaign-confirm-list">
          <li>{sendableCount} عميل صالح للإرسال</li>
          <li>{selectedWarningCount} عميل تم اختياره رغم التحذير</li>
          <li>{skippedCount} عميل لن يتم الإرسال لهم</li>
        </ul>

        {selectedWarningCount > 0 && (
          <div className="clients-inline-warning">
            تم اختيار إرسال الحملة لبعض العملاء الذين عليهم تحذيرات.
          </div>
        )}

        <div className="clients-form-actions">
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
            disabled={isLoading}
          >
            {isLoading ? 'جاري إرسال الحملة...' : 'تأكيد الإرسال'}
          </button>
        </div>
      </div>
    </div>
  );
};
