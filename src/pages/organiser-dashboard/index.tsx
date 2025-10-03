import { useMemo } from "react"

import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { DataTable } from "./components/data-table"
import { SectionCards } from "./components/section-cards"
import { SiteHeader } from "./components/site-header"
import { buildMetrics } from "./metrics"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrgEvents } from "@/hooks/events/useOrgEvents"

export default function OrganiserDashboardPage() {
  const { events, loading, error } = useOrgEvents(true)

  const metrics = useMemo(() => buildMetrics(events), [events])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-8">
        <Skeleton className="h-14 w-2/5 max-w-sm" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6 lg:px-8">
        <SiteHeader />
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-destructive">
          Failed to load organiser dashboard: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-8">
      <SiteHeader />
      <SectionCards metrics={metrics} />
      <ChartAreaInteractive events={events} />
      <DataTable events={events} />
    </div>
  )
}
