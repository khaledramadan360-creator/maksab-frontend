import React from 'react';
import type { SupportedSaudiCity } from '../../../types/lead-search';
import { SAUDI_CITIES } from '../constants/saudi-cities';

interface SaudiCitySelectProps {
  value: SupportedSaudiCity;
  onChange: (city: SupportedSaudiCity) => void;
  disabled?: boolean;
}

export const SaudiCitySelect: React.FC<SaudiCitySelectProps> = ({ value, onChange, disabled }) => {
  return (
    <div>
      <label htmlFor="saudiCity" className="ls-label">المدينة</label>
      <select
        id="saudiCity"
        value={value}
        onChange={(e) => onChange(e.target.value as SupportedSaudiCity)}
        disabled={disabled}
        className="ls-select"
      >
        <option value="all">الكل (البحث في جميع المدن)</option>
        {SAUDI_CITIES.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
};
