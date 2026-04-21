import { useEffect, useMemo, useState } from 'react';
import { getClientOwnersOptions } from '../../../services/api/clients';
import { AuthApiError } from '../../../services/api/auth';
import type { ClientOwnerOption } from '../../../types/clients';

interface ChangeOwnerModalProps {
  currentOwnerId: string;
  currentOwnerName?: string;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onCancel: () => void;
  onConfirm: (ownerUserId: string) => void;
}

type OwnersLoadState = 'idle' | 'loading' | 'ok' | 'error';

export const ChangeOwnerModal = ({
  currentOwnerId,
  currentOwnerName,
  isLoading = false,
  isReadOnly = false,
  onCancel,
  onConfirm,
}: ChangeOwnerModalProps) => {
  const [ownerUserId, setOwnerUserId] = useState(currentOwnerId);
  const [owners, setOwners] = useState<ClientOwnerOption[]>([]);
  const [ownersLoadState, setOwnersLoadState] = useState<OwnersLoadState>('idle');
  const [ownersError, setOwnersError] = useState('');

  useEffect(() => {
    setOwnerUserId(currentOwnerId);
  }, [currentOwnerId]);

  useEffect(() => {
    let isMounted = true;

    const loadOwners = async () => {
      setOwnersLoadState('loading');
      setOwnersError('');
      try {
        const response = await getClientOwnersOptions({ limit: 200 });
        if (!isMounted) return;
        setOwners(response.data);
        setOwnersLoadState('ok');
      } catch (error) {
        if (!isMounted) return;
        setOwners([]);
        setOwnersLoadState('error');
        setOwnersError(error instanceof AuthApiError ? error.message : 'تعذر تحميل قائمة المالكين');
      }
    };

    loadOwners();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedOwner = useMemo(
    () => owners.find((owner) => owner.id === ownerUserId),
    [owners, ownerUserId],
  );

  const isDisabled =
    isLoading ||
    isReadOnly ||
    ownersLoadState === 'loading' ||
    !ownerUserId.trim() ||
    ownerUserId.trim() === currentOwnerId;

  return (
    <div className="clients-modal-overlay" onClick={onCancel}>
      <div className="clients-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="clients-section-title">تغيير مالك العميل</h3>
        <p className="clients-muted" style={{ marginBottom: '0.75rem' }}>
          المالك الحالي: <strong>{currentOwnerName || currentOwnerId}</strong>
        </p>

        <label className="clients-field">
          <span>المالك الجديد</span>
          <select
            value={ownerUserId}
            onChange={(e) => setOwnerUserId(e.target.value)}
            disabled={isLoading || isReadOnly || ownersLoadState === 'loading'}
          >
            <option value="">اختر مالكًا</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.fullName} ({owner.role})
              </option>
            ))}
          </select>
        </label>

        {ownersLoadState === 'loading' && <p className="clients-muted">جاري تحميل المالكين...</p>}
        {ownersLoadState === 'error' && <p className="clients-inline-error">{ownersError}</p>}
        {selectedOwner && (
          <p className="clients-muted" style={{ marginTop: '0.5rem' }}>
            المالك المختار: <strong>{selectedOwner.fullName}</strong>
          </p>
        )}

        <div className="clients-form-actions">
          <button type="button" className="clients-btn clients-btn-ghost" onClick={onCancel} disabled={isLoading}>
            إلغاء
          </button>
          <button
            type="button"
            className="clients-btn clients-btn-primary"
            onClick={() => onConfirm(ownerUserId.trim())}
            disabled={isDisabled}
            title={isReadOnly ? 'وضع مشاهدة فقط' : ''}
          >
            {isLoading ? 'جاري التحديث...' : 'تأكيد'}
          </button>
        </div>
      </div>
    </div>
  );
};
