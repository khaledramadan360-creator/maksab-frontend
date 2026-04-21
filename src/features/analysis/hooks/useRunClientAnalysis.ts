import { useState } from 'react';
import { runClientAnalysis } from '../../../services/api/analysis';
import { AuthApiError } from '../../../services/api/auth';
import type { ClientAnalysis } from '../../../types/analysis';

type RunResult =
  | { ok: true; analysis: ClientAnalysis }
  | { ok: false; message: string };

export const useRunClientAnalysis = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastAnalysis, setLastAnalysis] = useState<ClientAnalysis | null>(null);

  const run = async (clientId: string): Promise<RunResult> => {
    setIsRunning(true);
    setErrorMessage('');

    try {
      const response = await runClientAnalysis(clientId);
      setLastAnalysis(response.data);
      return { ok: true, analysis: response.data };
    } catch (error) {
      const message =
        error instanceof AuthApiError
          ? error.message
          : 'Unable to run analysis';
      setErrorMessage(message);
      return { ok: false, message };
    } finally {
      setIsRunning(false);
    }
  };

  const clearError = () => setErrorMessage('');

  return {
    run,
    isRunning,
    errorMessage,
    clearError,
    lastAnalysis,
  };
};
