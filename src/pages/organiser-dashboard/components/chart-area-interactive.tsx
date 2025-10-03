"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { CalendarIcon } from "lucide-react"
import type { ChartConfig } from "@/components/ui/chart"

import type { OrgEvent } from "@/lib/validation/schema"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Input } from "@/components/ui/input"

type ChartAreaInteractiveProps = {
  events: OrgEvent[]
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function formatInputDate(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

type DatePickerFieldProps = {
  label: string
  value: Date
  min?: Date
  max?: Date
  onChange: (next: Date) => void
}

function DatePickerField({ label, value, min, max, onChange }: DatePickerFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{label}</span>
      <div className="relative w-[140px]">
        <Input
          ref={inputRef}
          type="date"
          value={formatInputDate(value)}
          min={min ? formatInputDate(min) : undefined}
          max={max ? formatInputDate(max) : undefined}
          onChange={(event) => {
            const next = new Date(`${event.target.value}T00:00:00`)
            if (Number.isNaN(next.getTime())) return
            onChange(startOfDay(next))
          }}
          className="h-9 w-full appearance-none px-4 pr-10 text-center tabular-nums [&::-webkit-calendar-picker-indicator]:opacity-0"
        />
        <button
          type="button"
          aria-label={`Select ${label.toLowerCase()} date`}
          onClick={() => {
            const node = inputRef.current
            if (!node) return
            if (typeof node.showPicker === "function") {
              node.showPicker()
              return
            }
            node.focus()
          }}
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CalendarIcon className="h-4 w-4" />
        </button>
      </div>
    </label>
  )
}

const chartConfig = {
  registrations: {
    label: "Registrations",
    color: "var(--primary)",
  },
  openTasks: {
    label: "Open Tasks",
    color: "#22c55e",
  },
  events: {
    label: "Events",
    color: "var(--chart-5, #6366f1)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ events }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [dateRange, setDateRange] = React.useState(() => {
    const now = new Date()
    const start = startOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
    const end = startOfDay(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))
    return { start, end }
  })

  React.useEffect(() => {
    if (!isMobile) return
    setDateRange((prev) => {
      const now = new Date()
      const start = startOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
      const nextEnd = prev.end < start ? startOfDay(now) : prev.end
      return { start, end: startOfDay(nextEnd) }
    })
  }, [isMobile])

  const chartData = React.useMemo(() => {
    const buckets = new Map<
      number,
      { registrations: number; openTasks: number; events: number }
    >()

    events.forEach((event) => {
      const day = new Date(event.startTime)
      day.setHours(0, 0, 0, 0)
      const key = day.getTime()
      const bucket =
        buckets.get(key) ?? { registrations: 0, openTasks: 0, events: 0 }

      bucket.registrations += event.joiningParticipants ?? 0
      bucket.openTasks += event.taskStatus?.remaining ?? 0
      bucket.events += 1

      buckets.set(key, bucket)
    })

    return [...buckets.entries()]
      .sort(([a], [b]) => a - b)
      .map(([timestamp, values]) => ({
        timestamp,
        ...values,
      }))
  }, [events])

  const filtered = React.useMemo(() => {
    const start = dateRange.start.getTime()
    const end = dateRange.end.getTime()

    return chartData.filter((item) => {
      return item.timestamp >= start && item.timestamp <= end
    })
  }, [chartData, dateRange])

  const ticks = React.useMemo(() => {
    const start = new Date(dateRange.start)
    start.setHours(0, 0, 0, 0)
    const end = new Date(dateRange.end)
    end.setHours(0, 0, 0, 0)
    const values: number[] = []
    for (
      let time = start.getTime();
      time <= end.getTime();
      time += 24 * 60 * 60 * 1000
    ) {
              values.push(time)
    }
    return values
  }, [dateRange])

  const displayData = filtered

  const startBoundary = ticks[0] ?? dateRange.start.getTime()
  const endBoundary = ticks[ticks.length - 1] ?? dateRange.end.getTime()

  const visibleTicks = React.useMemo(() => {
    const start = dateRange.start.getTime()
    const end = dateRange.end.getTime()
    const inRange = ticks.filter((tick) => tick >= start && tick <= end)
    if (inRange.length === 0) return [start, end]

    if (inRange[0] !== start) {
      inRange.unshift(start)
    }

    const last = inRange[inRange.length - 1]
    if (last !== end) {
      inRange.push(end)
    }

    return inRange
  }, [ticks, dateRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Event Momentum</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Track registrations and outstanding tasks for your most recent events.
          </span>
          <span className="@[540px]/card:hidden">Recent registrations vs tasks</span>
        </CardDescription>
        <CardAction>
          <div className="flex w-full flex-wrap items-center justify-center gap-4 sm:justify-end">
            <DatePickerField
              label="From"
              value={dateRange.start}
              max={dateRange.end}
              onChange={(next) => setDateRange((prev) => ({ start: next, end: prev.end }))}
            />
            <DatePickerField
              label="To"
              value={dateRange.end}
              min={dateRange.start}
              onChange={(next) => setDateRange((prev) => ({ start: prev.start, end: next }))}
            />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filtered.length === 0 ? (
          <div className="grid h-[240px] place-items-center text-sm text-muted-foreground">
            No events in this time range.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full justify-start"
          >
            <AreaChart data={displayData} margin={{ left: 12, right: 16, top: 12, bottom: 0 }}>
              <ChartLegend className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground" />
              <defs>
                <linearGradient id="fillregistrations" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-registrations)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-registrations)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillopentasks" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-openTasks)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-openTasks)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillevents" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-events)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-events)"
                    stopOpacity={0.15}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={[startBoundary, endBoundary]}
                ticks={visibleTicks}
                scale="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={12}
                interval="preserveStartEnd"
                padding={{ left: 0, right: 0 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) => {
                      const date = new Date(value)
                      return Number.isNaN(date.getTime())
                        ? ""
                        : date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                    }}
                    formatter={(val, key) => {
                      const label =
                        key === "openTasks"
                          ? "open tasks"
                          : key === "registrations"
                            ? "registrations"
                            : "events"
                      return [`${val ?? 0} `, label]
                    }}
                  />
                }
              />
              <Area
                dataKey="openTasks"
                type="monotone"
                fill="url(#fillopentasks)"
                stroke="var(--color-openTasks)"
                strokeWidth={2.5}
              />
              <Area
                dataKey="registrations"
                type="monotone"
                fill="url(#fillregistrations)"
                stroke="var(--color-registrations)"
                strokeWidth={2.5}
              />
              <Area
                dataKey="events"
                type="monotone"
                fill="url(#fillevents)"
                stroke="var(--color-events)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
