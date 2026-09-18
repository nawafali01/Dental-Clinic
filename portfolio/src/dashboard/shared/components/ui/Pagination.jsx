import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Reusable Pagination Component
 *
 * Props:
 *  - currentPage   : number (1-indexed)
 *  - totalPages    : number
 *  - totalItems    : number
 *  - pageSize      : number
 *  - onPageChange  : (page: number) => void
 *  - className     : string (optional)
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
  itemLabel = 'records',
}) {
  if (!totalItems || totalItems === 0) return null;

  const safeTotal = Math.max(1, totalPages);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem   = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show (window of 5 around current page)
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const left  = Math.max(1, currentPage - delta);
    const right = Math.min(safeTotal, currentPage + delta);

    if (left > 1) {
      range.push(1);
      if (left > 2) range.push('...');
    }
    for (let i = left; i <= right; i++) range.push(i);
    if (right < safeTotal) {
      if (right < safeTotal - 1) range.push('...');
      range.push(safeTotal);
    }
    return range;
  };

  // Only show nav buttons + page numbers when there are multiple pages
  const multiPage = safeTotal > 1;

  const btnBase =
    'flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer select-none';
  const btnActive =
    'bg-primary text-white shadow-sm shadow-primary/30';
  const btnNormal =
    'text-slate-500 hover:bg-slate-100 hover:text-slate-800';
  const btnDisabled =
    'text-slate-300 cursor-not-allowed pointer-events-none';

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 ${className}`}>
      {/* Result count */}
      <p className="text-[11px] text-slate-400 font-medium">
        Showing{' '}
        <span className="font-bold text-slate-600">{startItem}–{endItem}</span>
        {' '}of{' '}
        <span className="font-bold text-slate-600">{totalItems}</span>
        {' '}{itemLabel}
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnNormal}`}
          title="First page"
          aria-label="Go to first page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnNormal}`}
          title="Previous page"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="w-8 text-center text-xs text-slate-400 select-none">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`${btnBase} ${page === currentPage ? btnActive : btnNormal}`}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === safeTotal}
          className={`${btnBase} ${currentPage === safeTotal ? btnDisabled : btnNormal}`}
          title="Next page"
          aria-label="Go to next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(safeTotal)}
          disabled={currentPage === safeTotal}
          className={`${btnBase} ${currentPage === safeTotal ? btnDisabled : btnNormal}`}
          title="Last page"
          aria-label="Go to last page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
