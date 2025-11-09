import { Ship, CargoTypeOption, StatusOption } from '../types/ships';

export const CARGO_TYPES: CargoTypeOption[] = [
  { value: 'container', label: 'Container' },
  { value: 'bulk', label: 'Bulk' },
  { value: 'breakbulk', label: 'Breakbulk' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'roll_on_roll_off', label: 'Roll-on/Roll-off' },
  { value: 'other', label: 'Other' },
];

export const STATUSES: StatusOption[] = [
  { value: 'on_dock', label: 'On Dock' },
  { value: 'at_anchor', label: 'Still at Anchor' },
];

export function formatCargoType(cargoType: Ship['cargo_type']): string {
  const option = CARGO_TYPES.find((ct) => ct.value === cargoType);
  return option?.label || cargoType;
}

export function formatStatus(status: Ship['status']): string {
  const option = STATUSES.find((s) => s.value === status);
  return option?.label || status;
}

export function getStatusColor(status: Ship['status']): string {
  switch (status) {
    case 'on_dock':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'at_anchor':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

export function sortShipsByArrivalDate(ships: Ship[], order: 'asc' | 'desc' = 'asc'): Ship[] {
  return [...ships].sort((a, b) => {
    const dateA = new Date(a.arrival_date).getTime();
    const dateB = new Date(b.arrival_date).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

export function formatDateForInput(date: Date | string | null): string {
  if (!date) return '';
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

export function formatDateTimeDisplay(date: string): string {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
}
