import { CalendarDays, type LucideIcon, UserLock, Users } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

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

  if (!user) {
    return [];
  }

  return [
    {
      groupLabel: "Event Administration ",
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
      groupLabel: "Member Administration ",
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

    {
      groupLabel: "Chosen E Member",
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
      groupLabel: "Chosen E Group",
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
