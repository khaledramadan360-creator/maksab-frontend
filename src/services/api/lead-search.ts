import { authFetch } from '../http/authFetch';
import type { LeadSearchRequest, LeadSearchOutput } from '../../types/lead-search';

const BASE_URL = 'http://localhost:3000/api/v1';

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
