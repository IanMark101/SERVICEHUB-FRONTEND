import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  variant?: 'seeker' | 'provider';
}

export default function PaginationBar({
  currentPage,
  totalPages,
  goToPage,
  nextPage,
  prevPage,
  startIndex,
  endIndex,
  totalItems,
  variant = 'seeker'
}: PaginationBarProps) {
  const { isDark } = useApp();

  if (totalItems === 0) return null;

  const actualEndIndex = Math.min(endIndex, totalItems);
  const actualStartIndex = totalItems === 0 ? 0 : startIndex + 1;

  // Generate page numbers with ellipses
  const getPages = () => {
    const pages: (number | string)[] = [];
    const range = 1; // Show 1 page on either side of current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const pages = getPages();

  const isSeeker = variant === 'seeker';
  const activeBgClass = isSeeker 
    ? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700' 
    : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700';
  
  const textClass = isSeeker
    ? 'text-orange-550 dark:text-orange-400'
    : 'text-emerald-600 dark:text-emerald-400';

  const hoverBorderClass = isSeeker
    ? 'hover:border-orange-500/50 hover:text-orange-500'
    : 'hover:border-emerald-500/50 hover:text-emerald-500';

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[24px] border transition-colors duration-200 select-none ${
      isDark ? 'bg-[#22211e]/60 border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-500'
    }`}>
      {/* Items Counter Info */}
      <div className="text-xs font-semibold">
        Showing <span className={`font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>{actualStartIndex}</span> to{' '}
        <span className={`font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>{actualEndIndex}</span> of{' '}
        <span className={`font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>{totalItems}</span> results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1.5">
        {/* Previous Button */}
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`p-2 border rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center ${
            isDark 
              ? 'border-neutral-800 bg-[#1c1b18] text-[#b4b0a9] hover:bg-[#2c2b27]' 
              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
          }`}
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page Buttons */}
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-xs font-extrabold"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => goToPage(pageNum)}
              className={`w-8 h-8 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center cursor-pointer ${
                isActive
                  ? activeBgClass
                  : isDark
                    ? `border-neutral-800 bg-[#1c1b18] text-[#b4b0a9] hover:bg-[#2c2b27] ${hoverBorderClass}`
                    : `border-slate-200 bg-white text-slate-500 hover:bg-slate-50 ${hoverBorderClass}`
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`p-2 border rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center ${
            isDark 
              ? 'border-neutral-800 bg-[#1c1b18] text-[#b4b0a9] hover:bg-[#2c2b27]' 
              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
          }`}
          title="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
