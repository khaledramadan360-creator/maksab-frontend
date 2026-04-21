import { useState } from 'react';
import {
  createClientFromSearch,
  isClientsDuplicateError,
} from '../../../services/api/clients';
import { AuthApiError } from '../../../services/api/auth';
import type {
  ClientDetails,
  CreateClientFromSearchRequest,
  DuplicateCheckResponse,
} from '../../../types/clients';

interface UseCreateClientFromSearchOptions {
  onSuccess?: (client: ClientDetails) => void;
}

type SubmitResult =
  | { ok: true; client: ClientDetails }
  | { ok: false; duplicate: true; duplicateData: DuplicateCheckResponse }
  | { ok: false; duplicate: false; message: string };

export const useCreateClientFromSearch = ({ onSuccess }: UseCreateClientFromSearchOptions = {}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateData, setDuplicateData] = useState<DuplicateCheckResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const submit = async (
    payload: CreateClientFromSearchRequest,
    forceCreateIfDuplicate = false,
  ): Promise<SubmitResult> => {
    setIsSaving(true);
    setErrorMessage('');
    setDuplicateData(null);

    try {
      const response = await createClientFromSearch({
        ...payload,
        forceCreateIfDuplicate,
      });
      const client = response.data;
      onSuccess?.(client);
      return { ok: true, client };
    } catch (error) {
      if (isClientsDuplicateError(error)) {
        setDuplicateData(error.duplicate);
        return {
          ok: false,
          duplicate: true,
          duplicateData: error.duplicate,
        };
      }

      const message = error instanceof AuthApiError ? error.message : 'تعذر حفظ العميل';
      setErrorMessage(message);
      return {
        ok: false,
        duplicate: false,
        message,
      };
    } finally {
      setIsSaving(false);
    }
  };

  const clearDuplicate = () => setDuplicateData(null);
  const clearError = () => setErrorMessage('');

  return {
    submit,
    isSaving,
    duplicateData,
    errorMessage,
    clearDuplicate,
    clearError,
  };
};
