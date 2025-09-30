// src/hooks/groups/useGroups.ts
import { useCallback, useEffect, useState } from "react";
import { getGroupsByEvent } from "@/api/groupApi";
import type { Group } from "@/lib/validation/schema";

export type UseGroupsType = {
  groups: Group[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export function useGroups(
  eventId: string | null,
  autoFetch: boolean = false
): UseGroupsType {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!eventId) {
      setGroups([]);
      setError("No event selected");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getGroupsByEvent(eventId);
      setGroups(data);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("Failed to load groups");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (autoFetch && eventId) {
      void fetchGroups();
    }
  }, [autoFetch, eventId, fetchGroups]);

  return { groups, loading, error, onRefresh: fetchGroups };
}
