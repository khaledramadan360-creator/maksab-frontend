export interface ReportsListFilterValues {
  clientName: string;
  ownerName: string;
  status: 'all' | 'generating' | 'ready' | 'failed';
  generatedFrom: string;
  generatedTo: string;
}

interface ReportsListFiltersProps {
  values: ReportsListFilterValues;
  onChange: (next: ReportsListFilterValues) => void;
  onReset: () => void;
  disabled?: boolean;
}

export const ReportsListFilters = ({
  values,
  onChange,
  onReset,
  disabled = false,
}: ReportsListFiltersProps) => {
  return (
    <div className="reports-list-filters">
      <label className="clients-field">
        <span>اسم العميل</span>
        <input
          value={values.clientName}
          onChange={(event) => onChange({ ...values, clientName: event.target.value })}
          disabled={disabled}
          placeholder="ابحث باسم العميل..."
        />
      </label>

      <label className="clients-field">
        <span>المالك</span>
        <input
          value={values.ownerName}
          onChange={(event) => onChange({ ...values, ownerName: event.target.value })}
          disabled={disabled}
          placeholder="ابحث باسم المالك..."
        />
      </label>

      <label className="clients-field">
        <span>حالة التقرير</span>
        <select
          value={values.status}
          onChange={(event) =>
            onChange({
              ...values,
              status: event.target.value as ReportsListFilterValues['status'],
            })
          }
          disabled={disabled}
        >
          <option value="all">الكل</option>
          <option value="ready">جاهز</option>
          <option value="generating">قيد التوليد</option>
          <option value="failed">فشل</option>
        </select>
      </label>

      <label className="clients-field">
        <span>من تاريخ التوليد</span>
        <input
          type="date"
          value={values.generatedFrom}
          onChange={(event) =>
            onChange({ ...values, generatedFrom: event.target.value || '' })
          }
          disabled={disabled}
        />
      </label>

      <label className="clients-field">
        <span>إلى تاريخ التوليد</span>
        <input
          type="date"
          value={values.generatedTo}
          onChange={(event) =>
            onChange({ ...values, generatedTo: event.target.value || '' })
          }
          disabled={disabled}
        />
      </label>

      <div className="reports-list-filters-actions">
        <button
          type="button"
          className="clients-btn clients-btn-ghost"
          onClick={onReset}
          disabled={disabled}
        >
          إعادة تعيين
        </button>
      </div>
    </div>
  );
};
