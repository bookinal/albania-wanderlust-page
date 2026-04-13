# Properties Map Context

This document provides a technical overview of the `PropertiesMapPage` logic, focusing extensively on how the map data is fetched, managed, and filtered before rendering.

## Architecture Overview

The Map feature is composed of several key components:
- **`PropertiesMapPage`**: The page container. Holds the global layout (AppBar + Map Area) and manages the `selected` property state (which item the user clicked).
- **`PropertiesMap`**: The core map implementation. Responsible for fetching data, maintaining filter states, executing the filter logic, and rendering markers on a `react-leaflet` map. 
- **`MapFilters`**: The UI panel for user interactions with the filters (Types, Price Range, Categories).
- **`MapPropertySidebar`**: A slide-in detail panel that shows information when a map marker is selected.

## Data Fetching

Data is fetched client-side inside `PropertiesMap.tsx` on initial mount via distinct `useEffect` hooks for each property type:
1. `getAllHotels()` -> Stores in `hotelsData` array
2. `getAllApartments()` -> Stores in `apartmentsData` array
3. `getAllDestinations()` -> Stores in `destinationsData` array

A universal `loading` state tracks the process, waiting until all requests settle.

## Filtering Logic

All filtering happens **client-side** derived from the raw data arrays. The filter state resides in `PropertiesMap.tsx` and delegates UI controls to `MapFilters.tsx`.

### 1. Filter States
- `selectedTypes`: Array of strings (`['hotel', 'apartment', 'destination']`). Determines which layers of data to render.
- `priceRange`: Minimum and maximum price tuple (`[0, 500]`). Applies uniquely to accommodations.
- `selectedCategories`: Array of strings (`['Adventure', 'Historic', 'Beach']`). Sub-filter applying exclusively to destinations.

### 2. Derived Filtered Arrays
The mapped markers iterate over three derived arrays, cleanly separating logic:

**Hotels (`filteredHotels`)**
- Checks if `"hotel"` is present in `selectedTypes`.
- Checks if the hotel's `price` falls inclusively within `priceRange`.

**Apartments (`filteredApartments`)**
- Checks if `"apartment"` is present in `selectedTypes`.
- Checks if the apartment's `price` falls inclusively within `priceRange`.

**Destinations (`filteredDestinations`)**
- Checks if `"destination"` is present in `selectedTypes`.
- Checks if the destination's `category` matches any string in `selectedCategories` (or allows all if the array is purposefully empty).

### 3. Reset Mechanisms
A helper function `handleResetFilters()` reverts the states back to default (all types checked, default price range `[0,500]`, and all categories checked).

## Key UI Components & Interactions

- **`MapFilters` Component**: Takes functions like `onTypesChange`, `onPriceRangeChange`, and `onCategoriesChange` as props. It conditionally renders the destination category filters *only* if the "destination" type is turned on.
- **Markers (Speech Bubbles)**: Rendered dynamically based on the filtered arrays. `priceRange` filters out accommodations directly so only matching bubbles render. If clicked, they update the `selected` state at the `PropertiesMapPage` level which triggers the `<MapPropertySidebar />`.

## Summary
The map page acts as a thick client viewer. Rather than paginating or searching via the API per filter update, it fetches all available coordinates and executes real-time JavaScript `.filter()` functions against the React state to provide an instant, seamless mapping experience for the user.
