import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import DynamicTabs, { type TabItem } from "@/components/ui/dynamic-tabs";
import { useAuthStore } from "@/stores/authStore";
import { useEventTasks } from "@/hooks/eventTasks/useEventTasks";

export default function EventTasksPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [active, setActive] = useState<"all" | "mine">("all");

  const user = useAuthStore((s) => s.user);
  const { tasks, loading, error} = useEventTasks(
    eventId ?? null,
    true
  );

  const myTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter((t) => t.assignedUser?.id === user.id);
  }, [tasks, user]);

  const tabs: TabItem[] = useMemo(
    () => [
      {
        label: "All Tasks",
        value: "all",
        component: (
          <>
            {loading ? (
              <p>Loading…</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p>all tasks ({tasks.length})</p>
            )}
          </>
        ),
      },
      {
        label: "My Tasks",
        value: "mine",
        component: (
          <>
            {loading ? (
              <p>Loading…</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p>my tasks ({myTasks.length})</p>
            )}
          </>
        ),
      },
    ],
    [loading, error, tasks.length, myTasks.length]
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
