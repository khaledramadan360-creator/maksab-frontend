import { useCallback, useEffect, useState } from 'react';
import { getTeamAnalysisOverview } from '../../../services/api/analysis';
import { AuthApiError } from '../../../services/api/auth';
import type { TeamAnalysisOverviewItem } from '../../../types/analysis';

type LoadState = 'loading' | 'ok' | 'error';

interface UseTeamAnalysisOverviewOptions {
  isPreviewMode?: boolean;
}

export const useTeamAnalysisOverview = ({
  isPreviewMode = false,
}: UseTeamAnalysisOverviewOptions = {}) => {
  const [items, setItems] = useState<TeamAnalysisOverviewItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    if (isPreviewMode) {
      setItems([]);
      setLoadState('ok');
      setErrorMessage('');
      return;
    }

    setLoadState('loading');
    setErrorMessage('');

    try {
      const response = await getTeamAnalysisOverview();
      setItems(response.data ?? []);
      setLoadState('ok');
    } catch (error) {
      setItems([]);
      setLoadState('error');
      setErrorMessage(
        error instanceof AuthApiError
          ? error.message
          : 'تعذر تحميل نظرة تحليل الفريق.',
      );
    }
  }, [isPreviewMode]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    loadState,
    errorMessage,
    refetch: load,
    isEmpty: loadState === 'ok' && items.length === 0,
  };
};
