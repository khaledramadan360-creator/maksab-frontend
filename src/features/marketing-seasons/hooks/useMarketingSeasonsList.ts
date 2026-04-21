import { useState, useCallback, useEffect } from 'react';
import { marketingSeasonsApi } from '../../../services/api/marketing-seasons';
import type { MarketingSeasonFiltersDto, MarketingSeasonsListResponseDto } from '../../../types/marketing-seasons';
import { usePermissions } from '../../../store/authStore';

export const useMarketingSeasonsList = (initialFilters: MarketingSeasonFiltersDto = { page: 1, pageSize: 20 }) => {
  const [data, setData] = useState<MarketingSeasonsListResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<MarketingSeasonFiltersDto>(initialFilters);
  const { isViewer } = usePermissions();

  const fetchSeasons = useCallback(async (currentFilters: MarketingSeasonFiltersDto) => {
    setLoading(true);
    setError(null);
    try {
      if (isViewer) {
        // Viewer Mock Data Preview
        setData({
          items: [
            {
              id: 'mock-1',
              title: 'موسم الشتاء 2026 (معاينة)',
              status: 'active',
              ownerUserId: 'mock-owner',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'mock-2',
              title: 'تخفيضات الربيع 2026 (معاينة)',
              status: 'inactive',
              ownerUserId: 'mock-owner',
              createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
            }
          ],
          total: 2,
          page: currentFilters.page || 1,
          pageSize: currentFilters.pageSize || 20
        });
      } else {
        const responseData = await marketingSeasonsApi.listMarketingSeasons(currentFilters);
        setData(responseData);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'فشل جلب المواسم التسويقية'));
    } finally {
      setLoading(false);
    }
  }, [isViewer]);

  useEffect(() => {
    fetchSeasons(filters);
  }, [filters, fetchSeasons]);

  const updateFilters = (newFilters: Partial<MarketingSeasonFiltersDto>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  };

  const refetch = () => {
    fetchSeasons(filters);
  };

  return { data, loading, error, filters, updateFilters, refetch };
};
