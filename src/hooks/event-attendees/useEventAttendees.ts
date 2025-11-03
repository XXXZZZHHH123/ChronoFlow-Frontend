import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAttendees } from "@/api/attendeeApi";
import type { Attendee } from "@/lib/validation/schema";

export type UseEventAttendeesType = {
  attendees: Attendee[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export function useEventAttendees(
  eventId: string | null,
  autoFetch: boolean = false
): UseEventAttendeesType {
  const queryClient = useQueryClient();

  const query = useQuery<Attendee[], Error>({
    queryKey: ["eventAttendees", eventId],
    queryFn: () => {
      if (!eventId) return Promise.resolve([]);
      return getAttendees(eventId);
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
      queryKey: ["eventAttendees", eventId],
    });
  };

  return {
    attendees: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: query.error ? query.error.message : null,
    onRefresh,
  };
}
