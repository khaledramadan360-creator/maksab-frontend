interface TeamAnalysisEmptyStateProps {
  hasFilters?: boolean;
}

export const TeamAnalysisEmptyState = ({
  hasFilters = false,
}: TeamAnalysisEmptyStateProps) => {
  return (
    <div className="analysis-state analysis-empty">
      <p>
        {hasFilters
          ? 'لا توجد نتائج تحليل مطابقة للفلاتر الحالية.'
          : 'لا توجد بيانات تحليل فريق متاحة حتى الآن.'}
      </p>
    </div>
  );
};
