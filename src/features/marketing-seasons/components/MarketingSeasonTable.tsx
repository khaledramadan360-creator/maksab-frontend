import React from 'react';
import type { MarketingSeasonListItemDto } from '../../../types/marketing-seasons';
import { usePermissions, useAuthStore } from '../../../store/authStore';

interface MarketingSeasonTableProps {
  items: MarketingSeasonListItemDto[];
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onActivate: (id: string, title: string) => void;
}

export const MarketingSeasonTable: React.FC<MarketingSeasonTableProps> = ({
  items,
  onEdit,
  onDelete,
  onActivate,
}) => {
  const { user } = useAuthStore();
  const { isViewer, hasRole } = usePermissions();
  const isManagerOrAdmin = hasRole(['admin', 'manager']);

  const canManageSeason = (ownerId: string) => {
    if (isViewer) return false;
    if (isManagerOrAdmin) return true;
    return user?.id === ownerId; // Employee fallback (own-only)
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="ms-table-container">
      <table className="ms-table">
        <thead>
          <tr>
            <th>عنوان الموسم</th>
            <th>الحالة</th>
            <th>تاريخ الإنشاء</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {items.map((season) => {
            const hasAccess = canManageSeason(season.ownerUserId);

            return (
              <tr key={season.id}>
                <td style={{ fontWeight: 500 }}>
                  {season.title}
                </td>
                <td>
                  {season.status === 'active' ? (
                    <span className="ms-status-badge ms-status-active">نشط</span>
                  ) : (
                    <span className="ms-status-badge ms-status-inactive">غير نشط</span>
                  )}
                </td>
                <td>
                  {formatDate(season.createdAt)}
                </td>
                <td>
                  <div className="ms-table-actions">
                    {hasAccess ? (
                      <>
                        {season.status !== 'active' && (
                          <button
                            className="ms-btn-icon"
                            title="تفعيل الموسم"
                            onClick={() => onActivate(season.id, season.title)}
                          >
                            🚀
                          </button>
                        )}
                        <button
                          className="ms-btn-icon"
                          title="تعديل رمز الموسم"
                          onClick={() => onEdit(season.id)}
                        >
                          ✏️
                        </button>
                        <button
                          className="ms-btn-icon"
                          title="حذف الموسم"
                          onClick={() => onDelete(season.id, season.title)}
                        >
                          🗑️
                        </button>
                      </>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {isViewer ? 'وضع القراءة' : 'غير مصرح'}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
