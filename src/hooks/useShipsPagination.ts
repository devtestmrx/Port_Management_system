import { useState, useCallback } from 'react';

export interface UsePaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

export function useShipsPagination(options?: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(options?.initialPage ?? 1);
  const pageSize = options?.pageSize ?? 20;

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const previousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(options?.initialPage ?? 1);
  }, [options?.initialPage]);

  return {
    currentPage,
    pageSize,
    goToPage,
    nextPage,
    previousPage,
    resetPagination,
  };
}
