import React, { useEffect, useMemo, useState } from 'react';
import { LeadSearchForm } from '../components/LeadSearchForm';
import { SearchResults } from '../components/SearchResults';
import { useLeadSearch } from '../hooks/useLeadSearch';
import { usePermissions } from '../../../store/authStore';
import { SaveClientFromSearchModal } from '../../clients/components/SaveClientFromSearchModal';
import type { LeadSearchResultItem, SearchPlatform, SupportedSaudiCity } from '../../../types/lead-search';
import '../styles/lead-search.css';

interface SaveModalState {
  result: LeadSearchResultItem;
  platformId: SearchPlatform;
  resultKey: string;
  searchCity: SupportedSaudiCity;
}

export const LeadSearchPage: React.FC = () => {
  const { isLoading, error, result, hasSearched, runSearch } = useLeadSearch();
  const { isReadOnlyUser } = usePermissions();
  const [savedResultKeys, setSavedResultKeys] = useState<Set<string>>(new Set());
  const [saveModalState, setSaveModalState] = useState<SaveModalState | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setSavedResultKeys(new Set());
  }, [result?.keyword, result?.saudiCity, result?.requestedResultsCount]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  };

  const lastSearchSummary = useMemo(() => {
    if (!result) return undefined;
    const requested = result.requestedResultsCount;
    let totalReturned = 0;

    if (result.platformResults) {
      Object.values(result.platformResults).forEach((platformResult) => {
        if (platformResult?.returnedCount) totalReturned += platformResult.returnedCount;
      });
    }

    const platformsStr =
      result.platforms.length > 2 ? `${result.platforms.length} منصات` : result.platforms.join('، ');

    return {
      keyword: result.keyword,
      metrics: `${result.saudiCity} - ${platformsStr} - ${totalReturned}/${requested} نتيجة`,
    };
  }, [result]);

  return (
    <div className="ls-container">
      <div className="ls-header">
        <h1 className="ls-title">البحث عن عملاء محتملين</h1>
        <p className="ls-subtitle">
          ابحث بدقة عن عملاء محتملين في المملكة العربية السعودية. حدد المدينة والمنصات المناسبة للحصول على أفضل النتائج المدعومة بتحليل الذكاء الاصطناعي.
        </p>
      </div>

      <LeadSearchForm
        onSearch={runSearch}
        isLoading={isLoading}
        isReadOnly={isReadOnlyUser}
        lastSearchSummary={lastSearchSummary}
      />

      <div className="ls-results-container">
        {isLoading && (
          <div className="ls-state-card is-loading">
            <div className="ls-state-icon ls-spin">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="ls-state-title">جاري تنفيذ البحث...</p>
            <p className="ls-state-desc">نقوم الآن بالبحث في المنصات المطلوبة لانتقاء أفضل النتائج المتوفرة.</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="ls-state-card is-error">
            <div className="ls-state-icon" style={{ color: '#ef4444' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="ls-state-title" style={{ color: '#991b1b' }}>حدث خطأ أثناء الاتصال بالخادم</h3>
              <div className="ls-state-desc" style={{ color: '#b91c1c' }}>
                <p>{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !hasSearched && !error && (
          <div className="ls-state-card">
            <div className="ls-state-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="ls-state-title">جاهز للبحث الفوري</h3>
            <p className="ls-state-desc">أدخل كلمة البحث، حدد المدينة والمنصات، ثم اضغط على زر البحث للحصول على بيانات العملاء المحتملين.</p>
          </div>
        )}

        {!isLoading && hasSearched && result && (
          <SearchResults
            data={result}
            savedResultKeys={savedResultKeys}
            isReadOnly={isReadOnlyUser}
            onSaveToClients={({ result: cardResult, platformId, resultKey, searchCity }) => {
              if (isReadOnlyUser) return;
              setSaveModalState({ result: cardResult, platformId, resultKey, searchCity });
            }}
          />
        )}
      </div>

      {saveModalState && (
        <SaveClientFromSearchModal
          result={saveModalState.result}
          searchCity={saveModalState.searchCity}
          sourcePlatform={saveModalState.platformId}
          isReadOnly={isReadOnlyUser}
          onClose={() => setSaveModalState(null)}
          onSaved={() => {
            setSavedResultKeys((prev) => {
              const next = new Set(prev);
              next.add(saveModalState.resultKey);
              return next;
            });
          }}
          onToast={showToast}
        />
      )}

      {toast && <div className={`ls-floating-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};
