interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  disabled?: boolean;
  onPageChange: (newPage: number) => void;
}

export const Pagination = ({ page, pageSize, total, disabled = false, onPageChange }: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="admin-pagination">
      <span className="admin-pagination-info">
        {total > 0 ? `عرض ${from}–${to} من ${total}` : 'لا توجد نتائج'}
      </span>
      <button
        className="admin-pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        title={disabled ? 'وضع مشاهدة فقط' : ''}
      >
        السابق
      </button>
      <span className="admin-pagination-info">صفحة {page} / {totalPages}</span>
      <button
        className="admin-pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        title={disabled ? 'وضع مشاهدة فقط' : ''}
      >
        التالي
      </button>
    </div>
  );
};
