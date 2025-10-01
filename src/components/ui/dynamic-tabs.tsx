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
}

export default function DynamicTabs({
  tabs,
  defaultTab,
  selectedTab,
  onTabChange,
  mountStrategy = "lazy",
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
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

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
