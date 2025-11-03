"use client"

import * as React from "react"
import {
  IconAdjustmentsCog,
  IconCalendarEvent,
  IconLayoutDashboard,
  IconShieldCheck,
  IconUsersGroup,
} from "@tabler/icons-react"

import { NavDocuments } from "./nav-documents"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const sidebarData = {
  user: {
    name: "Lushuwen",
    email: "lushuwen3@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "仪表盘概览",
      url: "/organiser-dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "成员管理",
      url: "/member-dashboard",
      icon: IconUsersGroup,
    },
    {
      title: "活动列表",
      url: "/events",
      icon: IconCalendarEvent,
    },
    {
      title: "角色与权限",
      url: "/organisation",
      icon: IconShieldCheck,
    },
  ],
  navSecondary: [
    {
      title: "系统设置",
      url: "/organisation",
      icon: IconAdjustmentsCog,
    },
  ],
  documents: [
    {
      name: "最近浏览的活动",
      url: "/events",
      icon: IconCalendarEvent,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/organiser-dashboard">
                <IconLayoutDashboard className="!size-5" />
                <span className="text-base font-semibold">ChronoFlow</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        <NavDocuments items={sidebarData.documents} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
