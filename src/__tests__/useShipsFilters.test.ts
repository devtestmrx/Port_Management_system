import { renderHook, act } from '@testing-library/react';
import { useShipsFilters } from '../hooks/useShipsFilters';
import { Ship } from '../types/ships';

describe('useShipsFilters', () => {
  const mockShips: Ship[] = [
    {
      id: '1',
      name: 'Ship A',
      cargo_type: 'container',
      arrival_date: '2024-01-15T10:00:00Z',
      status: 'on_dock',
      expected_arrival_time: null,
      is_expected_arrival: false,
    },
    {
      id: '2',
      name: 'Ship B',
      cargo_type: 'bulk',
      arrival_date: '2024-01-20T10:00:00Z',
      status: 'at_anchor',
      expected_arrival_time: '2024-01-21T08:00:00Z',
      is_expected_arrival: true,
    },
    {
      id: '3',
      name: 'Ship C',
      cargo_type: 'container',
      arrival_date: '2024-02-01T10:00:00Z',
      status: 'on_dock',
      expected_arrival_time: null,
      is_expected_arrival: false,
    },
  ];

  it('should initialize with empty filters', () => {
    const { result } = renderHook(() => useShipsFilters());

    expect(result.current.filters).toEqual({
      arrivalDateFrom: null,
      arrivalDateTo: null,
      cargoType: null,
      status: null,
      isExpectedArrival: null,
    });
  });

  it('should update filters', () => {
    const { result } = renderHook(() => useShipsFilters());

    act(() => {
      result.current.updateFilters({ cargoType: 'container' });
    });

    expect(result.current.filters.cargoType).toBe('container');
  });

  it('should filter ships by cargo type', () => {
    const { result } = renderHook(() => useShipsFilters());

    act(() => {
      result.current.updateFilters({ cargoType: 'container' });
    });

    const filtered = result.current.applyFiltersToShips(mockShips);
    expect(filtered.length).toBe(2);
    expect(filtered.every((s) => s.cargo_type === 'container')).toBe(true);
  });

  it('should filter ships by status', () => {
    const { result } = renderHook(() => useShipsFilters());

    act(() => {
      result.current.updateFilters({ status: 'on_dock' });
    });

    const filtered = result.current.applyFiltersToShips(mockShips);
    expect(filtered.length).toBe(2);
    expect(filtered.every((s) => s.status === 'on_dock')).toBe(true);
  });

  it('should filter ships by expected arrival', () => {
    const { result } = renderHook(() => useShipsFilters());

    act(() => {
      result.current.updateFilters({ isExpectedArrival: true });
    });

    const filtered = result.current.applyFiltersToShips(mockShips);
    expect(filtered.length).toBe(1);
    expect(filtered[0].is_expected_arrival).toBe(true);
  });

  it('should filter ships by arrival date range', () => {
    const { result } = renderHook(() => useShipsFilters());

    act(() => {
      result.current.updateFilters({
        arrivalDateFrom: '2024-01-16',
        arrivalDateTo: '2024-01-31',
      });
    });

    const filtered = result.current.applyFiltersToShips(mockShips);
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('2');
  });

  it('should apply multiple filters together', () => {
    const { result } = renderHook(() => useShipsFilters());

    act(() => {
      result.current.updateFilters({
        cargoType: 'container',
        status: 'on_dock',
        arrivalDateFrom: '2024-01-01',
        arrivalDateTo: '2024-01-31',
      });
    });

    const filtered = result.current.applyFiltersToShips(mockShips);
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should reset filters', () => {
    const { result } = renderHook(() => useShipsFilters());

    act(() => {
      result.current.updateFilters({
        cargoType: 'container',
        status: 'on_dock',
      });
    });

    expect(result.current.filters.cargoType).toBe('container');

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters).toEqual({
      arrivalDateFrom: null,
      arrivalDateTo: null,
      cargoType: null,
      status: null,
      isExpectedArrival: null,
    });
  });

  it('should return all ships when no filters applied', () => {
    const { result } = renderHook(() => useShipsFilters());

    const filtered = result.current.applyFiltersToShips(mockShips);
    expect(filtered.length).toBe(mockShips.length);
  });
});
