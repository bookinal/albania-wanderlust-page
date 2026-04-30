import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Destination } from "@albania/shared-types";
import {
  getAllDestinations,
  getDestinationById,
} from "@/services/api/destinationService";

const DESTINATIONS_QUERY_KEY = ["destinations"] as const;

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

export { DESTINATIONS_QUERY_KEY };
