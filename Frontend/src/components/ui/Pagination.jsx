import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Select } from './Select';
import { cn } from '@/lib/utils';
export function Pagination({ currentPage, totalPages, onPageChange, pageSize = 10, totalItems, onPageSizeChange, pageSizeOptions = [10, 25, 50, 100], className, }) {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }
        else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            }
            else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            }
            else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };
    if (totalPages <= 1 && !totalItems)
        return null;
    return (<div className={cn("flex flex-col sm:flex-row items-center justify-between px-2 py-3 gap-4 select-none", className)}>
      <div className="flex-1 flex justify-between sm:hidden w-full">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="h-9 px-4 rounded-control border border-line-strong bg-white text-caption font-semibold text-ink disabled:opacity-40">
          Previous
        </button>
        <span className="num text-caption font-semibold self-center">
          {currentPage} / {totalPages}
        </span>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="h-9 px-4 rounded-control border border-line-strong bg-white text-caption font-semibold text-ink disabled:opacity-40">
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
        <div>
          {totalItems !== undefined && (<p className="text-caption text-ink-soft">
              Showing <span className="num font-semibold text-ink">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="num font-semibold text-ink">
                {Math.min(currentPage * pageSize, totalItems)}
              </span>{' '}
              of <span className="num font-semibold text-ink">{totalItems}</span> results
            </p>)}
        </div>
        
        <div className="flex items-center space-x-4">
          {onPageSizeChange && (<div className="flex items-center space-x-2">
              <span className="text-caption text-ink-soft">Rows per page</span>
              <Select value={pageSize.toString()} onChange={(e) => onPageSizeChange(Number(e.target.value))} options={pageSizeOptions.map(o => ({ label: o.toString(), value: o }))} inputSize="sm" className="w-20"/>
            </div>)}
          
          <nav aria-label="Pagination" className="flex items-center gap-1">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="size-9 rounded-control flex items-center justify-center border border-line-mid bg-white text-ink-soft hover:bg-fog disabled:opacity-40 disabled:hover:bg-white" aria-label="Previous page">
              <ChevronLeft className="size-4"/>
            </button>
            
            {getPageNumbers().map((page, index) => {
            if (page === '...') {
                return (<span key={`ellipsis-${index}`} className="size-9 flex items-center justify-center text-ink-soft">
                    <MoreHorizontal className="size-4"/>
                  </span>);
            }
            const isCurrent = currentPage === page;
            return (<button key={`page-${page}`} onClick={() => onPageChange(page)} aria-current={isCurrent ? 'page' : undefined} className={cn("num size-9 rounded-control text-sm font-semibold transition-colors", isCurrent
                    ? "bg-royal text-white shadow-sm"
                    : "text-ink-soft hover:bg-fog hover:text-ink")}>
                  {page}
                </button>);
        })}
            
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="size-9 rounded-control flex items-center justify-center border border-line-mid bg-white text-ink-soft hover:bg-fog disabled:opacity-40 disabled:hover:bg-white" aria-label="Next page">
              <ChevronRight className="size-4"/>
            </button>
          </nav>
        </div>
      </div>
    </div>);
}
