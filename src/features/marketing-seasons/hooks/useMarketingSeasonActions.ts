import { useState } from 'react';
import { marketingSeasonsApi } from '../../../services/api/marketing-seasons';
import type { CreateMarketingSeasonRequestDto, UpdateMarketingSeasonRequestDto } from '../../../types/marketing-seasons';

export const useMarketingSeasonActions = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const createSeason = async (body: CreateMarketingSeasonRequestDto, onSuccess?: () => void) => {
    setIsCreating(true);
    setActionError(null);
    try {
      await marketingSeasonsApi.createMarketingSeason(body);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setActionError(err?.message || 'فشل إنشاء الموسم التسويقي');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const updateSeason = async (id: string, body: UpdateMarketingSeasonRequestDto, onSuccess?: () => void) => {
    setIsUpdating(true);
    setActionError(null);
    try {
      await marketingSeasonsApi.updateMarketingSeason(id, body);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setActionError(err?.message || 'فشل تعديل الموسم التسويقي');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteSeason = async (id: string, onSuccess?: () => void) => {
    setIsDeleting(true);
    setActionError(null);
    try {
      await marketingSeasonsApi.deleteMarketingSeason(id);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setActionError(err?.message || 'فشل حذف الموسم التسويقي');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  const activateSeason = async (id: string, onSuccess?: () => void) => {
    setIsActivating(true);
    setActionError(null);
    try {
      await marketingSeasonsApi.activateMarketingSeason(id);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setActionError(err?.message || 'فشل تفعيل الموسم التسويقي');
      throw err;
    } finally {
      setIsActivating(false);
    }
  };

  const clearActionError = () => setActionError(null);

  return {
    createSeason,
    updateSeason,
    deleteSeason,
    activateSeason,
    isCreating,
    isUpdating,
    isDeleting,
    isActivating,
    actionError,
    clearActionError,
  };
};
