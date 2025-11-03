import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TabItem {
  label: string;
  value: string;
  component: React.ReactNode;
}

type MountStrategy = "eager" | "lazy";

interface DynamicTabsProps {
  tabs: TabItem[];
  defaultTab: string;
  selectedTab?: string;
  onTabChange?: (tab: string) => void;
  mountStrategy?: MountStrategy;
  headerRight?: React.ReactNode;
}

export default function DynamicTabs({
  tabs,
  defaultTab,
  selectedTab,
  onTabChange,
  mountStrategy = "lazy",
  headerRight,
}: DynamicTabsProps) {
  const [internalTab, setInternalTab] = useState(defaultTab);

  useEffect(() => {
    setInternalTab(defaultTab);
  }, [defaultTab]);

  const safeDefault = useMemo(
    () =>
      tabs.some((t) => t.value === defaultTab)
        ? defaultTab
        : tabs[0]?.value ?? "",
    [tabs, defaultTab]
  );
  const currentTab = selectedTab ?? internalTab ?? safeDefault;

  const handleChange = (val: string) => {
    if (onTabChange) {
      onTabChange(val);
    } else {
      setInternalTab(val);
    }
  };

  return (
    <Tabs value={currentTab} onValueChange={handleChange} className="w-full">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="w-full sm:w-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Right-side slot (defaults to empty) */}
        <div className="w-full sm:w-auto">{headerRight ?? null}</div>
      </div>

      {mountStrategy === "eager"
        ? tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.component}
            </TabsContent>
          ))
        : tabs
            .filter((t) => t.value === currentTab)
            .map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.component}
              </TabsContent>
            ))}
    </Tabs>
  );
}
