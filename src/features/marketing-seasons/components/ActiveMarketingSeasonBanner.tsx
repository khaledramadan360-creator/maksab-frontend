import React from 'react';
import type { ActiveMarketingSeasonDto } from '../../../types/marketing-seasons';

interface ActiveMarketingSeasonBannerProps {
  activeSeason: ActiveMarketingSeasonDto | null;
  loading: boolean;
}

export const ActiveMarketingSeasonBanner: React.FC<ActiveMarketingSeasonBannerProps> = ({ activeSeason, loading }) => {
  if (loading) {
    return (
      <div className="ms-banner" style={{ opacity: 0.6 }}>
        <div className="ms-banner-icon">⏳</div>
        <div className="ms-banner-content">
          <h2>جاري تحميل بيانات الموسم النشط...</h2>
        </div>
      </div>
    );
  }

  if (!activeSeason) {
    return (
      <div className="ms-banner" style={{ background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.2)' }}>
        <div className="ms-banner-icon" style={{ animation: 'none', filter: 'grayscale(1)' }}>💤</div>
        <div className="ms-banner-content">
          <h2>لا يوجد موسم تسويقي نشط حالياً</h2>
          <p>قم بتفعيل أحد المواسم من القائمة أدناه ليتم تطبيقه على النظام.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ms-banner">
      <div className="ms-banner-icon">🌟</div>
      <div className="ms-banner-content">
        <h2>{activeSeason.title}</h2>
        {activeSeason.description ? (
          <p>{activeSeason.description}</p>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>لا يوجد وصف لهذا الموسم</p>
        )}
      </div>
      <div style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)' }}>
        <span className="ms-status-badge ms-status-active">نشط الآن</span>
      </div>
    </div>
  );
};
