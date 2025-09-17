import { CalendarDays, type LucideIcon, UserLock, Users } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useEventStore } from "@/stores/event-store";
import { hasAnyRole, normalizeRoles, type Role } from "./shared/role";

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
  const { user } = useAuthStore.getState();
  const { selected_event_id } = useEventStore.getState();

  if (!user) {
    return [];
  }

  const roles: Role[] = normalizeRoles(user.role ?? []);

  if (roles.length === 0) return [];

  const isOrganizer = hasAnyRole(roles, "ORGANIZER");
  const isManager = hasAnyRole(roles, "MANAGER");
  const isStaff = hasAnyRole(roles, "STAFF");
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
