import React from 'react';
import type { RequestedResultsCount } from '../../../types/lead-search';

interface RequestedCountSelectProps {
  value: RequestedResultsCount;
  onChange: (count: RequestedResultsCount) => void;
  disabled?: boolean;
}

export const RequestedCountSelect: React.FC<RequestedCountSelectProps> = ({ value, onChange, disabled }) => {
  const options: RequestedResultsCount[] = [10, 25, 50];

  return (
    <div>
      <label htmlFor="requestedCount" className="ls-label">عدد النتائج المطلوبة</label>
      <select
        id="requestedCount"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as RequestedResultsCount)}
        disabled={disabled}
        className="ls-select"
      >
        {options.map((count) => (
          <option key={count} value={count}>{count} نتيجة</option>
        ))}
      </select>
    </div>
  );
};
