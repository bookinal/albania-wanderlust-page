import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Destination } from "@albania/shared-types";
import {
  getAllDestinations,
  getDestinationById,
  getFeaturedDestinations,
} from "@/services/api/destinationService";

const DESTINATIONS_QUERY_KEY = ["destinations"] as const;
const FEATURED_DESTINATIONS_QUERY_KEY = ["featured-destinations"] as const;

/** Destinations the admin picked for the home page ("Picked for you") */
export const useFeaturedDestinations = () => {
  return useQuery({
    queryKey: FEATURED_DESTINATIONS_QUERY_KEY,
    queryFn: getFeaturedDestinations,
    staleTime: 10 * 60 * 1000,
  });
};

export const useDestinations = () => {
  return useQuery({
    queryKey: DESTINATIONS_QUERY_KEY,
    queryFn: getAllDestinations,
    staleTime: 10 * 60 * 1000,
  });
};

export const useDestination = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...DESTINATIONS_QUERY_KEY, id],
    queryFn: () => getDestinationById(id as string),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
    initialData: () => {
      const cachedDestinations = queryClient.getQueryData<Destination[]>(
        DESTINATIONS_QUERY_KEY,
      );
      return cachedDestinations?.find((destination) => destination.id === id);
    },
  });
};

export { DESTINATIONS_QUERY_KEY, FEATURED_DESTINATIONS_QUERY_KEY };
