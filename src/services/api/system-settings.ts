import { authFetch } from '../http/authFetch';
import type { SystemSettingsDto, UpdateSystemSettingsDto } from '../../types/system-settings';

const BASE_URL = 'http://localhost:3000/api/v1/system-settings';

export const systemSettingsApi = {
  getSettings: async (): Promise<SystemSettingsDto> => {
    const response = await authFetch<{ data: SystemSettingsDto }>(BASE_URL, {
      method: 'GET',
    });
    return response.data;
  },

  updateSettings: async (body: UpdateSystemSettingsDto): Promise<SystemSettingsDto> => {
    const response = await authFetch<{ data: SystemSettingsDto }>(BASE_URL, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data;
  },
};
