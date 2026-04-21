import React from 'react';
import type {
  LeadSearchOutput,
  LeadSearchResultItem,
  PlatformSearchResult,
  SearchPlatform,
  SupportedSaudiCity,
} from '../../../types/lead-search';
import { PlatformResultsSection } from './PlatformResultsSection';

interface SaveResultClickPayload {
  result: LeadSearchResultItem;
  platformId: SearchPlatform;
  resultKey: string;
  searchCity: SupportedSaudiCity;
}

interface SearchResultsProps {
  data: LeadSearchOutput;
  savedResultKeys?: Set<string>;
  isReadOnly?: boolean;
  onSaveToClients?: (payload: SaveResultClickPayload) => void;
}

const buildFallbackResults = (platformId: SearchPlatform, requestedCount: number): PlatformSearchResult => ({
  requestedCount,
  returnedCount: 0,
  warning: `لم تصل بيانات مفصلة من الباك لهذه المنصة (${platformId}).`,
  results: [],
});

export const SearchResults: React.FC<SearchResultsProps> = ({
  data,
  savedResultKeys,
  isReadOnly = false,
  onSaveToClients,
}) => {
  const { platforms, platformResults, requestedResultsCount } = data;

  if (!platforms.length) {
    return (
      <div className="empty-state">
        لا توجد منصات مطلوبة في هذا البحث.
      </div>
    );
  }

  return (
    <>
      {platforms.map((platformId) => {
        const resultsData = platformResults?.[platformId] ?? buildFallbackResults(platformId, requestedResultsCount);

        return (
          <PlatformResultsSection
            key={platformId}
            platformId={platformId}
            resultsData={resultsData}
            savedResultKeys={savedResultKeys}
            isReadOnly={isReadOnly}
            onSaveToClients={(payload) =>
              onSaveToClients?.({
                ...payload,
                searchCity: data.saudiCity,
              })
            }
          />
        );
      })}
    </>
  );
};
