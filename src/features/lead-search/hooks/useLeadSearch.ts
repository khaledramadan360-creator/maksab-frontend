import { useState, useCallback, useRef } from 'react';
import type { LeadSearchRequest, LeadSearchOutput } from '../../../types/lead-search';
import { searchLeads } from '../../../services/api/lead-search';

interface UseLeadSearchState {
  isLoading: boolean;
  error: Error | null;
  result: LeadSearchOutput | null;
  hasSearched: boolean;
}

export const useLeadSearch = () => {
  const inFlightRef = useRef(false);

  const [state, setState] = useState<UseLeadSearchState>({
    isLoading: false,
    error: null,
    result: null,
    hasSearched: false,
  });

  const runSearch = useCallback(async (payload: LeadSearchRequest) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    setState((prev) => ({ ...prev, isLoading: true, error: null, hasSearched: true }));
    try {
      const response = await searchLeads(payload);
      setState({
        isLoading: false,
        error: null,
        result: response.data,
        hasSearched: true,
      });
    } catch (error: any) {
      setState({
        isLoading: false,
        error: error instanceof Error ? error : new Error(error?.message || 'Failed to search leads'),
        result: null,
        hasSearched: true,
      });
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  return {
    ...state,
    runSearch,
  };
};
