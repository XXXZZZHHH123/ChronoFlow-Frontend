import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAssignableMembers } from "@/api/eventTasksApi";
import type { EventGroupWithAssignableMembers } from "@/lib/validation/schema";

export type UseAssignableMembersType = {
  groups: EventGroupWithAssignableMembers[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export function useAssignableMembers(
  eventId: string | null,
  autoFetch: boolean = false
): UseAssignableMembersType {
  const queryClient = useQueryClient();

  const query = useQuery<EventGroupWithAssignableMembers[], Error>({
    queryKey: ["assignableMembers", eventId],
    queryFn: () => {
      if (!eventId) return Promise.resolve([]);
      return getAssignableMembers(eventId);
    },
    enabled: autoFetch && !!eventId,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const onRefresh = async () => {
    if (!eventId) return;
    await queryClient.invalidateQueries({
      queryKey: ["assignableMembers", eventId],
    });
  };

  return {
    groups: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: query.error ? query.error.message : null,
    onRefresh,
  };
}
