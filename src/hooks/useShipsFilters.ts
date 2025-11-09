import { useState, useCallback } from 'react';
import { Ship, ShipsFilters } from '../types/ships';

export function useShipsFilters() {
  const [filters, setFilters] = useState<ShipsFilters>({
    arrivalDateFrom: null,
    arrivalDateTo: null,
    cargoType: null,
    status: null,
    isExpectedArrival: null,
  });

  const updateFilters = useCallback((newFilters: Partial<ShipsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      arrivalDateFrom: null,
      arrivalDateTo: null,
      cargoType: null,
      status: null,
      isExpectedArrival: null,
    });
  }, []);

  const applyFiltersToShips = useCallback((ships: Ship[]): Ship[] => {
    return ships.filter((ship) => {
      if (filters.arrivalDateFrom) {
        const shipDate = new Date(ship.arrival_date);
        const fromDate = new Date(filters.arrivalDateFrom);
        if (shipDate < fromDate) return false;
      }

      if (filters.arrivalDateTo) {
        const shipDate = new Date(ship.arrival_date);
        const toDate = new Date(filters.arrivalDateTo);
        if (shipDate > toDate) return false;
      }

      if (filters.cargoType && ship.cargo_type !== filters.cargoType) {
        return false;
      }

      if (filters.status && ship.status !== filters.status) {
        return false;
      }

      if (filters.isExpectedArrival !== null && filters.isExpectedArrival !== undefined) {
        if (ship.is_expected_arrival !== filters.isExpectedArrival) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    applyFiltersToShips,
  };
}
