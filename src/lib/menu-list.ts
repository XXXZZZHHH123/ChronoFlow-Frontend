import { CalendarDays, type LucideIcon, UserLock, Users } from "lucide-react";
import { useAuthStore } from "../stores/auth-store";
import { useEventStore } from "@/stores/event-store";

export type Submenu = { href: string; label: string; active: boolean };
export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
};
export type Group = { groupLabel: string; menus: Menu[] };

export function getMenuList(pathname: string): Group[] {
  const { user } = useAuthStore();
  const { selected_event_id } = useEventStore();
  const hasRole = user?.role !== undefined;

  if (!hasRole) {
    return [];
  }

  const isOrganizer = user?.role === "ORGANIZER";
  const isManager = user?.role === "MANAGER";
  const isStaff = user?.role === "STAFF";
  const isEventSelected = selected_event_id !== null;

  if (isOrganizer && !isEventSelected) {
    return [
      {
        groupLabel: "Event Administration",
        menus: [
          {
            href: "/events",
            label: "Event",
            active: pathname === "/events",
            submenus: [],
            icon: CalendarDays,
          },
        ],
      },
      {
        groupLabel: "Member Administration",
        menus: [
          {
            href: "/members",
            label: "Member",
            active: pathname === "/members",
            submenus: [],
            icon: Users,
          },
          {
            href: "/roles",
            label: "Role",
            active: pathname === "/roles",
            submenus: [],
            icon: UserLock,
          },
        ],
      },
    ];
  }

  if ((isManager || isStaff) && !isEventSelected) {
    return [
      {
        groupLabel: "Event Administration",
        menus: [
          {
            href: "/events",
            label: "Event",
            active: pathname === "/events",
            submenus: [],
            icon: CalendarDays,
          },
        ],
      },
      {
        groupLabel: "Member Administration",
        menus: [
          {
            href: "/members",
            label: "Member",
            active: pathname === "/members",
            submenus: [],
            icon: Users,
          },
        ],
      },
    ];
  }

  if (isOrganizer && isEventSelected) {
    return [
      {
        groupLabel: "Member Administration",
        menus: [
          {
            href: "/event/members",
            label: "Member",
            active: pathname === "/event/members",
            submenus: [],
            icon: Users,
          },
        ],
      },
      {
        groupLabel: "Group Administration",
        menus: [
          {
            href: "/event/groups",
            label: "Group",
            active: pathname === "/event/groups",
            submenus: [],
            icon: Users,
          },
        ],
      },
    ];
  }

  if (isStaff && isEventSelected) {
    return [];
  }

  return [];
}
