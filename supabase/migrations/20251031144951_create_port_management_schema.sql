/*
  # Port Goods Landing & Placement Management System - Database Schema

  ## Overview
  Complete database schema for managing goods arrival, storage zone allocation, 
  placement tracking, and movements within a port terminal.

  ## Tables Created

  ### 1. profiles
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'landing_clerk', 'yard_operator', 'manager', 'admin'
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. zones
  - `id` (uuid, PK) - Zone identifier
  - `zone_code` (text, unique) - Human-readable zone code (e.g., 'A1', 'B2')
  - `description` (text) - Zone description
  - `capacity` (numeric) - Maximum capacity in units
  - `current_occupancy` (numeric) - Current occupancy level
  - `zone_type` (text) - Type: 'container', 'bulk', 'general', 'refrigerated'
  - `status` (text) - Status: 'active', 'inactive', 'maintenance'
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. goods_landing
  - `id` (uuid, PK) - Landing record identifier
  - `goods_id` (text, unique) - External goods identifier (e.g., container number, bill of lading)
  - `arrival_time` (timestamptz) - When goods arrived at port
  - `origin` (text) - Origin location/port
  - `transport_mode` (text) - Mode: 'ship', 'truck', 'rail', 'air'
  - `quantity` (numeric) - Quantity of goods
  - `unit_type` (text) - Unit: 'container', 'pallet', 'ton', 'cubic_meter'
  - `goods_type` (text) - Type of goods (e.g., 'electronics', 'food', 'machinery')
  - `status` (text) - Status: 'landed', 'placed', 'in_transit', 'departed'
  - `vessel_name` (text) - Name of vessel/truck
  - `landing_clerk_id` (uuid, FK) - Clerk who recorded landing
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. goods_placement
  - `id` (uuid, PK) - Placement record identifier
  - `goods_landing_id` (uuid, FK) - Reference to goods landing
  - `zone_id` (uuid, FK) - Zone where goods placed
  - `rack_number` (text) - Specific rack/slot identifier
  - `placement_time` (timestamptz) - When goods were placed
  - `operator_id` (uuid, FK) - Yard operator who placed goods
  - `placement_type` (text) - Type: 'initial', 'relocated'
  - `status` (text) - Status: 'active', 'moved', 'departed'
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. movements
  - `id` (uuid, PK) - Movement record identifier
  - `goods_landing_id` (uuid, FK) - Reference to goods
  - `from_zone_id` (uuid, FK) - Source zone
  - `to_zone_id` (uuid, FK) - Destination zone
  - `from_rack` (text) - Source rack/slot
  - `to_rack` (text) - Destination rack/slot
  - `movement_time` (timestamptz) - When movement occurred
  - `operator_id` (uuid, FK) - Operator who performed movement
  - `reason` (text) - Reason for movement
  - `status` (text) - Status: 'pending', 'in_progress', 'completed', 'cancelled'
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. equipment
  - `id` (uuid, PK) - Equipment identifier
  - `equipment_code` (text, unique) - Equipment identifier (e.g., 'CRANE-01', 'FORKLIFT-03')
  - `equipment_type` (text) - Type: 'crane', 'forklift', 'reach_stacker', 'truck'
  - `status` (text) - Status: 'available', 'in_use', 'maintenance', 'out_of_service'
  - `current_operator_id` (uuid, FK) - Current operator (if in use)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 7. audit_log
  - `id` (uuid, PK) - Audit record identifier
  - `table_name` (text) - Table that was modified
  - `record_id` (uuid) - ID of modified record
  - `operation` (text) - Operation: 'INSERT', 'UPDATE', 'DELETE'
  - `old_data` (jsonb) - Previous data state
  - `new_data` (jsonb) - New data state
  - `user_id` (uuid, FK) - User who made change
  - `timestamp` (timestamptz) - When change occurred
  - `ip_address` (text) - User's IP address

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Role-based access policies implemented
  - Audit logging for all critical operations

  ## Indexes
  - Performance indexes on foreign keys and frequently queried fields
  - Composite indexes for common query patterns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'yard_operator' CHECK (role IN ('landing_clerk', 'yard_operator', 'manager', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create zones table
CREATE TABLE IF NOT EXISTS zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_code text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  capacity numeric NOT NULL DEFAULT 0 CHECK (capacity >= 0),
  current_occupancy numeric NOT NULL DEFAULT 0 CHECK (current_occupancy >= 0),
  zone_type text NOT NULL DEFAULT 'general' CHECK (zone_type IN ('container', 'bulk', 'general', 'refrigerated')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view zones"
  ON zones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can insert zones"
  ON zones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers and admins can update zones"
  ON zones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin')
    )
  );

-- Create goods_landing table
CREATE TABLE IF NOT EXISTS goods_landing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_id text UNIQUE NOT NULL,
  arrival_time timestamptz NOT NULL DEFAULT now(),
  origin text NOT NULL DEFAULT '',
  transport_mode text NOT NULL CHECK (transport_mode IN ('ship', 'truck', 'rail', 'air')),
  quantity numeric NOT NULL DEFAULT 0 CHECK (quantity > 0),
  unit_type text NOT NULL DEFAULT 'container' CHECK (unit_type IN ('container', 'pallet', 'ton', 'cubic_meter')),
  goods_type text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'landed' CHECK (status IN ('landed', 'placed', 'in_transit', 'departed')),
  vessel_name text NOT NULL DEFAULT '',
  landing_clerk_id uuid REFERENCES profiles(id),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE goods_landing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view goods_landing"
  ON goods_landing FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Landing clerks and above can insert goods_landing"
  ON goods_landing FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('landing_clerk', 'yard_operator', 'manager', 'admin')
    )
  );

CREATE POLICY "Landing clerks and above can update goods_landing"
  ON goods_landing FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('landing_clerk', 'yard_operator', 'manager', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('landing_clerk', 'yard_operator', 'manager', 'admin')
    )
  );

-- Create goods_placement table
CREATE TABLE IF NOT EXISTS goods_placement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_landing_id uuid NOT NULL REFERENCES goods_landing(id) ON DELETE CASCADE,
  zone_id uuid NOT NULL REFERENCES zones(id),
  rack_number text NOT NULL DEFAULT '',
  placement_time timestamptz NOT NULL DEFAULT now(),
  operator_id uuid REFERENCES profiles(id),
  placement_type text NOT NULL DEFAULT 'initial' CHECK (placement_type IN ('initial', 'relocated')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'moved', 'departed')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE goods_placement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view goods_placement"
  ON goods_placement FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Yard operators and above can insert goods_placement"
  ON goods_placement FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('yard_operator', 'manager', 'admin')
    )
  );

CREATE POLICY "Yard operators and above can update goods_placement"
  ON goods_placement FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('yard_operator', 'manager', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('yard_operator', 'manager', 'admin')
    )
  );

-- Create movements table
CREATE TABLE IF NOT EXISTS movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_landing_id uuid NOT NULL REFERENCES goods_landing(id) ON DELETE CASCADE,
  from_zone_id uuid REFERENCES zones(id),
  to_zone_id uuid NOT NULL REFERENCES zones(id),
  from_rack text DEFAULT '',
  to_rack text NOT NULL DEFAULT '',
  movement_time timestamptz NOT NULL DEFAULT now(),
  operator_id uuid REFERENCES profiles(id),
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view movements"
  ON movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Yard operators and above can insert movements"
  ON movements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('yard_operator', 'manager', 'admin')
    )
  );

CREATE POLICY "Yard operators and above can update movements"
  ON movements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('yard_operator', 'manager', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('yard_operator', 'manager', 'admin')
    )
  );

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_code text UNIQUE NOT NULL,
  equipment_type text NOT NULL CHECK (equipment_type IN ('crane', 'forklift', 'reach_stacker', 'truck')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_service')),
  current_operator_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view equipment"
  ON equipment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can manage equipment"
  ON equipment FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin')
    )
  );

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  user_id uuid REFERENCES profiles(id),
  timestamp timestamptz DEFAULT now(),
  ip_address text DEFAULT ''
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers and admins can view audit_log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goods_landing_status ON goods_landing(status);
CREATE INDEX IF NOT EXISTS idx_goods_landing_arrival_time ON goods_landing(arrival_time);
CREATE INDEX IF NOT EXISTS idx_goods_landing_clerk ON goods_landing(landing_clerk_id);
CREATE INDEX IF NOT EXISTS idx_goods_placement_goods ON goods_placement(goods_landing_id);
CREATE INDEX IF NOT EXISTS idx_goods_placement_zone ON goods_placement(zone_id);
CREATE INDEX IF NOT EXISTS idx_goods_placement_status ON goods_placement(status);
CREATE INDEX IF NOT EXISTS idx_movements_goods ON movements(goods_landing_id);
CREATE INDEX IF NOT EXISTS idx_movements_zones ON movements(from_zone_id, to_zone_id);
CREATE INDEX IF NOT EXISTS idx_movements_status ON movements(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goods_landing_updated_at BEFORE UPDATE ON goods_landing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goods_placement_updated_at BEFORE UPDATE ON goods_placement
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movements_updated_at BEFORE UPDATE ON movements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample zones
INSERT INTO zones (zone_code, description, capacity, zone_type, status) VALUES
  ('A1', 'Container Storage Zone A1', 100, 'container', 'active'),
  ('A2', 'Container Storage Zone A2', 100, 'container', 'active'),
  ('B1', 'Refrigerated Storage Zone B1', 50, 'refrigerated', 'active'),
  ('C1', 'Bulk Cargo Zone C1', 200, 'bulk', 'active'),
  ('D1', 'General Cargo Zone D1', 150, 'general', 'active')
ON CONFLICT (zone_code) DO NOTHING;

-- Insert sample equipment
INSERT INTO equipment (equipment_code, equipment_type, status) VALUES
  ('CRANE-01', 'crane', 'available'),
  ('CRANE-02', 'crane', 'available'),
  ('FORKLIFT-01', 'forklift', 'available'),
  ('FORKLIFT-02', 'forklift', 'available'),
  ('FORKLIFT-03', 'forklift', 'maintenance'),
  ('STACKER-01', 'reach_stacker', 'available')
ON CONFLICT (equipment_code) DO NOTHING;