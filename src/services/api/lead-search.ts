import { authFetch } from '../http/authFetch';
import type { LeadSearchRequest, LeadSearchOutput } from '../../types/lead-search';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://maksab-backend-production.up.railway.app'}/api/v1`;

export const searchLeads = async (payload: LeadSearchRequest): Promise<{ data: LeadSearchOutput }> => {
  const requestPayload: LeadSearchRequest = {
    language: 'ar',
    ...payload,
  };

  return authFetch<{ data: LeadSearchOutput }>(`${BASE_URL}/lead-search`, {
    method: 'POST',
    body: JSON.stringify(requestPayload),
  });
};
