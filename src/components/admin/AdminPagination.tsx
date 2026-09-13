import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

function pageOptions(page: number, totalPages: number): Array<number | 'ellipsis'> {
  const visible = new Set([1, totalPages, page - 1, page, page + 1]);
  const ordered = [...visible]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  return ordered.flatMap((value, index) => {
    const previous = ordered[index - 1];
    return previous && value - previous > 1 ? ['ellipsis' as const, value] : [value];
  });
}

export default function AdminPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'records',
}: AdminPaginationProps) {
  if (totalItems === 0) return null;

  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const firstItem = (safePage - 1) * pageSize + 1;
  const lastItem = Math.min(safePage * pageSize, totalItems);

  return (
    <nav aria-label={`${itemLabel} pagination`} className="admin-pagination">
      <p className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
        Showing <span className="font-bold text-slate-900 dark:text-neutral-100">{firstItem}–{lastItem}</span> of{' '}
        <span className="font-bold text-slate-900 dark:text-neutral-100">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1" aria-label={`Page ${safePage} of ${safeTotalPages}`}>
        <button type="button" onClick={() => onPageChange(safePage - 1)} disabled={safePage === 1} className="admin-page-button" aria-label="Previous page">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {pageOptions(safePage, safeTotalPages).map((option, index) => option === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="flex h-8 w-7 items-center justify-center text-xs text-slate-400">…</span>
        ) : (
          <button type="button" key={option} onClick={() => onPageChange(option)} aria-current={option === safePage ? 'page' : undefined} className={`admin-page-button ${option === safePage ? 'admin-page-button-active' : ''}`}>
            {option}
          </button>
        ))}

        <button type="button" onClick={() => onPageChange(safePage + 1)} disabled={safePage === safeTotalPages} className="admin-page-button" aria-label="Next page">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </nav>
  );
}
