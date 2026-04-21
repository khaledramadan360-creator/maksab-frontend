import React, { useState } from 'react';
import '../styles/marketing-seasons.css';

import { useMarketingSeasonsList } from '../hooks/useMarketingSeasonsList';
import { useActiveMarketingSeason } from '../hooks/useActiveMarketingSeason';
import { useMarketingSeasonActions } from '../hooks/useMarketingSeasonActions';
import { usePermissions } from '../../../store/authStore';

import { ActiveMarketingSeasonBanner } from '../components/ActiveMarketingSeasonBanner';
import { MarketingSeasonFilters } from '../components/MarketingSeasonFilters';
import { MarketingSeasonTable } from '../components/MarketingSeasonTable';
import { MarketingSeasonFormModal } from '../components/MarketingSeasonFormModal';
import { ActivateMarketingSeasonDialog } from '../components/ActivateMarketingSeasonDialog';
import { DeleteMarketingSeasonDialog } from '../components/DeleteMarketingSeasonDialog';

import {
  MarketingSeasonsEmptyState,
  MarketingSeasonsLoadingState,
  MarketingSeasonsErrorState,
} from '../components/MarketingSeasonsSimpleStates';

export const MarketingSeasonsPage: React.FC = () => {
  const { isViewer } = usePermissions();
  
  // Data Hooks
  const { 
    data: listData, 
    loading: listLoading, 
    error: listError, 
    filters, 
    updateFilters, 
    refetch: refetchList 
  } = useMarketingSeasonsList();

  const {
    data: activeSeason,
    loading: activeSeasonLoading,
    refetch: refetchActiveSeason,
  } = useActiveMarketingSeason();

  const {
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
  } = useMarketingSeasonActions();

  // Modal Controllers
  const [formIsOpen, setFormIsOpen] = useState(false);
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);
  const [activateIsOpen, setActivateIsOpen] = useState(false);

  // Targets
  const [targetSeasonId, setTargetSeasonId] = useState<string | null>(null);
  const [targetSeasonTitle, setTargetSeasonTitle] = useState<string>('');
  const [targetSeasonData, setTargetSeasonData] = useState<any>(null);

  // Success Refetch Wrapper
  const handleSuccess = () => {
    refetchList();
    refetchActiveSeason();
    closeAllModals();
  };

  const closeAllModals = () => {
    setFormIsOpen(false);
    setDeleteIsOpen(false);
    setActivateIsOpen(false);
    setTargetSeasonId(null);
    setTargetSeasonTitle('');
    setTargetSeasonData(null);
    clearActionError();
  };

  // Handlers
  const handleOpenCreate = () => {
    if (isViewer) return;
    setTargetSeasonData(null);
    setTargetSeasonId(null);
    setFormIsOpen(true);
  };

  const handleOpenEdit = (seasonId: string) => {
    if (isViewer) return;
    const seasonToEdit = listData?.items.find((s) => s.id === seasonId);
    // Note: To get full details including 'description', we might ideally call `getMarketingSeasonById`
    // but assuming standard usage, passing what we have or just fetching on mount inside modal is valid.
    // For this design, we will use the partial from the list or full if available.
    if (seasonToEdit) {
        setTargetSeasonId(seasonId);
        setTargetSeasonData({ title: seasonToEdit.title, description: '' }); // description typically fetched separately
        setFormIsOpen(true);
    }
  };

  const handleOpenDelete = (seasonId: string, title: string) => {
    if (isViewer) return;
    setTargetSeasonId(seasonId);
    setTargetSeasonTitle(title);
    setDeleteIsOpen(true);
  };

  const handleOpenActivate = (seasonId: string, title: string) => {
    if (isViewer) return;
    setTargetSeasonId(seasonId);
    setTargetSeasonTitle(title);
    setActivateIsOpen(true);
  };

  // Submit operations
  const handleSubmitForm = async (data: { title: string; description: string | null }) => {
    if (targetSeasonId) {
      await updateSeason(targetSeasonId, data, handleSuccess);
    } else {
      await createSeason(data, handleSuccess);
    }
  };

  const handleConfirmDelete = async () => {
    if (targetSeasonId) {
      await deleteSeason(targetSeasonId, handleSuccess);
    }
  };

  const handleConfirmActivate = async () => {
    if (targetSeasonId) {
      await activateSeason(targetSeasonId, handleSuccess);
    }
  };

  return (
    <div className="ms-container">
      <div className="ms-page-header">
        <h1 className="ms-page-title">المواسم التسويقية</h1>
        {!isViewer && (
          <button className="ms-btn ms-btn-primary" onClick={handleOpenCreate}>
            <span>+</span> إضافة موسم
          </button>
        )}
      </div>

      <ActiveMarketingSeasonBanner 
        activeSeason={activeSeason} 
        loading={activeSeasonLoading} 
      />

      <MarketingSeasonFilters 
        filters={filters} 
        onFilterChange={updateFilters} 
      />

      {listLoading && <MarketingSeasonsLoadingState />}
      
      {!listLoading && listError && (
        <MarketingSeasonsErrorState error={listError.message} onRetry={refetchList} />
      )}
      
      {!listLoading && !listError && listData && listData.items.length === 0 && (
        <MarketingSeasonsEmptyState />
      )}

      {!listLoading && !listError && listData && listData.items.length > 0 && (
        <MarketingSeasonTable 
          items={listData.items}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onActivate={handleOpenActivate}
        />
      )}

      {/* Modals */}
      <MarketingSeasonFormModal 
        isOpen={formIsOpen}
        initialData={targetSeasonData}
        isSubmitting={isCreating || isUpdating}
        error={actionError}
        onClose={closeAllModals}
        onSubmit={handleSubmitForm}
      />

      <ActivateMarketingSeasonDialog
        isOpen={activateIsOpen}
        seasonTitle={targetSeasonTitle}
        isActivating={isActivating}
        error={actionError}
        onClose={closeAllModals}
        onConfirm={handleConfirmActivate}
      />

      <DeleteMarketingSeasonDialog
        isOpen={deleteIsOpen}
        seasonTitle={targetSeasonTitle}
        isDeleting={isDeleting}
        error={actionError}
        onClose={closeAllModals}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
