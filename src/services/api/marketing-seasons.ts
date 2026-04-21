import { authFetch } from '../http/authFetch';
import type {
  ActiveMarketingSeasonDto,
  CreateMarketingSeasonRequestDto,
  MarketingSeasonDto,
  MarketingSeasonFiltersDto,
  MarketingSeasonsListResponseDto,
  UpdateMarketingSeasonRequestDto,
} from '../../types/marketing-seasons';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://maksab-backend-production.up.railway.app'}/api/v1/marketing-seasons`;

export const marketingSeasonsApi = {
  createMarketingSeason: async (body: CreateMarketingSeasonRequestDto): Promise<MarketingSeasonDto> => {
    const response = await authFetch<{ data: MarketingSeasonDto }>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response.data;
  },

  listMarketingSeasons: async (params: MarketingSeasonFiltersDto): Promise<MarketingSeasonsListResponseDto> => {
    const query = new URLSearchParams();
    
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.status) query.append('status', params.status);
    if (params.ownerUserId) query.append('ownerUserId', params.ownerUserId);
    if (params.createdAtFrom) query.append('createdAtFrom', params.createdAtFrom);
    if (params.createdAtTo) query.append('createdAtTo', params.createdAtTo);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.pageSize !== undefined) query.append('pageSize', params.pageSize.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';

    const response = await authFetch<{ data: MarketingSeasonsListResponseDto }>(`${BASE_URL}${queryString}`, {
      method: 'GET',
    });
    return response.data;
  },

  getMarketingSeasonById: async (seasonId: string): Promise<MarketingSeasonDto> => {
    const response = await authFetch<{ data: MarketingSeasonDto }>(`${BASE_URL}/${seasonId}`, {
      method: 'GET',
    });
    return response.data;
  },

  updateMarketingSeason: async (seasonId: string, body: UpdateMarketingSeasonRequestDto): Promise<MarketingSeasonDto> => {
    const response = await authFetch<{ data: MarketingSeasonDto }>(`${BASE_URL}/${seasonId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data;
  },

  deleteMarketingSeason: async (seasonId: string): Promise<void> => {
    await authFetch<{ data: null }>(`${BASE_URL}/${seasonId}`, {
      method: 'DELETE',
    });
  },

  activateMarketingSeason: async (seasonId: string): Promise<void> => {
    await authFetch<{ data: null }>(`${BASE_URL}/${seasonId}/activate`, {
      method: 'POST',
    });
  },

  getActiveMarketingSeason: async (): Promise<ActiveMarketingSeasonDto> => {
    const response = await authFetch<{ data: ActiveMarketingSeasonDto }>(`${BASE_URL}/active`, {
      method: 'GET',
    });
    return response.data;
  },
};
