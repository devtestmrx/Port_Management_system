# Ships Listing Feature

## Overview

The Ships Listing feature provides a comprehensive interface for viewing and filtering ships in port. It includes advanced filtering capabilities, responsive design (table on desktop, cards on mobile), pagination, and sorting.

## Features

### Filtering
- **Date Range Filter**: Filter ships by arrival date using from/to date pickers
- **Cargo Type Filter**: Dropdown to filter by cargo type (Container, Bulk, Breakbulk, Automotive, Roll-on/Roll-off, Other)
- **Status Filter**: Filter by current status (On Dock, Still at Anchor)
- **Expected Arrival Filter**: Toggle to show only expected arrivals or already arrived ships
- **Filter Reset**: One-click reset of all filters

### Responsive Layout
- **Desktop View**: Responsive HTML table with sortable columns
- **Mobile View**: Card-based layout for better mobile UX
- **Adaptive Filters**: Mobile filters collapsible into a drawer

### Pagination
- 20 ships per page by default
- Previous/Next navigation
- Current page indicator

### Sorting
- Sort by arrival date (ascending/descending)
- Sort order toggle via column header

### State Management
- Loading state with spinner
- Error state with error message display
- Empty state when no ships found
- Proper error handling for API failures

## Architecture

### Component Structure

```
src/
├── components/LandManagement/
│   ├── ShipsListing.tsx       (Main container component)
│   ├── FilterPanel.tsx         (Filter UI)
│   ├── ShipsTable.tsx          (Desktop view)
│   ├── ShipsCard.tsx           (Mobile view)
│   └── index.ts                (Exports)
├── services/
│   └── shipsService.ts         (API integration)
├── hooks/
│   ├── useShipsFilters.ts      (Filter state & logic)
│   └── useShipsPagination.ts   (Pagination state & logic)
├── utils/
│   └── shipUtils.ts            (Formatting & helper functions)
├── types/
│   └── ships.ts                (TypeScript interfaces)
└── __tests__/
    ├── shipsService.test.ts    (API tests)
    ├── shipUtils.test.ts       (Utility tests)
    └── useShipsFilters.test.ts (Hook tests)
```

### Clean Architecture Layers

**Presentation Layer** (Components)
- `ShipsListing.tsx`: Orchestrates UI state and user interactions
- `FilterPanel.tsx`: Filter UI component
- `ShipsTable.tsx`: Desktop table display
- `ShipsCard.tsx`: Mobile card display

**Application Layer** (Hooks)
- `useShipsFilters.ts`: Filter state management and application logic
- `useShipsPagination.ts`: Pagination state management

**Domain Layer** (Types & Utils)
- `ships.ts`: Domain types and interfaces
- `shipUtils.ts`: Business logic utilities (formatting, sorting, colors)

**Infrastructure Layer** (Services)
- `shipsService.ts`: API client for ships endpoint

## Usage

### Basic Implementation

```tsx
import { ShipsListing } from './components/LandManagement';

export function App() {
  return <ShipsListing />;
}
```

### API Integration

The feature expects a `/api/ships` endpoint. See `API_SETUP.md` for implementation details.

### Custom Hooks

#### useShipsFilters

```tsx
const { filters, updateFilters, resetFilters, applyFiltersToShips } = useShipsFilters();

// Update a single filter
updateFilters({ cargoType: 'container' });

// Reset all filters
resetFilters();

// Apply filters to a ships array (client-side)
const filtered = applyFiltersToShips(ships);
```

#### useShipsPagination

```tsx
const { currentPage, pageSize, goToPage, nextPage, previousPage, resetPagination } =
  useShipsPagination({ pageSize: 20, initialPage: 1 });

// Navigate to specific page
goToPage(2);

// Go to next/previous page
nextPage();
previousPage();

// Reset to initial page
resetPagination();
```

## Accessibility Features

- **Keyboard Navigation**: All buttons and form controls are keyboard accessible
- **ARIA Labels**: Descriptive labels for screen readers on all interactive elements
- **Semantic HTML**: Proper heading hierarchy and semantic structure
- **Focus Management**: Clear focus states on interactive elements
- **Color Contrast**: Status badges use colors with sufficient contrast ratios

## Testing

### Run Tests

```bash
npm test
```

### Test Coverage

- **Unit Tests for Filters**: Verify filtering logic with multiple filter combinations
- **Unit Tests for API Service**: Mock API calls and error scenarios
- **Utility Function Tests**: Formatting, sorting, and color helper functions

### Test Files

- `src/__tests__/shipsService.test.ts`: API service tests with mocked fetch
- `src/__tests__/shipUtils.test.ts`: Utility function tests
- `src/__tests__/useShipsFilters.test.ts`: Filter hook tests with React Testing Library

## Styling

The feature uses Tailwind CSS for styling:
- Consistent color scheme (blue primary, slate for text)
- Responsive breakpoints (mobile-first approach)
- Status badges with semantic colors (green for on_dock, yellow for at_anchor)
- Hover and transition effects for better UX

## Performance Considerations

- **Pagination**: Limits data displayed to 20 ships per page
- **Client-side Filtering**: Filter hooks process data in memory for instant feedback
- **Lazy Loading**: API calls only trigger on filter/pagination changes
- **Memoization**: Utility functions designed to be pure for easy memoization if needed

## Future Enhancements

- Real-time updates via WebSocket
- Advanced search with full-text capabilities
- Export to CSV/PDF
- Ship tracking integration
- Historical arrival data
- Performance metrics and KPIs

## Troubleshooting

### API Errors

If you see "Failed to load ships" error:
1. Check that the `/api/ships` endpoint is running
2. Verify the endpoint returns the correct JSON structure
3. Check browser console for detailed error messages

### Responsive Design Issues

- Ensure viewport meta tag is present in index.html
- Test on actual mobile devices or use browser dev tools
- Check Tailwind CSS is properly configured

### Filter Not Working

- Verify filters are being applied via browser dev tools
- Check that API correctly handles query parameters
- Test filter logic independently using the test suite

## Integration with Existing System

The Ships Listing feature integrates seamlessly with the existing Port Management System:
- Uses same authentication (AuthContext)
- Follows same code conventions and structure
- Integrated into main navigation
- Uses consistent styling (Tailwind, lucide-react icons)

## Dependencies

- **React**: Component framework
- **Lucide React**: Icons
- **Tailwind CSS**: Styling
- **TypeScript**: Type safety

No additional UI libraries or dependencies required.
