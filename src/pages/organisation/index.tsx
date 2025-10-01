import { useState, useMemo } from "react";
import DynamicTabs, { type TabItem } from "@/components/ui/dynamic-tabs";
import MembersTab from "./member-tab";
import RoleTab from "./role-tab";
import PermissionTab from "./permission-tab";
import { useAuthStore } from "@/stores/authStore";

export default function OrganisationPage() {
  const [active, setActive] = useState<"members" | "roles" | "permissions">(
    "members"
  );
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";

  const tabs: TabItem[] = useMemo(() => {
    const baseTabs: TabItem[] = [
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
    ];

    if (isAdmin) {
      baseTabs.push({
        label: "Permission Management",
        value: "permissions",
        component: <PermissionTab autoFetch={active === "permissions"} />,
      });
    }

    return baseTabs;
  }, [active, isAdmin]);

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
