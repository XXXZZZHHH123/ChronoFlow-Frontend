import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEvents } from "@/api/eventApi";
import type { OrgEvent } from "@/lib/validation/schema";

export type UseOrgEventsType = {
  events: OrgEvent[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export function useOrgEvents(autoFetch: boolean = false): UseOrgEventsType {
  const queryClient = useQueryClient();

  const query = useQuery<OrgEvent[], Error>({
    queryKey: ["events"],
    queryFn: getEvents,
    enabled: autoFetch,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const onRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  return {
    events: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: query.error ? query.error.message : null,
    onRefresh,
  };
}
