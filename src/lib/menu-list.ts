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
  opts: { hasUser: boolean }
): Group[] {
  const { hasUser } = opts;
  if (!hasUser) return [];

  const selectedEventId = pathname.match(/^\/event\/([^/]+)/)?.[1] ?? null;

  if (!selectedEventId) {
    return [
      {
        groupLabel: "Dashboard",
        menus: [
          {
            href: "/member-dashboard",
            label: "Member",
            active: pathname === "/member-dashboard",
            submenus: [],
            icon: CalendarDays,
          },
          {
            href: "/organiser-dashboard",
            label: "Organiser",
            active: pathname === "/organiser-dashboard",
            submenus: [],
            icon: CalendarDays,
          },
        ],
      },
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

  const base = `/event/${selectedEventId}`;
  const dashboardPath = `${base}/dashboard`;
  const groupPath = `${base}/groups`;
  const taskPath = `${base}/tasks`;

  return [
    {
      groupLabel: "Event Dashboard",
      menus: [
        {
          href: dashboardPath,
          label: "Overview",
          active: pathname === dashboardPath,
          submenus: [],
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupLabel: "Event Management",
      menus: [
        {
          href: groupPath,
          label: "Groups",
          active: pathname === groupPath,
          submenus: [],
          icon: Users,
        },
        {
          href: taskPath,
          label: "Tasks",
          active: pathname === taskPath,
          submenus: [],
          icon: ListChecks,
        },
      ],
    },
  ];
}
