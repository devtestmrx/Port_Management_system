# Ships Listing API Setup

This document provides guidance for setting up the `/api/ships` endpoint that the Ships Listing feature expects.

## API Endpoint Specification

### GET /api/ships

Fetches a paginated list of ships with optional filtering and sorting.

#### Query Parameters

- **page** (number): Page number (1-indexed). Default: 1
- **pageSize** (number): Number of ships per page. Default: 20
- **sortBy** (string): Field to sort by. Options: `arrival_date`. Default: `arrival_date`
- **sortOrder** (string): Sort order. Options: `asc`, `desc`. Default: `asc`
- **arrivalDateFrom** (string): Filter ships with arrival date on or after this date (ISO 8601 format)
- **arrivalDateTo** (string): Filter ships with arrival date on or before this date (ISO 8601 format)
- **cargoType** (string): Filter by cargo type. Options: `container`, `bulk`, `breakbulk`, `automotive`, `roll_on_roll_off`, `other`
- **status** (string): Filter by status. Options: `on_dock`, `at_anchor`
- **isExpectedArrival** (boolean): Filter by whether ship is expected to arrive (query param as string: 'true' or 'false')

#### Response

```json
{
  "ships": [
    {
      "id": "uuid",
      "name": "string",
      "cargo_type": "container|bulk|breakbulk|automotive|roll_on_roll_off|other",
      "arrival_date": "ISO 8601 datetime string",
      "status": "on_dock|at_anchor",
      "expected_arrival_time": "ISO 8601 datetime string|null",
      "is_expected_arrival": boolean,
      "created_at": "ISO 8601 datetime string",
      "updated_at": "ISO 8601 datetime string"
    }
  ],
  "total": number,
  "page": number,
  "pageSize": number,
  "totalPages": number
}
```

### GET /api/ships/:id

Fetches a single ship by ID.

#### Response

```json
{
  "id": "uuid",
  "name": "string",
  "cargo_type": "container|bulk|breakbulk|automotive|roll_on_roll_off|other",
  "arrival_date": "ISO 8601 datetime string",
  "status": "on_dock|at_anchor",
  "expected_arrival_time": "ISO 8601 datetime string|null",
  "is_expected_arrival": boolean,
  "created_at": "ISO 8601 datetime string",
  "updated_at": "ISO 8601 datetime string"
}
```

## Implementation Options

### Option 1: Backend API (Recommended)

Create a backend API endpoint that queries your database. Example with Node.js/Express:

```javascript
app.get('/api/ships', async (req, res) => {
  const {
    page = 1,
    pageSize = 20,
    sortBy = 'arrival_date',
    sortOrder = 'asc',
    arrivalDateFrom,
    arrivalDateTo,
    cargoType,
    status,
    isExpectedArrival,
  } = req.query;

  // Build query with filters
  let query = db.ships;

  if (arrivalDateFrom) {
    query = query.where('arrival_date', '>=', arrivalDateFrom);
  }
  if (arrivalDateTo) {
    query = query.where('arrival_date', '<=', arrivalDateTo);
  }
  if (cargoType) {
    query = query.where('cargo_type', '=', cargoType);
  }
  if (status) {
    query = query.where('status', '=', status);
  }
  if (isExpectedArrival !== undefined) {
    query = query.where('is_expected_arrival', '=', isExpectedArrival === 'true');
  }

  // Get total count
  const total = await query.count();

  // Pagination and sorting
  const ships = await query
    .orderBy(sortBy, sortOrder)
    .offset((page - 1) * pageSize)
    .limit(pageSize);

  res.json({
    ships,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    totalPages: Math.ceil(total / pageSize),
  });
});
```

### Option 2: Supabase Edge Function

Create a Supabase Edge Function that handles the API logic:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

Deno.serve(async (req) => {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

  let query = supabase.from('ships').select('*', { count: 'exact' });

  // Apply filters...

  const { data, count, error } = await query
    .order('arrival_date', { ascending: sortOrder === 'asc' })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  return new Response(JSON.stringify({
    ships: data,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }));
});
```

## Database Schema

If using Supabase or similar, ensure your `ships` table has these columns:

```sql
CREATE TABLE ships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  cargo_type VARCHAR NOT NULL,
  arrival_date TIMESTAMPTZ NOT NULL,
  status VARCHAR NOT NULL,
  expected_arrival_time TIMESTAMPTZ,
  is_expected_arrival BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ships_arrival_date ON ships(arrival_date);
CREATE INDEX idx_ships_status ON ships(status);
CREATE INDEX idx_ships_cargo_type ON ships(cargo_type);
```

## Integration with Frontend

The frontend is already configured to call the `/api/ships` endpoint. Simply ensure your API is running and responds with the correct JSON structure outlined above.

## Testing the Endpoint

```bash
# Get first page of ships
curl 'http://localhost:3000/api/ships?page=1&pageSize=20'

# Filter by cargo type and status
curl 'http://localhost:3000/api/ships?cargoType=container&status=on_dock'

# Filter by date range
curl 'http://localhost:3000/api/ships?arrivalDateFrom=2024-01-01&arrivalDateTo=2024-01-31'

# Sort descending
curl 'http://localhost:3000/api/ships?sortOrder=desc'
```
