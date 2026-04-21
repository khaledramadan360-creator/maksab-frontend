import type { ClientsListFilters, ClientPlatform, ClientStatus, ClientType } from '../../../types/clients';
import { SAUDI_CITIES } from '../../lead-search/constants/saudi-cities';
import {
  CLIENT_PLATFORM_OPTIONS,
  CLIENT_STATUS_OPTIONS,
  CLIENT_TYPE_OPTIONS,
} from '../constants';

interface ClientFiltersProps {
  filters: ClientsListFilters;
  onChange: <K extends keyof ClientsListFilters>(key: K, value: ClientsListFilters[K]) => void;
  onReset: () => void;
  isReadOnly?: boolean;
  showOwnerFilter?: boolean;
}

export const ClientFilters = ({
  filters,
  onChange,
  onReset,
  isReadOnly = false,
  showOwnerFilter = true,
}: ClientFiltersProps) => {
  return (
    <div className="clients-card clients-filters">
      <div className="clients-filters-grid">
        <label className="clients-field">
          <span>الاسم</span>
          <input
            value={filters.keyword ?? ''}
            onChange={(e) => onChange('keyword', e.target.value)}
            disabled={isReadOnly}
            placeholder="ابحث بالاسم..."
          />
        </label>

        <label className="clients-field">
          <span>المدينة</span>
          <select
            value={filters.city ?? ''}
            onChange={(e) => onChange('city', e.target.value as ClientsListFilters['city'])}
            disabled={isReadOnly}
          >
            <option value="">الكل</option>
            {SAUDI_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="clients-field">
          <span>الحالة</span>
          <select
            value={filters.status ?? ''}
            onChange={(e) => onChange('status', e.target.value as ClientStatus | '')}
            disabled={isReadOnly}
          >
            <option value="">الكل</option>
            {CLIENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="clients-field">
          <span>النوع</span>
          <select
            value={filters.type ?? ''}
            onChange={(e) => onChange('type', e.target.value as ClientType | '')}
            disabled={isReadOnly}
          >
            <option value="">الكل</option>
            {CLIENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="clients-field">
          <span>المنصة الأساسية</span>
          <select
            value={filters.primaryPlatform ?? ''}
            onChange={(e) => onChange('primaryPlatform', e.target.value as ClientPlatform | '')}
            disabled={isReadOnly}
          >
            <option value="">الكل</option>
            {CLIENT_PLATFORM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {showOwnerFilter && (
          <label className="clients-field">
            <span>المالك</span>
            <input
              value={filters.ownerUserId ?? ''}
              onChange={(e) => onChange('ownerUserId', e.target.value)}
              disabled={isReadOnly}
              placeholder="User ID"
              dir="ltr"
            />
          </label>
        )}

        <label className="clients-field">
          <span>من تاريخ</span>
          <input
            type="date"
            value={filters.createdFrom?.slice(0, 10) ?? ''}
            onChange={(e) => onChange('createdFrom', e.target.value || '')}
            disabled={isReadOnly}
          />
        </label>

        <label className="clients-field">
          <span>إلى تاريخ</span>
          <input
            type="date"
            value={filters.createdTo?.slice(0, 10) ?? ''}
            onChange={(e) => onChange('createdTo', e.target.value || '')}
            disabled={isReadOnly}
          />
        </label>
      </div>

      <div className="clients-filters-actions">
        <label className="clients-field">
          <span>عناصر الصفحة</span>
          <select
            value={filters.pageSize}
            onChange={(e) => onChange('pageSize', Number(e.target.value))}
            disabled={isReadOnly}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
        <button
          type="button"
          className="clients-btn clients-btn-ghost"
          onClick={onReset}
          disabled={isReadOnly}
          title={isReadOnly ? 'وضع مشاهدة فقط' : ''}
        >
          إعادة ضبط
        </button>
      </div>
    </div>
  );
};
