import DynamicTabs, { type TabItem } from "@/components/ui/dynamic-tabs";
import MembersTab from "./member-tab";

const tabs: TabItem[] = [
  { label: "Member List", value: "member", component: <MembersTab /> },
  { label: "Role Management", value: "roles", component: <p>Role tab</p> },
  {
    label: "Permission Management",
    value: "permissions",
    component: <p>Permission tab</p>,
  },
];

export default function OrganisationPage() {
  return (
    <DynamicTabs tabs={tabs} defaultTab="member" mountStrategy="lazy" />
  );
}
