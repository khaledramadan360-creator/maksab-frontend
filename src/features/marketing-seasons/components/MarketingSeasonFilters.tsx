import React, { useState } from 'react';
import type { MarketingSeasonFiltersDto } from '../../../types/marketing-seasons';

interface MarketingSeasonFiltersProps {
  filters: MarketingSeasonFiltersDto;
  onFilterChange: (filters: Partial<MarketingSeasonFiltersDto>) => void;
}

export const MarketingSeasonFilters: React.FC<MarketingSeasonFiltersProps> = ({ filters, onFilterChange }) => {
  const [keyword, setKeyword] = useState(filters.keyword || '');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onFilterChange({ keyword });
    }
  };

  return (
    <div className="ms-filters">
      <div className="ms-filter-group" style={{ flex: 2 }}>
        <label>البحث بالكلمات المفتاحية</label>
        <input
          type="text"
          className="ms-input"
          placeholder="ابحث عن اسم الموسم واضغط Enter..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleSearch}
          onBlur={() => onFilterChange({ keyword })}
        />
      </div>
      
      <div className="ms-filter-group">
        <label>الحالة</label>
        <select 
          className="ms-input"
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ status: (e.target.value as any) || undefined })}
        >
          <option value="">الكل</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
      </div>

      <div className="ms-filter-group">
        <label>من تاريخ إنشاء</label>
        <input
          type="date"
          className="ms-input"
          value={filters.createdAtFrom || ''}
          onChange={(e) => onFilterChange({ createdAtFrom: e.target.value || undefined })}
        />
      </div>

      <div className="ms-filter-group">
        <label>إلى تاريخ إنشاء</label>
        <input
          type="date"
          className="ms-input"
          value={filters.createdAtTo || ''}
          onChange={(e) => onFilterChange({ createdAtTo: e.target.value || undefined })}
        />
      </div>
    </div>
  );
};
