import { createContext, useContext } from "react";
import type { EventTask } from "@/lib/validation/schema";

export type TasksContextValue = {
  tasks: EventTask[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  eventId: string | null;
};

export const TasksContext = createContext<TasksContextValue | undefined>(undefined);

export function useEventTasksContext(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useEventTasksContext must be used within a TasksProvider");
  }
  return ctx;
}