export interface TeamAnalysisFilterValues {
  clientName: string;
  ownerName: string;
  hasAnalysis: 'all' | 'with' | 'without';
  analyzedDate: string;
}

interface TeamAnalysisFiltersProps {
  values: TeamAnalysisFilterValues;
  onChange: (next: TeamAnalysisFilterValues) => void;
  onReset: () => void;
  disabled?: boolean;
}

export const TeamAnalysisFilters = ({
  values,
  onChange,
  onReset,
  disabled = false,
}: TeamAnalysisFiltersProps) => {
  return (
    <div className="analysis-team-filters">
      <label className="clients-field">
        <span>العميل</span>
        <input
          value={values.clientName}
          onChange={(event) =>
            onChange({ ...values, clientName: event.target.value })
          }
          disabled={disabled}
          placeholder="ابحث باسم العميل..."
        />
      </label>

      <label className="clients-field">
        <span>المالك</span>
        <input
          value={values.ownerName}
          onChange={(event) =>
            onChange({ ...values, ownerName: event.target.value })
          }
          disabled={disabled}
          placeholder="ابحث باسم المالك..."
        />
      </label>

      <label className="clients-field">
        <span>التحليل</span>
        <select
          value={values.hasAnalysis}
          onChange={(event) =>
            onChange({
              ...values,
              hasAnalysis: event.target.value as TeamAnalysisFilterValues['hasAnalysis'],
            })
          }
          disabled={disabled}
        >
          <option value="all">الكل</option>
          <option value="with">يوجد تحليل</option>
          <option value="without">بدون تحليل</option>
        </select>
      </label>

      <label className="clients-field">
        <span>تاريخ آخر تحليل</span>
        <input
          type="date"
          value={values.analyzedDate}
          onChange={(event) =>
            onChange({ ...values, analyzedDate: event.target.value || '' })
          }
          disabled={disabled}
        />
      </label>

      <div className="analysis-team-filter-actions">
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
