import { useEffect, useState } from 'react';
import { Ship as ShipIcon, Filter, Loader } from 'lucide-react';
import { shipsService } from '../../services/shipsService';
import { useShipsFilters } from '../../hooks/useShipsFilters';
import { useShipsPagination } from '../../hooks/useShipsPagination';
import { Ship } from '../../types/ships';
import { FilterPanel } from './FilterPanel';
import { ShipsTable } from './ShipsTable';
import { ShipsCard } from './ShipsCard';

const PAGE_SIZE = 20;

export function ShipsListing() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const { filters, updateFilters, resetFilters, applyFiltersToShips } = useShipsFilters();
  const { currentPage, pageSize, goToPage, nextPage, previousPage, resetPagination } =
    useShipsPagination({ pageSize: PAGE_SIZE, initialPage: 1 });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadShips();
  }, [currentPage, filters, sortOrder]);

  const loadShips = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipsService.fetchShips(
        currentPage,
        pageSize,
        filters,
        'arrival_date',
        sortOrder
      );
      setShips(response.ships);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ships');
      setShips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
    resetPagination();
  };

  const handleResetFilters = () => {
    resetFilters();
    resetPagination();
  };

  const handleSortChange = (order: 'asc' | 'desc') => {
    setSortOrder(order);
    resetPagination();
  };

  const displayedShips = isDesktop ? ships : ships;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShipIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-800">Ships Listing</h1>
      </div>

      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        aria-label="Toggle filters"
      >
        <Filter className="w-4 h-4" />
        Filters
      </button>

      {/* Filters */}
      {(isDesktop || showFilters) && (
        <FilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Loading ships...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && ships.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ShipIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 text-lg">No ships found</p>
          <p className="text-slate-500 text-sm mt-1">
            Try adjusting your filters to see results
          </p>
        </div>
      )}

      {/* Ships Display */}
      {!loading && ships.length > 0 && !error && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <ShipsTable
              ships={displayedShips}
              sortBy="arrival_date"
              sortOrder={sortOrder}
              onSort={handleSortChange}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {displayedShips.map((ship) => (
              <ShipsCard key={ship.id} ship={ship} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-slate-600 order-2 sm:order-1">
              Page <span className="font-semibold">{currentPage}</span> of{' '}
              <span className="font-semibold">{totalPages || 1}</span>
            </div>

            <div className="flex gap-2 order-1 sm:order-2">
              <button
                onClick={previousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                aria-label="Previous page"
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
