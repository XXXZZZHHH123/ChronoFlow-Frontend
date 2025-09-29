import {
  CalendarDays,
  Users,
  LayoutDashboard,
  ListChecks,
  Building2,
  type LucideIcon,
} from "lucide-react";

export type Submenu = { href: string; label: string; active: boolean };
export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
};
export type Group = { groupLabel: string; menus: Menu[] };

export function getMenuList(
  pathname: string,
  opts: { hasUser: boolean; selectedEventId: string | null }
): Group[] {
  const { hasUser, selectedEventId } = opts;
  if (!hasUser) return [];

  if (!selectedEventId) {
    return [
      {
        groupLabel: "Administration",
        menus: [
          {
            href: "/events",
            label: "Events",
            active: pathname === "/events",
            submenus: [],
            icon: CalendarDays,
          },
          {
            href: "/organisation",
            label: "Organisation",
            active: pathname === "/organisation",
            submenus: [],
            icon: Building2,
          },
        ],
      },
    ];
  }

  const specificEventBase = `/event/${selectedEventId}`;
  const specificDashboardPath = `${specificEventBase}/dashboard`;
  const specificGroupPath = `${specificEventBase}/groups`;
  const specificTaskPath = `${specificEventBase}/tasks`;

  return [
    {
      groupLabel: "Event Dashboard",
      menus: [
        {
          href: `${specificEventBase}/dashboard`,
          label: "Overview",
          active: pathname === specificDashboardPath,
          submenus: [],
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupLabel: "Event Management",
      menus: [
        {
          href: `${specificEventBase}/groups`,
          label: "Groups",
          active: pathname === specificGroupPath,
          submenus: [],
          icon: Users,
        },
        {
          href: `${specificEventBase}/tasks`,
          label: "Tasks",
          active: pathname === specificTaskPath,
          submenus: [],
          icon: ListChecks,
        },
      ],
    },
  ];
}
