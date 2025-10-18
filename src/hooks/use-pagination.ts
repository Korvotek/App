import { useState, useMemo, useEffect, useCallback } from "react";

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  totalItems?: number;
}

export function usePagination({
  initialPage = 1,
  initialLimit = 12,
  totalItems = 0,
}: UsePaginationOptions = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [totalItemsState, setTotalItemsState] = useState(totalItems);

  useEffect(() => {
    setTotalItemsState(totalItems);
  }, [totalItems]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItemsState / limit);
  }, [totalItemsState, limit]);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  useEffect(() => {
    if (totalItemsState > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalItemsState, totalPages, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const resetPage = () => {
    setCurrentPage(1);
  };

  const setTotalItems = useCallback((value: number) => {
    setTotalItemsState(value);
  }, []);

  return {
    currentPage,
    limit,
    totalPages,
    totalItems: totalItemsState,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPage,
    setTotalItems,
  };
}
