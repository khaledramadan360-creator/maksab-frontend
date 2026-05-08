import {
  TRACKING_EVENT_LABELS,
  type ClientEmailCampaignTrackingEventType,
} from '../../../types/client-email-campaigns';

export interface ClientEmailCampaignTrackingFiltersValues {
  keyword: string;
  hasOpened: 'all' | 'yes' | 'no';
  hasClicked: 'all' | 'yes' | 'no';
  hasBounced: 'all' | 'yes' | 'no';
  hasUnsubscribed: 'all' | 'yes' | 'no';
  hasComplained: 'all' | 'yes' | 'no';
  lastEventType: ClientEmailCampaignTrackingEventType | 'all';
}

interface ClientEmailCampaignTrackingFiltersProps {
  values: ClientEmailCampaignTrackingFiltersValues;
  disabled?: boolean;
  onChange: (next: ClientEmailCampaignTrackingFiltersValues) => void;
  onReset: () => void;
}

const BOOLEAN_FILTER_OPTIONS = [
  { value: 'all', label: 'الكل' },
  { value: 'yes', label: 'نعم' },
  { value: 'no', label: 'لا' },
] as const;

export const ClientEmailCampaignTrackingFilters = ({
  values,
  disabled = false,
  onChange,
  onReset,
}: ClientEmailCampaignTrackingFiltersProps) => {
  return (
    <section className="clients-card client-email-campaigns-filters">
      <div className="clients-filters-grid">
        <label className="clients-field">
          <span>بحث بالعميل أو الإيميل</span>
          <input
            type="text"
            value={values.keyword}
            onChange={(event) => onChange({ ...values, keyword: event.target.value })}
            disabled={disabled}
            placeholder="ابحث..."
          />
        </label>

        <label className="clients-field">
          <span>آخر نوع حدث</span>
          <select
            value={values.lastEventType}
            onChange={(event) =>
              onChange({
                ...values,
                lastEventType: event.target.value as ClientEmailCampaignTrackingEventType | 'all',
              })
            }
            disabled={disabled}
          >
            <option value="all">الكل</option>
            {Object.entries(TRACKING_EVENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {(
          [
            ['hasOpened', 'فتح مؤكد'],
            ['hasClicked', 'نقر'],
            ['hasBounced', 'ارتداد'],
            ['hasUnsubscribed', 'إلغاء اشتراك'],
            ['hasComplained', 'شكوى'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="clients-field">
            <span>{label}</span>
            <select
              value={values[key]}
              onChange={(event) =>
                onChange({
                  ...values,
                  [key]: event.target.value,
                })
              }
              disabled={disabled}
            >
              {BOOLEAN_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
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
