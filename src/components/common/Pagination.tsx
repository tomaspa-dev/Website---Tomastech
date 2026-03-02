import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords: number;
  pageSize: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
  pageSize,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3">
      <div className="text-xs text-gray-500">
        Mostrando <span className="font-medium text-gray-300">{startRecord}-{endRecord}</span> de <span className="font-medium text-gray-300">{totalRecords}</span> registros
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Primera página"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {pages.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                currentPage === page
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:bg-white/5 border border-transparent'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Última página"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
