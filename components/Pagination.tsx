import React from 'react';
import { useTranslation } from '@/i18n';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (pageNumber: number) => void;
  className?: string;
}

const PaginationButton: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, active, children }) => {
  const baseClasses = 'mx-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50';
  const activeClasses = 'bg-primary text-white';
  const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-100';
  const disabledClasses = 'bg-gray-100 text-gray-400 cursor-not-allowed';

  let finalClasses = `${baseClasses} `;
  if (disabled) {
    finalClasses += disabledClasses;
  } else if (active) {
    finalClasses += activeClasses;
  } else {
    finalClasses += inactiveClasses;
  }

  return (
    <button onClick={onClick} disabled={disabled} className={finalClasses}>
      {children}
    </button>
  );
};

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange, className = '' }) => {
  const { t } = useTranslation();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const pageRangeDisplayed = 2;
    let startPage = Math.max(2, currentPage - pageRangeDisplayed);
    let endPage = Math.min(totalPages - 1, currentPage + pageRangeDisplayed);

    pageNumbers.push(1);

    if (startPage > 2) {
      pageNumbers.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    if (totalPages > 1) {
        pageNumbers.push(totalPages);
    }

    return [...new Set(pageNumbers)]; // Remove duplicates
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex justify-center items-center py-4 px-2 ${className}`}>
      <PaginationButton onClick={handlePrevious} disabled={currentPage === 1}>
        {t('common.pagination.previous')}
      </PaginationButton>
      <div className="flex items-center">
        {pageNumbers.map((number, index) =>
          typeof number === 'number' ? (
            <PaginationButton
              key={index}
              onClick={() => onPageChange(number)}
              active={currentPage === number}
            >
              {number}
            </PaginationButton>
          ) : (
            <span key={index} className="px-3 py-1.5 text-sm font-medium text-gray-500">
              {number}
            </span>
          )
        )}
      </div>
      <PaginationButton onClick={handleNext} disabled={currentPage === totalPages}>
        {t('common.pagination.next')}
      </PaginationButton>
    </div>
  );
};
