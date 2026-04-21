import { Link } from 'react-router-dom';
import type { ClientListItem } from '../../../types/clients';
import { CLIENT_PLATFORM_LABELS } from '../constants';
import { ClientStatusBadge } from './ClientStatusBadge';
import { ClientTypeBadge } from './ClientTypeBadge';

interface ClientsTableProps {
  items: ClientListItem[];
  isLoading: boolean;
  isPreviewMode?: boolean;
  currentUserId?: string;
  canManageAllClients?: boolean;
  canChangeOwner?: boolean;
  onEdit: (client: ClientListItem) => void;
  onChangeStatus: (client: ClientListItem) => void;
  onChangeOwner: (client: ClientListItem) => void;
  onDelete: (client: ClientListItem) => void;
}

const PREVIEW_ROWS = [1, 2, 3, 4];

export const ClientsTable = ({
  items,
  isLoading,
  isPreviewMode = false,
  currentUserId,
  canManageAllClients = false,
  canChangeOwner = false,
  onEdit,
  onChangeStatus,
  onChangeOwner,
  onDelete,
}: ClientsTableProps) => {
  if (isLoading) {
    return (
      <div className="clients-card clients-state">
        <p>جاري تحميل العملاء...</p>
      </div>
    );
  }

  return (
    <div className="clients-card clients-table-wrap">
      <table className="clients-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>النوع</th>
            <th>المدينة</th>
            <th>المنصة الأساسية</th>
            <th>الحالة</th>
            <th>المالك</th>
            <th>تاريخ الإنشاء</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {isPreviewMode ? (
            PREVIEW_ROWS.map((row) => (
              <tr key={`preview-${row}`}>
                <td>
                  <span className="clients-preview-line" />
                </td>
                <td>
                  <span className="clients-preview-pill" />
                </td>
                <td>
                  <span className="clients-preview-line short" />
                </td>
                <td>
                  <span className="clients-preview-line short" />
                </td>
                <td>
                  <span className="clients-preview-pill" />
                </td>
                <td>
                  <span className="clients-preview-line short" />
                </td>
                <td>
                  <span className="clients-preview-line short" />
                </td>
                <td>
                  <div className="clients-actions">
                    <button className="clients-btn clients-btn-ghost" disabled title="وضع مشاهدة فقط">
                      تعديل
                    </button>
                    <button className="clients-btn clients-btn-ghost" disabled title="وضع مشاهدة فقط">
                      حالة
                    </button>
                    <button className="clients-btn clients-btn-ghost" disabled title="وضع مشاهدة فقط">
                      مالك
                    </button>
                    <button className="clients-btn clients-btn-danger" disabled title="وضع مشاهدة فقط">
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={8} className="clients-empty-cell">
                لا توجد نتائج مطابقة
              </td>
            </tr>
          ) : (
            items.map((client) => {
              const ownerId = client.owner?.id ?? '';
              const ownerName = client.owner?.fullName ?? 'غير محدد';
              const isOwner = Boolean(ownerId) && ownerId === currentUserId;
              const canManageRow = canManageAllClients || isOwner;

              return (
                <tr key={client.id}>
                  <td>
                    <Link className="clients-row-link" to={`/clients/${client.id}`}>
                      {client.name}
                    </Link>
                  </td>
                  <td>
                    <ClientTypeBadge type={client.type} />
                  </td>
                  <td>{client.city}</td>
                  <td>{CLIENT_PLATFORM_LABELS[client.primaryPlatform]}</td>
                  <td>
                    <ClientStatusBadge status={client.status} />
                  </td>
                  <td>{ownerName}</td>
                  <td>{new Date(client.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td>
                    <div className="clients-actions">
                      <button
                        className="clients-btn clients-btn-ghost"
                        onClick={() => onEdit(client)}
                        disabled={!canManageRow}
                        title={!canManageRow ? 'متاح لمالك العميل فقط' : ''}
                      >
                        تعديل
                      </button>
                      <button
                        className="clients-btn clients-btn-ghost"
                        onClick={() => onChangeStatus(client)}
                        disabled={!canManageRow}
                        title={!canManageRow ? 'متاح لمالك العميل فقط' : ''}
                      >
                        حالة
                      </button>
                      <button
                        className="clients-btn clients-btn-ghost"
                        onClick={() => onChangeOwner(client)}
                        disabled={!canChangeOwner}
                        title={!canChangeOwner ? 'متاح للمدير أو المشرف فقط' : ''}
                      >
                        مالك
                      </button>
                      <button
                        className="clients-btn clients-btn-danger"
                        onClick={() => onDelete(client)}
                        disabled={!canManageRow}
                        title={!canManageRow ? 'متاح لمالك العميل فقط' : ''}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
