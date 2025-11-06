# Port Goods Landing & Placement Management System

## Overview

A modern, web-based system for managing goods arrival, storage zone allocation, placement tracking, and movements within a port terminal. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Core Functionality
- **Goods Landing Registration**: Record incoming goods with details (ID, origin, transport mode, quantity, type)
- **Zone Management**: Create and manage storage zones with capacity tracking
- **Intelligent Placement**: Automated zone suggestions based on capacity, type matching, and utilization
- **Movement Tracking**: Transfer goods between zones with full audit trail
- **Real-time Dashboard**: KPIs, zone occupancy heat maps, and operational metrics
- **Audit Logging**: Complete history of all operations (manager/admin only)

### User Roles
- **Landing Clerk**: Register incoming goods
- **Yard Operator**: Place goods in zones, execute movements
- **Manager**: Full access including zone management and audit logs
- **Admin**: System administration and configuration

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)
- **Icons**: Lucide React

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Supabase

1. Create a new Supabase project at https://supabase.com
2. The database schema has already been applied via migration
3. Copy your Supabase URL and Anon Key from the project settings

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Create Initial User

Since this is a closed system, you'll need to create users through the Supabase dashboard or SQL:

```sql
-- In Supabase SQL Editor
-- First, sign up a user through the Auth UI or API
-- Then insert their profile:

INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'user-uuid-from-auth-users-table',
  'admin@example.com',
  'Admin User',
  'admin'
);
```

Alternatively, you can use the Supabase Auth API to sign up:

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'admin@example.com',
  password: 'secure-password',
});

// Then create the profile
await supabase.from('profiles').insert({
  id: data.user.id,
  email: 'admin@example.com',
  full_name: 'Admin User',
  role: 'admin'
});
```

### Step 5: Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Database Schema

### Tables

#### profiles
- User information and roles
- Links to Supabase Auth users

#### zones
- Storage zone definitions
- Capacity and occupancy tracking
- Zone types: container, bulk, general, refrigerated

#### goods_landing
- Incoming goods records
- Status: landed, placed, in_transit, departed
- Transport modes: ship, truck, rail, air

#### goods_placement
- Goods placement in zones
- Tracks current and historical placements
- Links goods to zones and racks

#### movements
- Movement history between zones
- Tracks reason and operator
- Status: pending, in_progress, completed, cancelled

#### equipment
- Terminal equipment tracking
- Types: crane, forklift, reach_stacker, truck
- Current operator assignment

#### audit_log
- Complete audit trail
- Tracks all INSERT, UPDATE, DELETE operations
- Stores before/after data states

## User Guide

### Landing Clerk Workflow

1. **Register Goods Landing**
   - Navigate to "Goods Landing"
   - Fill in the landing form with goods details
   - System automatically sets status to "landed"

2. **View Landing History**
   - See all landed goods
   - Filter by status
   - Track which goods need placement

### Yard Operator Workflow

1. **Place Goods in Zone**
   - Navigate to "Goods Placement"
   - Select unplaced goods from dropdown
   - Review AI-suggested zones (ranked by score)
   - Choose zone and rack number
   - System validates capacity and updates occupancy

2. **Move Goods Between Zones**
   - Navigate to "Movements"
   - Select goods to move
   - Choose destination zone and rack
   - Provide reason for movement
   - System updates both zones' occupancy

3. **Monitor Placements**
   - View current placements
   - Track goods locations
   - See placement history

### Manager/Admin Features

1. **Dashboard Analytics**
   - View real-time KPIs
   - Monitor zone utilization
   - Track movement frequency
   - Analyze average dwell time

2. **Zone Management**
   - Create new zones
   - Configure capacity and type
   - Set zone status (active/inactive/maintenance)
   - Monitor occupancy levels

3. **Audit Log Review**
   - View all system operations
   - Filter by table
   - See who made what changes
   - Review data changes

## Intelligent Placement Algorithm

The system suggests optimal zones based on:

1. **Capacity Check** (50 points)
   - Zone must have sufficient capacity
   - Automatic fail if insufficient

2. **Utilization Score** (10-30 points)
   - Prefers zones with lower utilization
   - Prevents over-concentration

3. **Type Matching** (5-20 points)
   - Matches goods type to zone type
   - Refrigerated goods → refrigerated zones
   - Containers → container zones
   - Bulk → bulk zones

Top 3 suggestions are displayed with visual ranking.

## Key Performance Indicators

- **Total Goods**: All goods in system
- **Landed Goods**: Awaiting placement
- **Placed Goods**: Currently in zones
- **In Transit**: Being moved
- **Total Movements**: Completed moves
- **Avg Dwell Time**: Average hours in terminal
- **Moves Today**: Daily movement count

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Role-based access control
- Users can only access permitted data

### Authentication
- Supabase Auth with email/password
- Secure session management
- Protected routes

### Audit Trail
- All critical operations logged
- User identification
- Timestamp and IP tracking
- Before/after data capture

## Maintenance Guide

### Adding New Users

```sql
-- After user signs up through Auth
INSERT INTO profiles (id, email, full_name, role)
VALUES ('user-uuid', 'user@example.com', 'User Name', 'yard_operator');
```

### Adding New Zones

Use the Zone Management interface or SQL:

```sql
INSERT INTO zones (zone_code, description, capacity, zone_type, status)
VALUES ('E1', 'Emergency Zone E1', 75, 'general', 'active');
```

### Monitoring System Health

Check dashboard for:
- High zone utilization (>90%)
- Goods with long dwell times
- Zones in maintenance
- Daily movement patterns

### Backup and Recovery

Supabase handles automatic backups. For manual backups:

```bash
# Export data using Supabase CLI
supabase db dump -f backup.sql
```

## Troubleshooting

### Can't Sign In
- Verify Supabase credentials in `.env`
- Check user exists in `auth.users`
- Ensure profile exists in `profiles` table

### Placement Fails
- Verify zone has sufficient capacity
- Check zone status is "active"
- Ensure goods status is "landed"

### Suggestions Not Showing
- Verify zones exist with status "active"
- Check zone capacity is greater than goods quantity
- Ensure goods type is set correctly

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Future Enhancements

### Potential Additions
- Gate integration (RFID/barcode scanning)
- IoT sensor integration (temperature, weight)
- Mobile app for operators
- Advanced reporting and analytics
- Email/SMS notifications
- Multi-terminal support
- Equipment scheduling
- Customs integration
- Billing and invoicing

### Migration Path
The system is designed to scale:
- Database can handle millions of records
- API-ready architecture
- Modular component structure
- Clear separation of concerns

## API Integration Examples

### External System Integration

```typescript
// Example: External TOS integration
const createLanding = async (data: LandingData) => {
  const { data: landing, error } = await supabase
    .from('goods_landing')
    .insert(data)
    .select()
    .single();

  return landing;
};

// Example: Export data to external system
const exportPlacements = async () => {
  const { data } = await supabase
    .from('goods_placement')
    .select(`
      *,
      goods_landing(*),
      zone(*)
    `)
    .eq('status', 'active');

  return data;
};
```

## Support

For issues or questions:
1. Check this documentation
2. Review the database schema in migrations
3. Check Supabase logs for errors
4. Review browser console for frontend errors

## License

This system is designed for internal port terminal operations.

## Version History

- **v1.0.0** (Current)
  - Complete goods landing and placement management
  - Zone management with capacity tracking
  - Movement tracking with audit trail
  - Dashboard with KPIs and heat maps
  - Role-based access control
  - Intelligent placement suggestions
