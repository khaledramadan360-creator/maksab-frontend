import React from 'react';
import type { LeadSearchResultItem, SearchPlatform } from '../../../types/lead-search';
import { PLATFORMS_CONFIG } from '../constants/platforms';

export interface SaveFromResultPayload {
  result: LeadSearchResultItem;
  platformId: SearchPlatform;
  resultKey: string;
}

interface SearchResultCardProps {
  result: LeadSearchResultItem;
  fallbackPlatform?: SearchPlatform;
  resultKey: string;
  isSaved?: boolean;
  isReadOnly?: boolean;
  onSaveToClients?: (payload: SaveFromResultPayload) => void;
}

const getScoreBadgeProps = (score?: number) => {
  if (score === undefined || !Number.isFinite(score)) return null;
  if (score >= 80) return { colorClass: 'ls-badge-green', label: 'قوي' };
  if (score >= 60) return { colorClass: 'ls-badge-blue', label: 'جيد' };
  return { colorClass: 'ls-badge-gray', label: 'ضعيف' };
};

const LocationIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TypeIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const PlatformIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3h14a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm0 10h14a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z" />
  </svg>
);

const LinkIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 010 5.656l-2 2a4 4 0 01-5.656-5.656l1.5-1.5m8.156 2.656a4 4 0 010-5.656l2-2a4 4 0 115.656 5.656l-1.5 1.5" />
  </svg>
);

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  fallbackPlatform,
  resultKey,
  isSaved = false,
  isReadOnly = false,
  onSaveToClients,
}) => {
  const scoreValue = typeof result.score === 'number' && Number.isFinite(result.score) ? Math.round(result.score) : undefined;
  const scoreBadge = getScoreBadgeProps(scoreValue);

  const displayName = result.displayNameOrName?.trim() || result.extractedNameOrLabel?.trim() || 'بدون اسم واضح';
  const headline = result.titleOrHeadline?.trim() || result.title?.trim() || result.snippet?.trim() || 'لا يوجد عنوان أو وصف متاح';
  const location = result.location?.trim() || result.extractedLocation?.trim() || 'غير محدد';
  const resultType = result.resultType?.trim() || 'غير محدد';
  const canonicalUrl = result.canonicalUrl?.trim();
  const platformId = result.platform ?? fallbackPlatform;
  const platformLabel = platformId ? (PLATFORMS_CONFIG[platformId]?.label ?? platformId) : 'غير محددة';

  const canSave = Boolean(!isReadOnly && platformId && onSaveToClients && !isSaved);

  return (
    <div className="ls-card">
      <div className="ls-card-head">
        <h3 className="ls-card-title" title={displayName}>
          {displayName}
        </h3>
        {scoreBadge && scoreValue !== undefined && (
          <span className={`ls-badge ${scoreBadge.colorClass}`}>
            {scoreValue}% ({scoreBadge.label})
          </span>
        )}
      </div>

      <p className="ls-card-headline" title={headline}>
        {headline}
      </p>

      <div className="ls-card-meta">
        <div className="ls-card-meta-item" title={location}>
          <LocationIcon />
          <span>{location}</span>
        </div>
        <div className="ls-card-meta-item" title={resultType}>
          <TypeIcon />
          <span>{resultType}</span>
        </div>
        <div className="ls-card-meta-item" title={platformLabel}>
          <PlatformIcon />
          <span>{platformLabel}</span>
        </div>
      </div>

      <div className="ls-card-meta ls-card-meta-link" style={{ marginBottom: '0.75rem' }}>
        <div className="ls-card-meta-item" title={canonicalUrl || 'لا يوجد رابط متاح'}>
          <LinkIcon />
          <span>{canonicalUrl || 'لا يوجد رابط متاح'}</span>
        </div>
      </div>

      <div className="ls-card-footer">
        {canonicalUrl ? (
          <a href={canonicalUrl} target="_blank" rel="noopener noreferrer" className="ls-btn-outline is-primary">
            عرض الرابط
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '0.375rem', marginLeft: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <button disabled className="ls-btn-outline is-primary" title="لا يوجد رابط صالح لهذا السجل">
            لا يوجد رابط
          </button>
        )}

        <button
          className={`ls-btn-outline ${isSaved ? 'is-success' : ''}`}
          onClick={() => {
            if (!platformId || !onSaveToClients) return;
            onSaveToClients({ result, platformId, resultKey });
          }}
          disabled={!canSave}
          title={
            isReadOnly
              ? 'وضع مشاهدة فقط'
              : isSaved
                ? 'تم حفظ العميل مسبقًا'
                : !platformId
                  ? 'لا يمكن تحديد المنصة لهذه النتيجة'
                  : ''
          }
        >
          {isSaved ? 'تم الحفظ' : 'حفظ للعملاء'}
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '0.375rem', marginLeft: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
