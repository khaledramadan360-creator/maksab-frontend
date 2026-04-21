import { useCallback, useEffect, useState } from 'react';
import { listClients } from '../../../services/api/clients';
import { AuthApiError } from '../../../services/api/auth';
import type { ClientListItem, ClientsListFilters } from '../../../types/clients';

type LoadState = 'loading' | 'ok' | 'error';

interface UseClientsListOptions {
  filters: ClientsListFilters;
  isPreviewMode?: boolean;
}

export const useClientsList = ({ filters, isPreviewMode = false }: UseClientsListOptions) => {
  const [items, setItems] = useState<ClientListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    if (isPreviewMode) {
      setItems([]);
      setTotal(0);
      setLoadState('ok');
      setErrorMessage('');
      return;
    }

    setLoadState('loading');
    setErrorMessage('');
    try {
      const response = await listClients(filters);
      setItems(response.data.items ?? []);
      setTotal(response.data.total ?? 0);
      setLoadState('ok');
    } catch (error) {
      setItems([]);
      setTotal(0);
      setLoadState('error');
      setErrorMessage(error instanceof AuthApiError ? error.message : 'تعذر تحميل العملاء');
    }
  }, [filters, isPreviewMode]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    total,
    loadState,
    errorMessage,
    reload: load,
    setItems,
  };
};
