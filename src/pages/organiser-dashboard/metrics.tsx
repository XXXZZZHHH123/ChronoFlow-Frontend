import type { SummaryMetric } from "./components/section-cards"
import { IconCalendarEvent, IconClockHour4, IconListCheck, IconUsersGroup } from "@tabler/icons-react"
import type { OrgEvent } from "@/lib/validation/schema"

export function buildMetrics(events: OrgEvent[]): SummaryMetric[] {
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const totalEvents = events.length
  const activeEvents = events.filter((event) => event.status === 1).length

  const upcomingSoon = events.filter(
    (event) =>
      event.startTime.getTime() > now.getTime() &&
      event.startTime.getTime() <= sevenDaysFromNow.getTime()
  )

  const nextEvent = events
    .filter((event) => event.startTime.getTime() > now.getTime())
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0]

  const totalParticipants = events.reduce(
    (sum, event) => sum + (event.joiningParticipants ?? 0),
    0
  )
  const eventsWithParticipants = events.filter(
    (event) => (event.joiningParticipants ?? 0) > 0
  ).length

  const openTasks = events.reduce(
    (sum, event) => sum + (event.taskStatus?.remaining ?? 0),
    0
  )
  const eventsWithOpenTasks = events.filter(
    (event) => (event.taskStatus?.remaining ?? 0) > 0
  ).length

  return [
    {
      title: "Total Events",
      description: "Published, planned, and in-progress events across the organisation.",
      icon: <IconCalendarEvent className="size-4" />, 
      value: totalEvents.toString(),
      badge:
        totalEvents === 0
          ? "No events yet"
          : `${activeEvents} active right now`,
      badgeTone: activeEvents > 0 ? "up" : undefined,
    },
    {
      title: "Starting Soon",
      description: "Events beginning within the next 7 days that need final checks.",
      icon: <IconClockHour4 className="size-4" />, 
      value: upcomingSoon.length.toString(),
      badge: nextEvent
        ? `Next: ${nextEvent.name} • ${nextEvent.startTime.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`
        : "No upcoming events",
    },
    {
      title: "Registrations",
      description: "Confirmed participants across all scheduled events.",
      icon: <IconUsersGroup className="size-4" />, 
      value: totalParticipants.toString(),
      badge:
        eventsWithParticipants === 0
          ? "No participants yet"
          : `Across ${eventsWithParticipants} events`,
      badgeClassName: "text-[#6366f1]",
    },
    {
      title: "Open Tasks",
      description: "Outstanding tasks that still need attention before events go live.",
      icon: <IconListCheck className="size-4" />, 
      value: openTasks.toString(),
      badge:
        openTasks === 0
          ? "All tasks completed"
          : `Present in ${eventsWithOpenTasks} events`,
      badgeTone: openTasks === 0 ? "up" : "down",
    },
  ]
}
