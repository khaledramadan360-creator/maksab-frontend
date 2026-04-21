import { useCallback, useEffect, useMemo, useState } from 'react';
import { getClientById } from '../../../services/api/clients';
import { AuthApiError } from '../../../services/api/auth';
import type { ClientDetails } from '../../../types/clients';

type LoadState = 'loading' | 'ok' | 'error';

const PREVIEW_CLIENT: ClientDetails = {
  id: 'preview-client',
  name: 'عميل تجريبي (وضع المشاهدة)',
  type: 'company',
  city: 'Riyadh',
  primaryPlatform: 'website',
  status: 'new',
  owner: { id: 'preview-owner', fullName: 'مالك تجريبي' },
  createdAt: new Date().toISOString(),
  source: 'manual',
  sourceUrl: 'https://example.com',
  notes: 'هذا العرض متاح فقط لمعاينة شكل الصفحة في وضع المشاهدة.',
  platformLinks: {
    website: 'https://example.com',
    linkedin: 'https://linkedin.com/company/example',
  },
};

interface UseClientDetailsOptions {
  clientId?: string;
  isPreviewMode?: boolean;
}

export const useClientDetails = ({ clientId, isPreviewMode = false }: UseClientDetailsOptions) => {
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    if (!clientId) {
      setClient(null);
      setLoadState('error');
      setErrorMessage('لم يتم تحديد العميل');
      return;
    }

    if (isPreviewMode) {
      setClient(PREVIEW_CLIENT);
      setLoadState('ok');
      setErrorMessage('');
      return;
    }

    setLoadState('loading');
    setErrorMessage('');
    try {
      const response = await getClientById(clientId);
      setClient(response.data);
      setLoadState('ok');
    } catch (error) {
      setClient(null);
      setLoadState('error');
      setErrorMessage(error instanceof AuthApiError ? error.message : 'تعذر تحميل تفاصيل العميل');
    }
  }, [clientId, isPreviewMode]);

  useEffect(() => {
    load();
  }, [load]);

  const isPreviewClient = useMemo(() => isPreviewMode, [isPreviewMode]);

  return {
    client,
    loadState,
    errorMessage,
    reload: load,
    setClient,
    isPreviewClient,
  };
};
