import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import DynamicTabs, { type TabItem } from "@/components/ui/dynamic-tabs";
import { AllTasksTab } from "./all-task-tab";
import { TasksProvider } from "@/contexts/event-tasks/EventTasksProvider";
import { useEventTasksContext } from "@/contexts/event-tasks/useEventTasksContext";
import MyTaskPage from "./my-task-tab";
import MyAssignTaskPage from "./my-assign-task";

function EventTasksTabs() {
  const [active, setActive] = useState<"all" | "mine">("all");

  const {loading, error } = useEventTasksContext();

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
          <AllTasksTab />
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
          <MyTaskPage />
        ),
      },
      {
        label: "My Assigned Tasks",
        value: "assigned",
        component: loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <MyAssignTaskPage />
        ),
      },
    ],
    [loading, error]
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
