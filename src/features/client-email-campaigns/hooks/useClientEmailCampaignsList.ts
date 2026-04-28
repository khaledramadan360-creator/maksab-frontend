import { useCallback, useEffect, useState } from 'react';
import { AuthApiError } from '../../../services/api/auth';
import {
  listClientEmailCampaigns,
} from '../../../services/api/client-email-campaigns';
import type {
  ClientEmailCampaignListItem,
  ClientEmailCampaignStatus,
} from '../../../types/client-email-campaigns';

type LoadState = 'loading' | 'ok' | 'error';

export interface CampaignsListFilters {
  status: ClientEmailCampaignStatus | 'all';
  createdAtFrom: string;
  createdAtTo: string;
  page: number;
  pageSize: number;
}

interface UseClientEmailCampaignsListOptions {
  filters: CampaignsListFilters;
  isPreviewMode?: boolean;
}

export const useClientEmailCampaignsList = ({
  filters,
  isPreviewMode = false,
}: UseClientEmailCampaignsListOptions) => {
  const { status, createdAtFrom, createdAtTo, page, pageSize } = filters;

  const [items, setItems] = useState<ClientEmailCampaignListItem[]>([]);
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
      const response = await listClientEmailCampaigns({
        status,
        createdAtFrom: createdAtFrom || undefined,
        createdAtTo: createdAtTo || undefined,
        page,
        pageSize,
      });
      setItems(response.items);
      setTotal(response.total);
      setLoadState('ok');
    } catch (error) {
      setItems([]);
      setTotal(0);
      setLoadState('error');
      setErrorMessage(
        error instanceof AuthApiError
          ? error.message
          : 'تعذر تحميل قائمة حملات البريد الإلكتروني.',
      );
    }
  }, [
    createdAtFrom,
    createdAtTo,
    isPreviewMode,
    page,
    pageSize,
    status,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    total,
    loadState,
    errorMessage,
    refetch: load,
    setItems,
  };
};
