import { useState, useMemo } from "react";
import DynamicTabs, { type TabItem } from "@/components/ui/dynamic-tabs";
import MembersTab from "./member-tab";
import RoleTab from "./role-tab";

export default function OrganisationPage() {
  const [active, setActive] = useState<"members" | "roles" | "permissions">(
    "members"
  );

  const tabs: TabItem[] = useMemo(
    () => [
      {
        label: "Member List",
        value: "members",
        component: <MembersTab autoFetch={active === "members"} />,
      },
      {
        label: "Role Management",
        value: "roles",
        component: <RoleTab autoFetch={active === "roles"} />,
      },
      {
        label: "Permission Management",
        value: "permissions",
        component: <p>Permission tab</p>,
      },
    ],
    [active]
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
