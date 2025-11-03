import { useCallback, useEffect, useState } from "react";
import { getEventTasks } from "@/api/eventTasksApi";
import type { EventTask } from "@/lib/validation/schema";

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
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!eventId) {
      setTasks([]);
      setError("No event selected");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getEventTasks(eventId);
      setTasks(data);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (autoFetch && eventId) void fetchTasks();
  }, [autoFetch, eventId, fetchTasks]);

  return { tasks, loading, error, onRefresh: fetchTasks };
}