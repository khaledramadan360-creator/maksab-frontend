interface ReportsListEmptyStateProps {
  hasFilters?: boolean;
}

export const ReportsListEmptyState = ({
  hasFilters = false,
}: ReportsListEmptyStateProps) => {
  return (
    <div className="reports-state reports-empty">
      <p>
        {hasFilters
          ? 'لا توجد تقارير مطابقة للفلاتر الحالية.'
          : 'لا توجد تقارير محفوظة حتى الآن.'}
      </p>
    </div>
  );
};
