"use client"

import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  type EventStatusCode,
  getEventStatusStyles,
  getEventStatusText,
} from "@/services/event"

import type { OrgEvent } from "@/lib/validation/schema"

type DataTableProps = {
  events: OrgEvent[]
}

const PAGE_SIZE_OPTIONS = [6, 10, 20]

const STATUS_FILTERS = [
  { label: "All statuses", value: "all" },
  { label: "Not started", value: "0" },
  { label: "Active", value: "1" },
  { label: "Completed", value: "2" },
]

function formatSchedule(start: Date, end?: Date | null) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  const startText = formatter.format(start)
  if (!end) return startText
  return `${startText} → ${formatter.format(end)}`
}

function formatLocation(location?: string | null) {
  if (!location) return "—"
  return location
}

export function DataTable({ events }: DataTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0])
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [exporting, setExporting] = useState(false)

  const filteredEvents = useMemo(() => {
    const byStatus =
      statusFilter === "all"
        ? events
        : events.filter((event) => String(event.status) === statusFilter)

    return [...byStatus].sort((a, b) => {
      const diff = a.startTime.getTime() - b.startTime.getTime()
      return sortDir === "asc" ? diff : -diff
    })
  }, [events, statusFilter, sortDir])

  useEffect(() => {
    setPageIndex(0)
  }, [statusFilter, events.length, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize))
  const pageData = useMemo(() => {
    const start = pageIndex * pageSize
    return filteredEvents.slice(start, start + pageSize)
  }, [filteredEvents, pageIndex, pageSize])

  const upcomingHighlight = useMemo(() => {
    const now = Date.now()
    const upcoming = events
      .filter((event) => event.startTime.getTime() >= now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0]
    return upcoming?.id ?? null
  }, [events])

  const handleExport = async () => {
    if (exporting || events.length === 0) return
    setExporting(true)
    try {
      const [excelModule, fileSaverModule] = await Promise.all([
        import("exceljs"),
        import("file-saver"),
      ])

      const ExcelJS = excelModule.default ?? excelModule
      const saveAs = fileSaverModule.saveAs ?? fileSaverModule.default

      if (!ExcelJS?.Workbook || typeof saveAs !== "function") {
        throw new Error("Excel export dependencies failed to load")
      }

      const workbook = new ExcelJS.Workbook()
      workbook.creator = "ChronoFlow"
      workbook.created = new Date()

      const worksheet = workbook.addWorksheet("Events")
      worksheet.columns = [
        { header: "Event", key: "event", width: 36 },
        { header: "Description", key: "description", width: 48 },
        { header: "Status", key: "status", width: 16 },
        { header: "Start", key: "start", width: 22 },
        { header: "End", key: "end", width: 22 },
        { header: "Location / Channel", key: "location", width: 28 },
        { header: "Registrations", key: "registrations", width: 16 },
        { header: "Open Tasks", key: "openTasks", width: 16 },
      ]

      filteredEvents.forEach((event) => {
        const statusCode = (event.status ?? null) as EventStatusCode
        worksheet.addRow({
          event: event.name,
          description: event.description ?? "",
          status: getEventStatusText(statusCode),
          start: event.startTime,
          end: event.endTime ?? undefined,
          location: formatLocation(event.location),
          registrations: event.joiningParticipants ?? 0,
          openTasks: event.taskStatus?.remaining ?? 0,
        })
      })

      worksheet.getRow(1).font = { bold: true }
      worksheet.getColumn("start").numFmt = "yyyy-mm-dd hh:mm"
      worksheet.getColumn("end").numFmt = "yyyy-mm-dd hh:mm"
      worksheet.getColumn("event").alignment = { vertical: "top", wrapText: true }
      worksheet.getColumn("description").alignment = { vertical: "top", wrapText: true }
      worksheet.getColumn("location").alignment = { vertical: "top", wrapText: true }

      const buffer = await workbook.xlsx.writeBuffer()
      const timestamp = new Date().toISOString().slice(0, 10)
      saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `events-${timestamp}.xlsx`
      )
    } catch (error) {
      console.error("Failed to export events", error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">Events Overview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Every event, its status, and what organisers need to follow up on next.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export list"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] text-left">Event</TableHead>
              <TableHead className="w-[140px] text-left">Status</TableHead>
              <TableHead className="w-[220px] text-left">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 px-2"
                  onClick={() =>
                    setSortDir((dir) => (dir === "asc" ? "desc" : "asc"))
                  }
                >
                  Starts → Ends
                  <span className="ml-1 text-xs text-muted-foreground">
                    {sortDir === "asc" ? "↑" : "↓"}
                    <span className="ml-1 hidden sm:inline">(Start date)</span>
                  </span>
                </Button>
              </TableHead>
              <TableHead className="min-w-[180px] text-left">Location / Channel</TableHead>
              <TableHead className="w-[120px] text-left">Registrations</TableHead>
              <TableHead className="w-[120px] text-left">Open Tasks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                  No events match the current filter.
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((event) => {
                const statusCode = (event.status ?? null) as EventStatusCode
                const statusText = getEventStatusText(statusCode)
                const { badge } = getEventStatusStyles(statusCode)
                const isNext = event.id === upcomingHighlight

                return (
                  <TableRow key={event.id} className={isNext ? "bg-primary/5" : undefined}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span>{event.name}</span>
                        {event.description ? (
                          <span className="text-xs text-muted-foreground line-clamp-2">
                            {event.description}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${badge} px-2 py-1 text-xs font-medium`}>{statusText}</Badge>
                    </TableCell>
                    <TableCell>{formatSchedule(event.startTime, event.endTime)}</TableCell>
                    <TableCell className="max-w-[220px]">
                      <span className="line-clamp-2 text-sm text-muted-foreground">
                        {formatLocation(event.location)}
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {event.joiningParticipants ?? 0}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {event.taskStatus?.remaining ?? 0}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
      {filteredEvents.length > pageSize ? (
        <div className="flex flex-col gap-4 border-t px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">
              Page {pageIndex + 1} of {totalPages}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPageIndex(0)}
              disabled={pageIndex === 0}
            >
              «
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={pageIndex === 0}
            >
              ‹
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={pageIndex >= totalPages - 1}
            >
              ›
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPageIndex(totalPages - 1)}
              disabled={pageIndex >= totalPages - 1}
            >
              »
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  )
}
