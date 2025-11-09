import { Ship, ShipsFilters, ShipsResponse } from '../types/ships';

const API_BASE = '/api';

export const shipsService = {
  async fetchShips(
    page: number = 1,
    pageSize: number = 20,
    filters?: ShipsFilters,
    sortBy: 'arrival_date' = 'arrival_date',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<ShipsResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      if (filters) {
        if (filters.arrivalDateFrom) {
          params.append('arrivalDateFrom', filters.arrivalDateFrom);
        }
        if (filters.arrivalDateTo) {
          params.append('arrivalDateTo', filters.arrivalDateTo);
        }
        if (filters.cargoType) {
          params.append('cargoType', filters.cargoType);
        }
        if (filters.status) {
          params.append('status', filters.status);
        }
        if (filters.isExpectedArrival !== null && filters.isExpectedArrival !== undefined) {
          params.append('isExpectedArrival', filters.isExpectedArrival.toString());
        }
      }

      const response = await fetch(`${API_BASE}/ships?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json() as ShipsResponse;
      return data;
    } catch (error) {
      console.error('Error fetching ships:', error);
      throw error;
    }
  },

  async fetchShipById(id: string): Promise<Ship> {
    try {
      const response = await fetch(`${API_BASE}/ships/${id}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching ship:', error);
      throw error;
    }
  },
};
