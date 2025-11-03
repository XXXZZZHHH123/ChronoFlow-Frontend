import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEvents } from "@/api/eventApi";
import type { OrgEvent } from "@/lib/validation/schema";
import { useAuthStore } from "@/stores/authStore";

export type UseOrgEventsType = {
  events: OrgEvent[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export function useOrgEvents(autoFetch: boolean = false): UseOrgEventsType {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery<OrgEvent[], Error>({
    queryKey: ["events", user?.id],
    queryFn: getEvents,
    enabled: !!user && autoFetch,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const onRefresh = async () => {
    if (!user) return;
    await queryClient.invalidateQueries({ queryKey: ["events", user.id] });
  };

  return {
    events: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: query.error ? query.error.message : null,
    onRefresh,
  };
}
