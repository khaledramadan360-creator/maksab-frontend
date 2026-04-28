import type { ClientEmailCampaignStatus } from '../../../types/client-email-campaigns';

export interface ClientEmailCampaignsFiltersValues {
  keyword: string;
  status: ClientEmailCampaignStatus | 'all';
  createdAtFrom: string;
  createdAtTo: string;
}

interface ClientEmailCampaignsFiltersProps {
  values: ClientEmailCampaignsFiltersValues;
  disabled?: boolean;
  onChange: (next: ClientEmailCampaignsFiltersValues) => void;
  onReset: () => void;
}

export const ClientEmailCampaignsFilters = ({
  values,
  disabled = false,
  onChange,
  onReset,
}: ClientEmailCampaignsFiltersProps) => {
  return (
    <section className="clients-card client-email-campaigns-filters">
      <div className="clients-filters-grid">
        <label className="clients-field">
          <span>بحث بالعنوان/الموضوع</span>
          <input
            type="text"
            value={values.keyword}
            onChange={(event) =>
              onChange({ ...values, keyword: event.target.value })
            }
            disabled={disabled}
            placeholder="ابحث..."
          />
        </label>

        <label className="clients-field">
          <span>الحالة</span>
          <select
            value={values.status}
            onChange={(event) =>
              onChange({
                ...values,
                status: event.target.value as ClientEmailCampaignStatus | 'all',
              })
            }
            disabled={disabled}
          >
            <option value="all">الكل</option>
            <option value="draft">مسودة</option>
            <option value="previewed">تمت المعاينة</option>
            <option value="sending">جاري الإرسال</option>
            <option value="sent">تم الإرسال</option>
            <option value="partially_failed">فشل جزئي</option>
            <option value="failed">فشلت</option>
          </select>
        </label>

        <label className="clients-field">
          <span>من تاريخ</span>
          <input
            type="date"
            value={values.createdAtFrom}
            onChange={(event) =>
              onChange({ ...values, createdAtFrom: event.target.value })
            }
            disabled={disabled}
          />
        </label>

        <label className="clients-field">
          <span>إلى تاريخ</span>
          <input
            type="date"
            value={values.createdAtTo}
            onChange={(event) =>
              onChange({ ...values, createdAtTo: event.target.value })
            }
            disabled={disabled}
          />
        </label>
      </div>

      <div className="clients-filters-actions">
        <button
          type="button"
          className="clients-btn clients-btn-ghost"
          onClick={onReset}
          disabled={disabled}
        >
          إعادة ضبط
        </button>
      </div>
    </section>
  );
};
