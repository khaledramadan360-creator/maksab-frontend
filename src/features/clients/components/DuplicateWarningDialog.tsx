import type { DuplicateCheckResponse } from '../../../types/clients';

interface DuplicateWarningDialogProps {
  duplicateData: DuplicateCheckResponse;
  isLoading?: boolean;
  onCancel: () => void;
  onForceCreate: () => void;
}

export const DuplicateWarningDialog = ({
  duplicateData,
  isLoading = false,
  onCancel,
  onForceCreate,
}: DuplicateWarningDialogProps) => {
  const matchedClient = duplicateData.matchedClient;
  const matchedBy = duplicateData.matchedBy;
  const matchedFields = duplicateData.matchedFields ?? [];

  return (
    <div className="clients-modal-overlay" onClick={onCancel}>
      <div className="clients-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="clients-section-title">تحذير تكرار عميل</h3>
        <p className="clients-inline-warning">
          يوجد عميل مشابه بالفعل. يمكنك الإلغاء أو المتابعة بالحفظ مع تجاوز التحذير.
        </p>

        {(matchedBy || matchedFields.length > 0) && (
          <div className="clients-duplicate-block">
            <strong>التطابق عبر:</strong>
            {matchedBy && <p>{matchedBy}</p>}
            {matchedFields.length > 0 && (
              <ul>
                {matchedFields.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {(duplicateData.matchedClientId || matchedClient) && (
          <div className="clients-duplicate-block">
            <strong>العميل المطابق:</strong>
            {duplicateData.matchedClientId && <p>ID: {duplicateData.matchedClientId}</p>}
            {matchedClient?.name && <p>الاسم: {matchedClient.name}</p>}
            {matchedClient?.city && <p>المدينة: {matchedClient.city}</p>}
            {matchedClient?.primaryPlatform && <p>المنصة: {matchedClient.primaryPlatform}</p>}
            {matchedClient?.ownerName && <p>المالك: {matchedClient.ownerName}</p>}
          </div>
        )}

        <div className="clients-form-actions">
          <button type="button" className="clients-btn clients-btn-ghost" onClick={onCancel} disabled={isLoading}>
            إلغاء
          </button>
          <button type="button" className="clients-btn clients-btn-danger" onClick={onForceCreate} disabled={isLoading}>
            {isLoading ? 'جاري الحفظ...' : 'متابعة الحفظ رغم التكرار'}
          </button>
        </div>
      </div>
    </div>
  );
};
