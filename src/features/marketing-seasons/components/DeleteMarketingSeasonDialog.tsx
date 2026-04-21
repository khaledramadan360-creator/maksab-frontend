import React from 'react';

interface DeleteMarketingSeasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  seasonTitle: string;
  isDeleting: boolean;
  error: string | null;
}

export const DeleteMarketingSeasonDialog: React.FC<DeleteMarketingSeasonDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  seasonTitle,
  isDeleting,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="ms-modal-overlay">
      <div className="ms-modal-content">
        <div className="ms-modal-header">
          <h3 style={{ color: 'var(--color-error)' }}>تأكيد الحذف 🗑️</h3>
          <button className="ms-modal-close" onClick={onClose} disabled={isDeleting}>&times;</button>
        </div>
        
        <div className="ms-modal-body">
          {error && <div className="ms-alert ms-alert-error">⚠️ {error}</div>}
          
          <p style={{ margin: 0, color: 'var(--color-text-body)' }}>
            هل أنت متأكد من رغبتك في حذف الموسم التسويقي <strong>{seasonTitle}</strong> بشكل نهائي؟
            لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>
        
        <div className="ms-modal-footer">
          <button className="ms-btn ms-btn-secondary" onClick={onClose} disabled={isDeleting}>
            إلغاء ✖️
          </button>
          <button className="ms-btn ms-btn-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'جاري الحذف ⏳...' : 'نعم، احذف 💥'}
          </button>
        </div>
      </div>
    </div>
  );
};
