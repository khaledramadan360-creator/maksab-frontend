import React from 'react';

interface ActivateMarketingSeasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  seasonTitle: string;
  isActivating: boolean;
  error: string | null;
}

export const ActivateMarketingSeasonDialog: React.FC<ActivateMarketingSeasonDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  seasonTitle,
  isActivating,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="ms-modal-overlay">
      <div className="ms-modal-content">
        <div className="ms-modal-header">
          <h3>تأكيد تفعيل الموسم 🚀</h3>
          <button className="ms-modal-close" onClick={onClose} disabled={isActivating}>&times;</button>
        </div>
        
        <div className="ms-modal-body">
          {error && <div className="ms-alert ms-alert-error">⚠️ {error}</div>}
          
          <div className="ms-alert ms-alert-warning">
            <p style={{ margin: 0 }}>
              <strong>تحذير:</strong> التفعيل سيُلغي تنشيط أي موسم تسويقي آخر نشط حالياً.
            </p>
          </div>
          
          <p style={{ marginTop: '1rem', color: 'var(--color-text-body)' }}>
            هل أنت متأكد من رغبتك في تفعيل موسم <strong>{seasonTitle}</strong> ليكون الموسم النشط؟
          </p>
        </div>
        
        <div className="ms-modal-footer">
          <button className="ms-btn ms-btn-secondary" onClick={onClose} disabled={isActivating}>
            إلغاء ✖️
          </button>
          <button className="ms-btn ms-btn-primary" onClick={onConfirm} disabled={isActivating}>
            {isActivating ? 'جاري التفعيل ⏳...' : 'نعم، قم بالتفعيل ✅'}
          </button>
        </div>
      </div>
    </div>
  );
};
