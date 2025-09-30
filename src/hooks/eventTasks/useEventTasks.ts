import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventTask } from "@/lib/validation/schema";
import { getEventTasks } from "@/api/eventTaskApi";

export type UseEventTasksType = {
  tasks: EventTask[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export function useEventTasks(
  eventId: string | null,
  autoFetch: boolean = false
): UseEventTasksType {
  const queryClient = useQueryClient();

  const query = useQuery<EventTask[], Error>({
    queryKey: ["eventTasks", eventId],
    queryFn: () => {
      if (!eventId) return Promise.resolve([]);
      return getEventTasks(eventId);
    },
    enabled: autoFetch && !!eventId,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const onRefresh = async () => {
    if (!eventId) return;
    await queryClient.invalidateQueries({ queryKey: ["eventTasks", eventId] });
  };

  return {
    tasks: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: query.error ? query.error.message : null,
    onRefresh,
  };
}
