import { useCallback, useEffect, useState } from 'react';
import { listReports } from '../../../services/api/reports';
import { AuthApiError } from '../../../services/api/auth';
import type { ReportsListItem } from '../../../types/reports';

type LoadState = 'loading' | 'ok' | 'error';

interface UseReportsListOptions {
  isPreviewMode?: boolean;
}

export const useReportsList = ({
  isPreviewMode = false,
}: UseReportsListOptions = {}) => {
  const [items, setItems] = useState<ReportsListItem[]>([]);
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
      const response = await listReports();
      setItems(response.data ?? []);
      setLoadState('ok');
    } catch (error) {
      setItems([]);
      setLoadState('error');
      setErrorMessage(
        error instanceof AuthApiError ? error.message : 'تعذر تحميل قائمة التقارير.',
      );
    }
  }, [isPreviewMode]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    setItems,
    loadState,
    errorMessage,
    refetch: load,
    isEmpty: loadState === 'ok' && items.length === 0,
  };
};
