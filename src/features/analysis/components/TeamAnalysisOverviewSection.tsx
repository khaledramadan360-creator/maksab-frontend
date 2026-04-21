import { useMemo, useState } from 'react';
import type { TeamAnalysisOverviewItem } from '../../../types/analysis';
import { AnalysisErrorState } from './AnalysisErrorState';
import { AnalysisLoadingState } from './AnalysisLoadingState';
import { TeamAnalysisEmptyState } from './TeamAnalysisEmptyState';
import {
  TeamAnalysisFilters,
  type TeamAnalysisFilterValues,
} from './TeamAnalysisFilters';
import { TeamAnalysisTable } from './TeamAnalysisTable';
import { useTeamAnalysisOverview } from '../hooks/useTeamAnalysisOverview';
import '../styles/analysis.css';

interface TeamAnalysisOverviewSectionProps {
  isPreviewMode?: boolean;
}

const DEFAULT_FILTERS: TeamAnalysisFilterValues = {
  clientName: '',
  ownerName: '',
  hasAnalysis: 'all',
  analyzedDate: '',
};

const matchDate = (isoValue: string | null, dateOnly: string): boolean => {
  if (!isoValue || !dateOnly) return true;
  return isoValue.slice(0, 10) === dateOnly;
};

const applyFilters = (
  items: TeamAnalysisOverviewItem[],
  filters: TeamAnalysisFilterValues,
) => {
  const clientName = filters.clientName.trim().toLowerCase();
  const ownerName = filters.ownerName.trim().toLowerCase();

  return items.filter((item) => {
    if (clientName && !item.clientName.toLowerCase().includes(clientName)) {
      return false;
    }
    if (ownerName && !item.ownerName.toLowerCase().includes(ownerName)) {
      return false;
    }
    if (filters.hasAnalysis === 'with' && !item.hasAnalysis) {
      return false;
    }
    if (filters.hasAnalysis === 'without' && item.hasAnalysis) {
      return false;
    }
    if (!matchDate(item.analyzedAt, filters.analyzedDate)) {
      return false;
    }
    return true;
  });
};

export const TeamAnalysisOverviewSection = ({
  isPreviewMode = false,
}: TeamAnalysisOverviewSectionProps) => {
  const [filters, setFilters] = useState<TeamAnalysisFilterValues>(DEFAULT_FILTERS);

  const { items, loadState, errorMessage, refetch } = useTeamAnalysisOverview({
    isPreviewMode,
  });

  const filteredItems = useMemo(
    () => applyFilters(items, filters),
    [items, filters],
  );

  const hasActiveFilters = useMemo(() => {
    return (
      filters.clientName.trim().length > 0 ||
      filters.ownerName.trim().length > 0 ||
      filters.hasAnalysis !== 'all' ||
      filters.analyzedDate.trim().length > 0
    );
  }, [filters]);

  return (
    <section className="clients-card analysis-team-section">
      <header className="analysis-section-header">
        <div>
          <h3 className="analysis-title">نظرة عامة على تحليل الفريق</h3>
          <p className="analysis-subtitle">
            {isPreviewMode
              ? 'وضع مشاهدة فقط: بيانات تحليل الفريق الحقيقية مخفية.'
              : 'عرض إداري لجودة وتغطية تحليل العملاء داخل الفريق.'}
          </p>
        </div>
      </header>

      <TeamAnalysisFilters
        values={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        disabled={isPreviewMode}
      />

      {loadState === 'loading' && <AnalysisLoadingState />}

      {loadState === 'error' && (
        <AnalysisErrorState
          message={errorMessage}
          onRetry={refetch}
          disabled={isPreviewMode}
        />
      )}

      {loadState === 'ok' && isPreviewMode && (
        <TeamAnalysisTable items={[]} isPreviewMode />
      )}

      {loadState === 'ok' && !isPreviewMode && filteredItems.length === 0 && (
        <TeamAnalysisEmptyState hasFilters={hasActiveFilters} />
      )}

      {loadState === 'ok' && !isPreviewMode && filteredItems.length > 0 && (
        <TeamAnalysisTable items={filteredItems} />
      )}
    </section>
  );
};
