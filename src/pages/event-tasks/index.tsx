import { useMemo, useState } from "react";
import DynamicTabs, { type TabItem } from "@/components/ui/dynamic-tabs";

export default function TasksPage() {
  const [active, setActive] = useState<"all" | "mine">("all");

  const tabs: TabItem[] = useMemo(
    () => [
      {
        label: "All Tasks",
        value: "all",
        component: <p>all tasks</p>,
      },
      {
        label: "My Tasks",
        value: "mine",
        component: <p>my task</p>,
      },
    ],
    []
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
