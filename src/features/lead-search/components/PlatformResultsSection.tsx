import React from 'react';
import type { SearchPlatform, PlatformSearchResult } from '../../../types/lead-search';
import { SearchResultCard, type SaveFromResultPayload } from './SearchResultCard';
import { PLATFORMS_CONFIG } from '../constants/platforms';

interface PlatformResultsSectionProps {
  platformId: SearchPlatform;
  resultsData: PlatformSearchResult;
  savedResultKeys?: Set<string>;
  isReadOnly?: boolean;
  onSaveToClients?: (payload: SaveFromResultPayload) => void;
}

const buildFallbackPlatformLabel = (platformId: SearchPlatform): string => {
  if (platformId === 'x') return 'X';
  return `${platformId.charAt(0).toUpperCase()}${platformId.slice(1)}`;
};

const buildResultKey = (platformId: SearchPlatform, index: number, result: PlatformSearchResult['results'][number]) => {
  const candidate =
    result.id?.trim() ||
    result.canonicalUrl?.trim() ||
    result.displayNameOrName?.trim() ||
    result.extractedNameOrLabel?.trim() ||
    result.titleOrHeadline?.trim() ||
    result.title?.trim();
  return candidate ? `${platformId}:${candidate}` : `${platformId}:idx:${index}`;
};

export const PlatformResultsSection: React.FC<PlatformResultsSectionProps> = ({
  platformId,
  resultsData,
  savedResultKeys,
  isReadOnly = false,
  onSaveToClients,
}) => {
  const platformConfig = PLATFORMS_CONFIG[platformId] ?? {
    label: buildFallbackPlatformLabel(platformId),
    iconPlaceholder: '?',
  };

  const safeResults = Array.isArray(resultsData.results) ? resultsData.results : [];
  const requestedCount = Number.isFinite(resultsData.requestedCount) ? resultsData.requestedCount : 0;
  const returnedCount = Number.isFinite(resultsData.returnedCount)
    ? resultsData.returnedCount
    : safeResults.length;
  const warning = resultsData.warning;
  const hasResults = safeResults.length > 0;

  const getStatusPillClass = () => {
    if (warning) return 'ls-status-warning';
    if (!hasResults || returnedCount === 0) return 'ls-status-empty';
    if (returnedCount < requestedCount) return 'ls-status-partial';
    return 'ls-status-success';
  };

  const getStatusText = () => {
    if (warning) return 'تنبيه بحث';
    if (!hasResults || returnedCount === 0) return 'لا توجد نتائج';
    return 'تم استرجاع النتائج';
  };

  return (
    <div className="ls-platform-section">
      <div className="ls-section-header">
        <div className="ls-section-title-wrap">
          <div className="ls-section-icon" aria-hidden="true">
            {platformConfig.iconPlaceholder}
          </div>
          <div>
            <h2 className="ls-section-title">{platformConfig.label}</h2>
            <div className="ls-section-meta">
              النتائج المكتشفة: <strong>{returnedCount}</strong> / {requestedCount}
            </div>
          </div>
        </div>

        <div className={`ls-status-pill ${getStatusPillClass()}`}>
          {getStatusText()}
        </div>
      </div>

      {warning && (
        <div className="ls-warning-box">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#9a3412', marginBottom: '0.25rem' }}>
              تنبيه من منصة {platformConfig.label}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#c2410c', fontWeight: 500 }}>{warning}</p>
          </div>
        </div>
      )}

      {hasResults ? (
        <div className="ls-cards-grid">
          {safeResults.map((result, idx) => {
            const resultKey = buildResultKey(platformId, idx, result);

            return (
              <SearchResultCard
                key={resultKey}
                result={result}
                fallbackPlatform={platformId}
                resultKey={resultKey}
                isSaved={savedResultKeys?.has(resultKey)}
                isReadOnly={isReadOnly}
                onSaveToClients={onSaveToClients}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <svg style={{ width: '3rem', height: '3rem', color: '#d1d5db', margin: '0 auto 1rem auto' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: '#4b5563' }}>لم يتم العثور على نتائج مناسبة في هذه المنصة</p>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>حاول تغيير الكلمة المفتاحية أو توسيع نطاق البحث</p>
        </div>
      )}
    </div>
  );
};
