export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'landing_clerk' | 'yard_operator' | 'manager' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'landing_clerk' | 'yard_operator' | 'manager' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'landing_clerk' | 'yard_operator' | 'manager' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      zones: {
        Row: {
          id: string
          zone_code: string
          description: string
          capacity: number
          current_occupancy: number
          zone_type: 'container' | 'bulk' | 'general' | 'refrigerated'
          status: 'active' | 'inactive' | 'maintenance'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          zone_code: string
          description?: string
          capacity?: number
          current_occupancy?: number
          zone_type?: 'container' | 'bulk' | 'general' | 'refrigerated'
          status?: 'active' | 'inactive' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          zone_code?: string
          description?: string
          capacity?: number
          current_occupancy?: number
          zone_type?: 'container' | 'bulk' | 'general' | 'refrigerated'
          status?: 'active' | 'inactive' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
      }
      goods_landing: {
        Row: {
          id: string
          goods_id: string
          arrival_time: string
          origin: string
          transport_mode: 'ship' | 'truck' | 'rail' | 'air'
          quantity: number
          unit_type: 'container' | 'pallet' | 'ton' | 'cubic_meter'
          goods_type: string
          status: 'landed' | 'placed' | 'in_transit' | 'departed'
          vessel_name: string
          landing_clerk_id: string | null
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          goods_id: string
          arrival_time?: string
          origin?: string
          transport_mode: 'ship' | 'truck' | 'rail' | 'air'
          quantity?: number
          unit_type?: 'container' | 'pallet' | 'ton' | 'cubic_meter'
          goods_type?: string
          status?: 'landed' | 'placed' | 'in_transit' | 'departed'
          vessel_name?: string
          landing_clerk_id?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          goods_id?: string
          arrival_time?: string
          origin?: string
          transport_mode?: 'ship' | 'truck' | 'rail' | 'air'
          quantity?: number
          unit_type?: 'container' | 'pallet' | 'ton' | 'cubic_meter'
          goods_type?: string
          status?: 'landed' | 'placed' | 'in_transit' | 'departed'
          vessel_name?: string
          landing_clerk_id?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      goods_placement: {
        Row: {
          id: string
          goods_landing_id: string
          zone_id: string
          rack_number: string
          placement_time: string
          operator_id: string | null
          placement_type: 'initial' | 'relocated'
          status: 'active' | 'moved' | 'departed'
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          goods_landing_id: string
          zone_id: string
          rack_number?: string
          placement_time?: string
          operator_id?: string | null
          placement_type?: 'initial' | 'relocated'
          status?: 'active' | 'moved' | 'departed'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          goods_landing_id?: string
          zone_id?: string
          rack_number?: string
          placement_time?: string
          operator_id?: string | null
          placement_type?: 'initial' | 'relocated'
          status?: 'active' | 'moved' | 'departed'
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      movements: {
        Row: {
          id: string
          goods_landing_id: string
          from_zone_id: string | null
          to_zone_id: string
          from_rack: string
          to_rack: string
          movement_time: string
          operator_id: string | null
          reason: string
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          goods_landing_id: string
          from_zone_id?: string | null
          to_zone_id: string
          from_rack?: string
          to_rack?: string
          movement_time?: string
          operator_id?: string | null
          reason?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          goods_landing_id?: string
          from_zone_id?: string | null
          to_zone_id?: string
          from_rack?: string
          to_rack?: string
          movement_time?: string
          operator_id?: string | null
          reason?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          equipment_code: string
          equipment_type: 'crane' | 'forklift' | 'reach_stacker' | 'truck'
          status: 'available' | 'in_use' | 'maintenance' | 'out_of_service'
          current_operator_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          equipment_code: string
          equipment_type: 'crane' | 'forklift' | 'reach_stacker' | 'truck'
          status?: 'available' | 'in_use' | 'maintenance' | 'out_of_service'
          current_operator_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          equipment_code?: string
          equipment_type?: 'crane' | 'forklift' | 'reach_stacker' | 'truck'
          status?: 'available' | 'in_use' | 'maintenance' | 'out_of_service'
          current_operator_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          table_name: string
          record_id: string
          operation: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data: Json | null
          new_data: Json | null
          user_id: string | null
          timestamp: string
          ip_address: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          operation: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          user_id?: string | null
          timestamp?: string
          ip_address?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          operation?: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          user_id?: string | null
          timestamp?: string
          ip_address?: string
        }
      }
    }
  }
}
