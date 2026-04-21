import { useState, useCallback, useEffect } from 'react';
import { marketingSeasonsApi } from '../../../services/api/marketing-seasons';
import type { ActiveMarketingSeasonDto } from '../../../types/marketing-seasons';
import { usePermissions } from '../../../store/authStore';
import { AuthApiError } from '../../../services/api/auth';

export const useActiveMarketingSeason = () => {
  const [data, setData] = useState<ActiveMarketingSeasonDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isViewer } = usePermissions();

  const fetchActiveSeason = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isViewer) {
        setData({
          id: 'mock-1',
          title: 'موسم الشتاء 2026 (معاينة)',
          description: 'وصف تجريبي للمشاهدين',
        });
      } else {
        const responseData = await marketingSeasonsApi.getActiveMarketingSeason();
        setData(responseData);
      }
    } catch (err: any) {
      if (err instanceof AuthApiError && err.httpStatus === 404) {
        // 404 means no active season - perfectly normal flow
        setData(null);
      } else {
        setError(err instanceof Error ? err : new Error(err.message || 'فشل جلب الموسم النشط'));
      }
    } finally {
      setLoading(false);
    }
  }, [isViewer]);

  useEffect(() => {
    fetchActiveSeason();
  }, [fetchActiveSeason]);

  const refetch = () => {
    fetchActiveSeason();
  };

  return { data, loading, error, refetch };
};
