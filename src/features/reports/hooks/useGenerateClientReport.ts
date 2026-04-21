import { useState } from 'react';
import { generateClientReport } from '../../../services/api/reports';
import { AuthApiError } from '../../../services/api/auth';
import type { ClientReport } from '../../../types/reports';

type GenerateResult =
  | { ok: true; report: ClientReport }
  | { ok: false; message: string };

export const useGenerateClientReport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const generate = async (clientId: string): Promise<GenerateResult> => {
    setIsGenerating(true);
    setErrorMessage('');

    try {
      const response = await generateClientReport(clientId);
      return { ok: true, report: response.data };
    } catch (error) {
      const message =
        error instanceof AuthApiError ? error.message : 'تعذر إنشاء التقرير.';
      setErrorMessage(message);
      return { ok: false, message };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generate,
    isGenerating,
    errorMessage,
    clearError: () => setErrorMessage(''),
  };
};
