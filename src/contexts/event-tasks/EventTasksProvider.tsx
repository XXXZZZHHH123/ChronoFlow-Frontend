import React, { useMemo } from "react";
import { useEventTasks } from "@/hooks/event-tasks/useEventTasks";
import { TasksContext, type TasksContextValue } from "./useEventTasksContext";

type TasksProviderProps = {
  eventId: string | null;
  autoFetch?: boolean;
  children: React.ReactNode;
};

export function TasksProvider({ eventId, autoFetch = false, children }: TasksProviderProps) {
  const { tasks, loading, error, onRefresh } = useEventTasks(eventId, autoFetch);

  const value: TasksContextValue = useMemo(
    () => ({ tasks, loading, error, onRefresh, eventId }),
    [tasks, loading, error, onRefresh, eventId]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}