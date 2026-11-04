import { useCallback, useEffect, useState } from "react";

interface DestinationFilters {
  search: string;
  selectedSubcategory: string;
  selectedLocation: string;
}

const EMPTY_FILTERS: DestinationFilters = {
  search: "",
  selectedSubcategory: "",
  selectedLocation: "",
};

const STORAGE_PREFIX = "destination-filters:";

const readFilters = (storageKey: string): DestinationFilters => {
  try {
    const raw = sessionStorage.getItem(storageKey);
    return raw ? { ...EMPTY_FILTERS, ...JSON.parse(raw) } : EMPTY_FILTERS;
  } catch {
    return EMPTY_FILTERS;
  }
};

const writeFilters = (storageKey: string, filters: DestinationFilters) => {
  try {
    if (Object.values(filters).some(Boolean)) {
      sessionStorage.setItem(storageKey, JSON.stringify(filters));
    } else {
      sessionStorage.removeItem(storageKey);
    }
  } catch {
    // storage full or unavailable: the filters just won't be remembered
  }
};

/**
 * Search bar filters of a destinations page. They are remembered per page until
 * the tab is closed, so they are still set when the visitor comes back from a
 * destination, whichever way they return.
 */
export const useDestinationFilters = (pageKey: string) => {
  const storageKey = `${STORAGE_PREFIX}${pageKey}`;
  const [stored, setStored] = useState(() => ({
    storageKey,
    filters: readFilters(storageKey),
  }));

  // The subcategory page stays mounted when moving from one subcategory to another
  let current = stored;
  if (stored.storageKey !== storageKey) {
    current = { storageKey, filters: readFilters(storageKey) };
    setStored(current);
  }

  useEffect(() => {
    writeFilters(stored.storageKey, stored.filters);
  }, [stored]);

  const setFilter = useCallback(
    (name: keyof DestinationFilters, value: string) =>
      setStored((prev) => ({
        ...prev,
        filters: { ...prev.filters, [name]: value },
      })),
    [],
  );

  return {
    ...current.filters,
    setSearch: useCallback((value: string) => setFilter("search", value), [setFilter]),
    setSelectedSubcategory: useCallback(
      (value: string) => setFilter("selectedSubcategory", value),
      [setFilter],
    ),
    setSelectedLocation: useCallback(
      (value: string) => setFilter("selectedLocation", value),
      [setFilter],
    ),
  };
};
