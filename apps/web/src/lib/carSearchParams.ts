/**
 * Carries the car search (dates + pick-up location) through the URL:
 * search results -> car page -> billing (also survives the login redirect).
 */

export interface CarSearchSelection {
  pickupDate?: Date | null;
  returnDate?: Date | null;
  pickupLocation?: string;
}

const toDateParam = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fromDateParam = (value: string | null): Date | undefined => {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

/** Returns "?from=…&to=…&location=…", or "" when nothing is selected. */
export const buildCarSearchQuery = ({
  pickupDate,
  returnDate,
  pickupLocation,
}: CarSearchSelection): string => {
  const params = new URLSearchParams();
  if (pickupDate && returnDate) {
    params.set("from", toDateParam(pickupDate));
    params.set("to", toDateParam(returnDate));
  }
  if (pickupLocation) params.set("location", pickupLocation);
  const query = params.toString();
  return query ? `?${query}` : "";
};

/** Parses the query built above; drops past or inverted date ranges. */
export const parseCarSearchQuery = (search: string) => {
  const params = new URLSearchParams(search);
  let from = fromDateParam(params.get("from"));
  let to = fromDateParam(params.get("to"));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!from || !to || from < today || to < from) {
    from = undefined;
    to = undefined;
  }

  return { from, to, location: params.get("location") || undefined };
};
