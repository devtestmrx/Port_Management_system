export interface Ship {
  id: string;
  name: string;
  cargo_type: 'container' | 'bulk' | 'breakbulk' | 'automotive' | 'roll_on_roll_off' | 'other';
  arrival_date: string;
  status: 'on_dock' | 'at_anchor';
  expected_arrival_time: string | null;
  is_expected_arrival: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ShipsFilters {
  arrivalDateFrom: string | null;
  arrivalDateTo: string | null;
  cargoType: string | null;
  status: string | null;
  isExpectedArrival: boolean | null;
}

export interface ShipsResponse {
  ships: Ship[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type CargoTypeOption = {
  value: Ship['cargo_type'];
  label: string;
};

export type StatusOption = {
  value: Ship['status'];
  label: string;
};
