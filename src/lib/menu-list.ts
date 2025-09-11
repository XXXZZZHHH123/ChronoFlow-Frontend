import { type LucideIcon, User } from "lucide-react";
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
  return [
    {
      groupLabel: "Administration",
      menus: [
        {
          href: "/members",
          label: "Member",
          active: pathname === "/members",
          submenus: [],
          icon: User,
        },
      ],
    },
  ];
}
