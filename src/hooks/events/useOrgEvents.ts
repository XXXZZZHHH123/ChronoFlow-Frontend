import { useEffect, useState, useCallback } from "react";
import { getEvents } from "@/api/eventApi";
import type { OrgEvent } from "@/lib/validation/schema";

export type UseOrgEventsType = {
  events: OrgEvent[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export function useOrgEvents(autoFetch: boolean = false): UseOrgEventsType {
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEvents();
      setEvents(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [autoFetch, fetchEvents]);

  return {
    events,
    loading,
    error,
    onRefresh: fetchEvents,
  };
}
