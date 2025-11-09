import { ShipsFilters } from '../../types/ships';
import { CARGO_TYPES, STATUSES, formatDateForInput } from '../../utils/shipUtils';
import { X } from 'lucide-react';

interface FilterPanelProps {
  filters: ShipsFilters;
  onFiltersChange: (filters: Partial<ShipsFilters>) => void;
  onReset: () => void;
  onClose?: () => void;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onReset,
  onClose,
}: FilterPanelProps) {
  const handleArrivalDateFromChange = (value: string) => {
    onFiltersChange({ arrivalDateFrom: value || null });
  };

  const handleArrivalDateToChange = (value: string) => {
    onFiltersChange({ arrivalDateTo: value || null });
  };

  const handleCargoTypeChange = (value: string) => {
    onFiltersChange({ cargoType: value || null });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ status: value || null });
  };

  const handleExpectedArrivalChange = (value: string) => {
    if (value === '') {
      onFiltersChange({ isExpectedArrival: null });
    } else {
      onFiltersChange({ isExpectedArrival: value === 'true' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Filters</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="arrival-from" className="block text-sm font-medium text-slate-700 mb-2">
            Arrival Date From
          </label>
          <input
            id="arrival-from"
            type="date"
            value={formatDateForInput(filters.arrivalDateFrom)}
            onChange={(e) => handleArrivalDateFromChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by arrival date from"
          />
        </div>

        <div>
          <label htmlFor="arrival-to" className="block text-sm font-medium text-slate-700 mb-2">
            Arrival Date To
          </label>
          <input
            id="arrival-to"
            type="date"
            value={formatDateForInput(filters.arrivalDateTo)}
            onChange={(e) => handleArrivalDateToChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by arrival date to"
          />
        </div>

        <div>
          <label htmlFor="cargo-type" className="block text-sm font-medium text-slate-700 mb-2">
            Cargo Type
          </label>
          <select
            id="cargo-type"
            value={filters.cargoType || ''}
            onChange={(e) => handleCargoTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by cargo type"
          >
            <option value="">All Cargo Types</option>
            {CARGO_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="expected-arrival" className="block text-sm font-medium text-slate-700 mb-2">
            Expected Arrival
          </label>
          <select
            id="expected-arrival"
            value={
              filters.isExpectedArrival === null
                ? ''
                : filters.isExpectedArrival.toString()
            }
            onChange={(e) => handleExpectedArrivalChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by expected arrival"
          >
            <option value="">All</option>
            <option value="true">Expected Arrival</option>
            <option value="false">Already Arrived</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={onReset}
          className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
