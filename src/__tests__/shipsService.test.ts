import { shipsService } from '../services/shipsService';
import { ShipsFilters } from '../types/ships';

describe('shipsService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchShips', () => {
    it('should fetch ships with pagination', async () => {
      const mockResponse = {
        ships: [
          {
            id: '1',
            name: 'Ship 1',
            cargo_type: 'container' as const,
            arrival_date: '2024-01-01T10:00:00Z',
            status: 'on_dock' as const,
            expected_arrival_time: null,
            is_expected_arrival: false,
          },
        ],
        total: 100,
        page: 1,
        pageSize: 20,
        totalPages: 5,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await shipsService.fetchShips(1, 20);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ships?page=1&pageSize=20')
      );
    });

    it('should apply filters to API request', async () => {
      const filters: ShipsFilters = {
        arrivalDateFrom: '2024-01-01',
        arrivalDateTo: '2024-01-31',
        cargoType: 'container',
        status: 'on_dock',
        isExpectedArrival: true,
      };

      const mockResponse = {
        ships: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await shipsService.fetchShips(1, 20, filters);

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('arrivalDateFrom=2024-01-01');
      expect(callUrl).toContain('arrivalDateTo=2024-01-31');
      expect(callUrl).toContain('cargoType=container');
      expect(callUrl).toContain('status=on_dock');
      expect(callUrl).toContain('isExpectedArrival=true');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(shipsService.fetchShips(1, 20)).rejects.toThrow('API error');
    });

    it('should apply sorting parameters', async () => {
      const mockResponse = {
        ships: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await shipsService.fetchShips(1, 20, undefined, 'arrival_date', 'desc');

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('sortBy=arrival_date');
      expect(callUrl).toContain('sortOrder=desc');
    });
  });

  describe('fetchShipById', () => {
    it('should fetch a single ship by ID', async () => {
      const mockShip = {
        id: '1',
        name: 'Test Ship',
        cargo_type: 'bulk' as const,
        arrival_date: '2024-01-15T14:30:00Z',
        status: 'at_anchor' as const,
        expected_arrival_time: '2024-01-16T08:00:00Z',
        is_expected_arrival: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockShip,
      });

      const result = await shipsService.fetchShipById('1');

      expect(result).toEqual(mockShip);
      expect(global.fetch).toHaveBeenCalledWith('/api/ships/1');
    });

    it('should handle fetch errors for single ship', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(shipsService.fetchShipById('999')).rejects.toThrow('API error');
    });
  });
});
