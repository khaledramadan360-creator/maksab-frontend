
export const MarketingSeasonsEmptyState = () => (
  <div className="ms-state-container">
    <div className="ms-state-icon">📭</div>
    <h3 className="ms-state-title">لا توجد مواسم تسويقية</h3>
    <p className="ms-state-desc">لم يتم العثور على أي مواسم تسويقية مطابقة للبحث أو لم يتم إنشاء مواسم بعد.</p>
  </div>
);

export const MarketingSeasonsLoadingState = () => (
  <div className="ms-state-container">
    <div className="ms-state-icon" style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
    <h3 className="ms-state-title">جاري التحميل...</h3>
    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);

export const MarketingSeasonsErrorState = ({ error, onRetry }: { error: string, onRetry?: () => void }) => (
  <div className="ms-state-container">
    <div className="ms-state-icon" style={{ color: 'var(--color-error)', opacity: 1 }}>⚠️</div>
    <h3 className="ms-state-title">حدث خطأ</h3>
    <p className="ms-state-desc" style={{ color: 'var(--color-error)' }}>{error}</p>
    {onRetry && (
      <button className="ms-btn ms-btn-secondary" style={{ marginTop: '1rem' }} onClick={onRetry}>
        إعادة المحاولة 🔄
      </button>
    )}
  </div>
);
