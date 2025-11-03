import { useCallback, useEffect, useState } from "react";
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
  const [groups, setGroups] = useState<EventGroupWithAssignableMembers[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!eventId) {
      setGroups([]);
      setError("No event selected");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getAssignableMembers(eventId);
      setGroups(data);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("Failed to load members");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (autoFetch && eventId) void fetchMembers();
  }, [autoFetch, eventId, fetchMembers]);

  return { groups, loading, error, onRefresh: fetchMembers };
}