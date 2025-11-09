import {
  formatCargoType,
  formatStatus,
  getStatusColor,
  sortShipsByArrivalDate,
  formatDateForInput,
  formatDateTimeDisplay,
} from '../utils/shipUtils';
import { Ship } from '../types/ships';

describe('shipUtils', () => {
  describe('formatCargoType', () => {
    it('should format cargo types correctly', () => {
      expect(formatCargoType('container')).toBe('Container');
      expect(formatCargoType('bulk')).toBe('Bulk');
      expect(formatCargoType('breakbulk')).toBe('Breakbulk');
      expect(formatCargoType('automotive')).toBe('Automotive');
      expect(formatCargoType('roll_on_roll_off')).toBe('Roll-on/Roll-off');
      expect(formatCargoType('other')).toBe('Other');
    });

    it('should return original value for unknown cargo types', () => {
      expect(formatCargoType('unknown' as any)).toBe('unknown');
    });
  });

  describe('formatStatus', () => {
    it('should format statuses correctly', () => {
      expect(formatStatus('on_dock')).toBe('On Dock');
      expect(formatStatus('at_anchor')).toBe('Still at Anchor');
    });

    it('should return original value for unknown statuses', () => {
      expect(formatStatus('unknown' as any)).toBe('unknown');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for on_dock status', () => {
      const color = getStatusColor('on_dock');
      expect(color).toBe('bg-green-100 text-green-800 border-green-200');
    });

    it('should return correct color for at_anchor status', () => {
      const color = getStatusColor('at_anchor');
      expect(color).toBe('bg-yellow-100 text-yellow-800 border-yellow-200');
    });

    it('should return default color for unknown status', () => {
      const color = getStatusColor('unknown' as any);
      expect(color).toBe('bg-slate-100 text-slate-800 border-slate-200');
    });
  });

  describe('sortShipsByArrivalDate', () => {
    const ships: Ship[] = [
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
        arrival_date: '2024-01-10T10:00:00Z',
        status: 'at_anchor',
        expected_arrival_time: null,
        is_expected_arrival: false,
      },
      {
        id: '3',
        name: 'Ship C',
        cargo_type: 'container',
        arrival_date: '2024-01-20T10:00:00Z',
        status: 'on_dock',
        expected_arrival_time: null,
        is_expected_arrival: false,
      },
    ];

    it('should sort ships in ascending order by default', () => {
      const sorted = sortShipsByArrivalDate(ships);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('3');
    });

    it('should sort ships in descending order', () => {
      const sorted = sortShipsByArrivalDate(ships, 'desc');
      expect(sorted[0].id).toBe('3');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('2');
    });

    it('should not modify original array', () => {
      const originalIds = ships.map((s) => s.id);
      sortShipsByArrivalDate(ships);
      expect(ships.map((s) => s.id)).toEqual(originalIds);
    });
  });

  describe('formatDateForInput', () => {
    it('should format date string for input', () => {
      const result = formatDateForInput('2024-01-15T10:30:00Z');
      expect(result).toBe('2024-01-15');
    });

    it('should format Date object for input', () => {
      const date = new Date('2024-01-15');
      const result = formatDateForInput(date);
      expect(result).toMatch(/2024-01-1[45]/);
    });

    it('should return empty string for null', () => {
      expect(formatDateForInput(null)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(formatDateForInput('')).toBe('');
    });
  });

  describe('formatDateTimeDisplay', () => {
    it('should format date string for display', () => {
      const result = formatDateTimeDisplay('2024-01-15T10:30:00Z');
      expect(result).toContain('2024');
      expect(result).toContain('10');
    });

    it('should handle invalid dates', () => {
      const result = formatDateTimeDisplay('invalid-date');
      expect(result).toBe('invalid-date');
    });
  });
});
