import { useMemo } from "react";

import {
  IconCalendarEvent,
  IconClockHour4,
  IconListCheck,
  IconTargetArrow,
} from "@tabler/icons-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useMemberDashboard } from "@/hooks/members/useMemberDashboard";
import type {
  MemberDashboardGroup,
  MemberDashboardTask,
} from "@/lib/validation/schema";
import {
  SectionCards,
  type SummaryMetric,
} from "@/pages/organiser-dashboard/components/section-cards";
import { GroupsSpotlight } from "./components/groups-spotlight";
import { SiteHeader } from "./components/site-header";
import { TaskStatusBreakdown } from "./components/task-status-breakdown";
import { TasksTable } from "./components/tasks-table";

function buildMetrics(
  tasks: MemberDashboardTask[],
  groups: MemberDashboardGroup[]
): SummaryMetric[] {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 2).length;
  const openTasks = totalTasks - completedTasks;
  const now = Date.now();
  const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

  const timeForTask = (task: MemberDashboardTask) =>
    task.endTime?.getTime() ?? task.startTime?.getTime() ?? null;

  const overdueTasks = tasks.filter((task) => {
    const due = timeForTask(task);
    if (!due) return false;
    return due < now && task.status !== 2;
  }).length;

  const dueSoonTasks = tasks.filter((task) => {
    const due = timeForTask(task);
    if (!due) return false;
    return due >= now && due <= sevenDaysFromNow && task.status !== 2;
  });

  const nextDueTask = [...dueSoonTasks].sort((a, b) => {
    const aDue = timeForTask(a) ?? Number.MAX_SAFE_INTEGER;
    const bDue = timeForTask(b) ?? Number.MAX_SAFE_INTEGER;
    return aDue - bDue;
  })[0];

  const formatDueDate = (task?: MemberDashboardTask) => {
    if (!task) return null;
    const due = task.endTime ?? task.startTime;
    if (!due) return null;
    return due.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const uniqueEvents = new Set<string>();
  tasks.forEach((task) => uniqueEvents.add(task.event.id));
  if (uniqueEvents.size === 0) {
    groups.forEach((group) => uniqueEvents.add(group.event.id));
  }

  return [
    {
      title: "Tasks Assigned",
      description: "Everything you&apos;re accountable for across all organiser events.",
      icon: <IconListCheck className="size-4" />,
      value: totalTasks.toString(),
      badge:
        totalTasks === 0
          ? "Waiting for assignments"
          : `${completedTasks} completed so far`,
      badgeTone:
        totalTasks > 0 && completedTasks === totalTasks ? "up" : undefined,
    },
    {
      title: "Open Actions",
      description: "Tasks that still need your attention or follow-up.",
      icon: <IconTargetArrow className="size-4" />,
      value: openTasks.toString(),
      badge:
        openTasks === 0
          ? "All work wrapped up"
          : overdueTasks > 0
            ? `${overdueTasks} overdue`
            : "On track",
      badgeTone: overdueTasks > 0 ? "down" : openTasks === 0 ? "up" : undefined,
    },
    {
      title: "Due Soon",
      description: "Deadlines coming up within the next 7 days.",
      icon: <IconClockHour4 className="size-4" />,
      value: dueSoonTasks.length.toString(),
      badge: formatDueDate(nextDueTask) ?? "No upcoming deadlines",
    },
    {
      title: "Events Involved",
      description: "Unique events and groups you&apos;re currently supporting.",
      icon: <IconCalendarEvent className="size-4" />,
      value: uniqueEvents.size.toString(),
      badge:
        groups.length > 0
          ? `${groups.length} active group${groups.length === 1 ? "" : "s"}`
          : undefined,
    },
  ];
}

export default function MemberDashboardPage() {
  const { member, groups, tasks, loading, error } = useMemberDashboard(true);

  const metrics = useMemo(() => buildMetrics(tasks, groups), [tasks, groups]);
  const leaderNameLookup = useMemo(() => {
    const map = new Map<string, string>();

    if (member?.id) {
      const label = member.name?.trim() || member.username || member.email;
      if (label) {
        map.set(member.id, label);
      }
    }

    tasks.forEach((task) => {
      const assigned = task.assignedUser;
      if (assigned?.id) {
        const label =
          assigned.name?.trim() ||
          assigned.email?.trim() ||
          assigned.phone?.trim() ||
          assigned.id;
        map.set(assigned.id, label);
      }

      assigned?.groups?.forEach((group) => {
        if (group.leadUserId && group.leadUserName) {
          map.set(group.leadUserId, group.leadUserName);
        }
      });
    });

    return Object.fromEntries(map);
  }, [member, tasks]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6 lg:px-8">
        <SiteHeader member={member} />
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-destructive">
          Failed to load member dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-8">
      <SiteHeader member={member} />
      <SectionCards metrics={metrics} />
      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <TasksTable tasks={tasks} />
        <div className="flex flex-col gap-6">
          <TaskStatusBreakdown tasks={tasks} />
          <GroupsSpotlight groups={groups} leaderNameLookup={leaderNameLookup} />
        </div>
      </div>
    </div>
  );
}
