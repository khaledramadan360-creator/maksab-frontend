import React, { useState } from 'react';
import type {
  LeadSearchRequest,
  SearchLanguage,
  SearchPlatform,
  SupportedSaudiCity,
  RequestedResultsCount,
} from '../../../types/lead-search';
import { PlatformSelector } from './PlatformSelector';
import { SaudiCitySelect } from './SaudiCitySelect';
import { RequestedCountSelect } from './RequestedCountSelect';

interface LeadSearchFormProps {
  onSearch: (payload: LeadSearchRequest) => void;
  isLoading: boolean;
  isReadOnly?: boolean;
  lastSearchSummary?: {
    keyword: string;
    metrics: string;
  };
}

export const LeadSearchForm: React.FC<LeadSearchFormProps> = ({
  onSearch,
  isLoading,
  isReadOnly = false,
  lastSearchSummary,
}) => {
  const [keyword, setKeyword] = useState('');
  const [saudiCity, setSaudiCity] = useState<SupportedSaudiCity>('Riyadh');
  const [platforms, setPlatforms] = useState<SearchPlatform[]>(['website', 'linkedin']);
  const [requestedResultsCount, setRequestedResultsCount] = useState<RequestedResultsCount>(10);
  const language: SearchLanguage = 'ar';
  const isFormLocked = isLoading || isReadOnly;

  const isFormValid = keyword.trim().length > 0 && platforms.length > 0;

  const triggerSearch = () => {
    if (!isFormValid || isFormLocked) return;

    onSearch({
      keyword: keyword.trim(),
      saudiCity,
      platforms,
      requestedResultsCount,
      language,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="ls-form">
      <div className="ls-form-section">
        <label htmlFor="keyword" className="ls-label">
          ما الذي تبحث عنه؟ <span className="ls-text-error">*</span>
        </label>
        <div className="ls-input-wrapper">
          <svg className="ls-input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                triggerSearch();
              }
            }}
            disabled={isFormLocked}
            placeholder="أدخل مفتاح البحث، مثال: عقارات أو عيادات جلدية..."
            className="ls-input"
          />
        </div>
      </div>

      <div className="ls-grid-2">
        <SaudiCitySelect
          value={saudiCity}
          onChange={setSaudiCity}
          disabled={isFormLocked}
        />
        <RequestedCountSelect
          value={requestedResultsCount}
          onChange={setRequestedResultsCount}
          disabled={isFormLocked}
        />
      </div>

      <PlatformSelector
        selectedPlatforms={platforms}
        onChange={setPlatforms}
        disabled={isFormLocked}
      />

      <div className="ls-form-footer">
        <div className="ls-summary">
          {lastSearchSummary ? (
            <p>
              آخر بحث: <span className="ls-summary-val">{lastSearchSummary.keyword}</span>
              <span className="ls-summary-divider">|</span>
              {lastSearchSummary.metrics}
            </p>
          ) : (
            <p>النموذج جاهز لبدء عملية البحث</p>
          )}
          {isReadOnly && (
            <p className="ls-readonly-note">
              وضع مشاهدة فقط: يمكنك استعراض الصفحة لكن لا يمكنك تنفيذ البحث.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={triggerSearch}
          disabled={!isFormValid || isFormLocked}
          className="ls-button"
          title={isReadOnly ? 'وضع مشاهدة فقط' : ''}
        >
          {isLoading ? (
            <>
              <svg className="ls-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              جاري البحث...
            </>
          ) : (
            <>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              ابدأ البحث الفوري
            </>
          )}
        </button>
      </div>
    </form>
  );
};
