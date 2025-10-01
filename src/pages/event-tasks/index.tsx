import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import DynamicTabs, { type TabItem } from "@/components/ui/dynamic-tabs";
import { useAuthStore } from "@/stores/authStore";
import { AllTasksTab } from "./all-task-tab";
import { TasksProvider } from "@/contexts/event-tasks/EventTasksProvider";
import { useEventTasksContext } from "@/contexts/event-tasks/useEventTasksContext";

function EventTasksTabs() {
  const [active, setActive] = useState<"all" | "mine">("all");
  const user = useAuthStore((s) => s.user);

  const { tasks, loading, error } = useEventTasksContext();

  const myTasks = useMemo(() => {
    const uid = user?.id;
    if (!uid) return [];
    return tasks.filter((t) => t.assignedUser?.id === uid);
  }, [tasks, user?.id]);

  const tabs: TabItem[] = useMemo(
    () => [
      {
        label: "All Tasks",
        value: "all",
        component: loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <AllTasksTab tasks={tasks} onEdit={() => {}} onDelete={() => {}} />
        ),
      },
      {
        label: "My Tasks",
        value: "mine",
        component: loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p>my tasks ({myTasks.length})</p>
        ),
      },
    ],
    [loading, error, tasks, myTasks.length]
  );

  return (
    <DynamicTabs
      tabs={tabs}
      defaultTab={active}
      selectedTab={active}
      onTabChange={(v) => setActive(v as typeof active)}
      mountStrategy="lazy"
    />
  );
}

export default function EventTasksPage() {
  const { id: eventId = null } = useParams<{ id: string }>();
  return (
    <TasksProvider eventId={eventId} autoFetch>
      <EventTasksTabs />
    </TasksProvider>
  );
}
