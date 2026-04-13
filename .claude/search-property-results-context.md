# SearchPropertyResults Component Context

## Overview
The `SearchPropertyResults` component acts as the main container for displaying and filtering property search results (both hotels and apartments). It integrates search filters passed via navigation state, handles infinite scrolling for fetching paginated data, and manages the overall layout including a header, a filter sidebar, a map preview, and the results grid.

## State and Data Flow
- **Initialization**: The component reads the initial search criteria from `react-router-dom`'s `useLocation().state` (e.g., destination, dates, guests, rooms).
- **Filter Management**: It uses a custom hook `useSearchFilters(initialFilters)` to manage the current state of filters. This hook provides functions like `setFilters`, `setPropertyType`, `setHotelFilters`, `setApartmentFilters`, and `resetFilters`.
- **Navigation State Sync**: An effect hook listens to `state` changes (from navigation) and updates the local filters accordingly (e.g., synchronizing destination, dates, guests, and adjusting minimum required beds/rooms for apartments/hotels).
- **Data Fetching**: It utilizes `@tanstack/react-query`'s `useInfiniteQuery` to fetch data.
  - **Query Key**: `["searchProperties", filters]` ensures data is refetched when filters change.
  - **Query Function**: Based on `filters.propertyType` ("hotel", "apartment", or "both"), it makes concurrent calls to `searchHotels` and/or `searchApartments` APIs.
  - **Pagination**: The results are combined, and `getNextPageParam` handles logic for subsequent pages based on the total items loaded versus the API's reported total items.

## Infinite Scrolling
- Uses `react-intersection-observer` (`useInView`).
- An invisible target element at the bottom of the list triggers `fetchNextPage()` when it enters the viewport and more pages are available (`hasNextPage`).

## UI Components & Theming
- **Theming**: Integrates `useTheme` to toggle between dark and light mode tokens (`tk` object) which control colors, backgrounds, and borders dynamically using inline styles and some internal `<style>` block rules.
- **Layout**: 
  - `PrimarySearchAppBar`: Main top navigation.
  - **Hero Band**: Displays a dynamic title.
  - **Sidebar**: Contains `MapPreviewCard` and `FilterBar`.
  - **Main Content Area**: Shows the total count badge, handles Error (`status === "error"`) and Empty (`combinedResults.length === 0`) states, and renders a grid of `PropertyCard` components.
- **Loading State**: Displays skeleton cards (`renderSkeletons`) during the initial load or while fetching the next page.

## Event Handlers
- `handleDateChange` / `handleGuestsChange`: Update global filters and synchronize specific apartment/hotel filters (like required beds or rooms based on guest count).
- `handlePropertyClick`: Navigates to specific reservation pages (`/hotelReservation/:id` or `/apartmentReservation/:id`) depending on whether the property is identified as a hotel (checked via `"occupancy" in property`).
- `applyFilters`: A dummy wrapper around `refetch()` for manual filter triggering if needed.

## Data Structures
- **Navigation State**:
  ```typescript
  {
    type: string;
    destination?: string;
    checkInDate?: string | null;
    checkOutDate?: string | null;
    adults?: number;
    children?: number;
    rooms?: number;
  }
  ```
- **Filter Object** (managed by `useSearchFilters`):
  Includes global dates/guests, `propertyType` (now only `"hotel" | "apartment"`), `hotelFilters` (searchTerm, rooms, etc.), and `apartmentFilters` (searchTerm, rooms, beds, etc.). Shared filters (searchTerm, priceRange, rating) are synchronized between hotel and apartment filters upon input change.

## Updates Tracker
*(Add entries here after each edit made to the component)*

- **Initial Setup**: Created context documentation.
- **Update 1**: Removed "both" (all) property type option. Default `propertyType` is now "hotel". Updated shared filter fields (Search, Price Range, Rating) to simultaneously update both `hotelFilters` and `apartmentFilters` so their values remain in sync when switching between the Hotel and Apartment tabs.
