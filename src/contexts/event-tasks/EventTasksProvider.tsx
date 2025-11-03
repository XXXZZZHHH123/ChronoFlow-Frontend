import React, { useCallback } from "react";
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
  const {
    tasks,
    loading,
    error,
    onRefresh: onRefreshTasks,
  } = useEventTasks(eventId, autoFetch);
  const { groups, onRefresh: onRefreshMembers } = useAssignableMembers(
    eventId,
    autoFetch
  );
  const currentUserId = useAuthStore((s) => s.user?.id ?? "");

  const onRefresh = useCallback(async () => {
    await Promise.all([onRefreshTasks(), onRefreshMembers()]);
  }, [onRefreshTasks, onRefreshMembers]);

  const value: TasksContextValue = React.useMemo(() => {
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
