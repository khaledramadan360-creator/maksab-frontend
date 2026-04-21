import { useEffect, useState } from 'react';
import type { ClientStatus } from '../../../types/clients';
import { CLIENT_STATUS_OPTIONS } from '../constants';

interface ChangeStatusModalProps {
  currentStatus: ClientStatus;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onCancel: () => void;
  onConfirm: (status: ClientStatus) => void;
}

export const ChangeStatusModal = ({
  currentStatus,
  isLoading = false,
  isReadOnly = false,
  onCancel,
  onConfirm,
}: ChangeStatusModalProps) => {
  const [status, setStatus] = useState<ClientStatus>(currentStatus);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  return (
    <div className="clients-modal-overlay" onClick={onCancel}>
      <div className="clients-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="clients-section-title">تغيير حالة العميل</h3>
        <label className="clients-field">
          <span>الحالة الجديدة</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ClientStatus)}
            disabled={isLoading || isReadOnly}
          >
            {CLIENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="clients-form-actions">
          <button type="button" className="clients-btn clients-btn-ghost" onClick={onCancel} disabled={isLoading}>
            إلغاء
          </button>
          <button
            type="button"
            className="clients-btn clients-btn-primary"
            onClick={() => onConfirm(status)}
            disabled={isLoading || isReadOnly || status === currentStatus}
            title={isReadOnly ? 'وضع مشاهدة فقط' : ''}
          >
            {isLoading ? 'جاري التحديث...' : 'تأكيد'}
          </button>
        </div>
      </div>
    </div>
  );
};
