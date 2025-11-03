import { useEventTasksContext } from "@/contexts/event-tasks/useEventTasksContext";
import { useMemo, useState } from "react";
import DynamicTabs, { type TabItem } from "@/components/ui/dynamic-tabs";
import { AllTasksTab } from "../all-task-tab";
import { MyTaskTab } from "../my-task-tab";
import { MyAssignTaskTab } from "../my-assign-task";
import TaskConfigCreateFormModal from "./TaskConfigCreateForm";
import { Button } from "@/components/ui/button";

export function EventTasksTabs() {
  const [active, setActive] = useState<"all" | "mine">("all");

  const { eventId, loading, error, onRefresh, assignableMembers} =
    useEventTasksContext();

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
          <MyTaskTab />
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
          <MyAssignTaskTab />
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
      headerRight={
        eventId ? (
          <TaskConfigCreateFormModal
            eventId={eventId}
            onRefresh={onRefresh}
            assigneeOptions={assignableMembers}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Button disabled>Create task</Button>
            <span className="text-xs text-muted-foreground">
              Select an event to create tasks
            </span>
          </div>
        )
      }
    />
  );
}
