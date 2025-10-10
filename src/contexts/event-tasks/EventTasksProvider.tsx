import React, { useMemo } from "react";
import { useEventTasks } from "@/hooks/event-tasks/useEventTasks";
import { useAssignableMembers } from "@/hooks/event-tasks/useAssignableMembers";
import { TasksContext, type TasksContextValue } from "./useEventTasksContext";
import { useAuthStore } from "@/stores/authStore";
import {
  filterMyTasks,
  filterMyAssignedTasks,
  type AssigneeOption,
  getAssignableMembersOptions,
} from "@/services/eventTask";

type TasksProviderProps = {
  eventId: string | null;
  autoFetch?: boolean;
  children: React.ReactNode;
};

export function TasksProvider({
  eventId,
  autoFetch = false,
  children,
}: TasksProviderProps) {
  const { tasks, loading, error, onRefresh } = useEventTasks(
    eventId,
    autoFetch
  );
  const { groups } = useAssignableMembers(eventId, autoFetch);
  const currentUserId = useAuthStore((s) => s.user?.id ?? "");

  const value: TasksContextValue = useMemo(() => {
    const myTasks = filterMyTasks(tasks, currentUserId);
    const myAssignedTasks = filterMyAssignedTasks(tasks, currentUserId);

    const assignableMembers: AssigneeOption[] =
      getAssignableMembersOptions(groups);

    return {
      allTasks: tasks,
      myTasks,
      myAssignedTasks,
      loading,
      error,
      onRefresh,
      eventId,
      assignableMembers,
    };
  }, [tasks, groups, loading, error, onRefresh, eventId, currentUserId]);

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}
