import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Pagination as PaginationType } from '@/services/searchService';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, total_pages, has_previous, has_next } = pagination;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (total_pages <= maxPagesToShow) {
      // If we have fewer pages than our maximum, show all pages
      for (let i = 1; i <= total_pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of page range
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(total_pages - 1, page + 1);
      
      // Adjust if we're at the start or end
      if (page <= 2) {
        endPage = Math.min(total_pages - 1, maxPagesToShow - 1);
      } else if (page >= total_pages - 1) {
        startPage = Math.max(2, total_pages - maxPagesToShow + 2);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < total_pages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page if we have more than one page
      if (total_pages > 1) {
        pageNumbers.push(total_pages);
      }
    }
    
    return pageNumbers;
  };

  if (total_pages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center mt-8" aria-label="Pagination">
      <button
        onClick={() => has_previous && onPageChange(page - 1)}
        disabled={!has_previous}
        className={`flex items-center justify-center px-3 py-2 rounded-md mr-2 ${
          has_previous
            ? 'text-gray-700 bg-white hover:bg-gray-100 border border-gray-300'
            : 'text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200'
        }`}
        aria-label="Previous page"
      >
        <FiChevronLeft className="w-5 h-5" />
        <span className="sr-only">Previous</span>
      </button>
      
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((pageNumber, index) => (
          <React.Fragment key={index}>
            {pageNumber === '...' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => typeof pageNumber === 'number' && onPageChange(pageNumber)}
                className={`px-3 py-2 rounded-md ${
                  pageNumber === page
                    ? 'bg-primary text-white font-medium'
                    : 'text-gray-700 bg-white hover:bg-gray-100 border border-gray-300'
                }`}
                aria-current={pageNumber === page ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <button
        onClick={() => has_next && onPageChange(page + 1)}
        disabled={!has_next}
        className={`flex items-center justify-center px-3 py-2 rounded-md ml-2 ${
          has_next
            ? 'text-gray-700 bg-white hover:bg-gray-100 border border-gray-300'
            : 'text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200'
        }`}
        aria-label="Next page"
      >
        <FiChevronRight className="w-5 h-5" />
        <span className="sr-only">Next</span>
      </button>
    </nav>
  );
};

export default Pagination;
