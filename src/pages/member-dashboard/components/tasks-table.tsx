import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { MemberDashboardTask } from "@/lib/validation/schema";
import {
  getTaskStatusStyle,
  getTaskStatusText,
  type TaskStatusCode,
} from "@/services/eventTask";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const TASK_STATUS_VALUES: TaskStatusCode[] = [0, 1, 2, 3, 4, 5, 6];
const TASK_STATUS_FILTERS: Array<{ label: string; value: string }> = [
  { label: "All statuses", value: "all" },
  ...TASK_STATUS_VALUES.map((status) => ({
    value: String(status),
    label: getTaskStatusText(status),
  })),
];

const PAGE_SIZE_OPTIONS = [6, 10, 20];

function formatSchedule(task: MemberDashboardTask) {
  const start = task.startTime ?? null;
  const end = task.endTime ?? null;

  if (!start && !end) return "—";
  if (start && !end) return DATE_TIME_FORMATTER.format(start);
  if (!start && end) return DATE_TIME_FORMATTER.format(end);
  if (!start || !end) return "—";

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return `${DATE_TIME_FORMATTER.format(start)} – ${DATE_TIME_FORMATTER.format(end)}`;
  }

  return `${DATE_TIME_FORMATTER.format(start)} → ${DATE_TIME_FORMATTER.format(end)}`;
}

type TasksTableProps = {
  tasks: MemberDashboardTask[];
};

export function TasksTable({ tasks }: TasksTableProps) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [exporting, setExporting] = useState(false);

  const now = Date.now();
  const threeDays = 3 * 24 * 60 * 60 * 1000;

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "all" || String(task.status) === statusFilter;
      return matchesStatus;
    });
  }, [tasks, statusFilter]);

  useEffect(() => {
    setPageIndex(0);
  }, [statusFilter, pageSize, tasks.length]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredTasks.length / pageSize) - 1);
    setPageIndex((prev) => Math.min(prev, maxPage));
  }, [filteredTasks.length, pageSize]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const aDue = a.endTime?.getTime() ?? a.startTime?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bDue = b.endTime?.getTime() ?? b.startTime?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aDue - bDue;
    });
  }, [filteredTasks]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const pageTasks = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedTasks.slice(start, start + pageSize);
  }, [sortedTasks, pageIndex, pageSize]);

  const handleNavigate = (task: MemberDashboardTask) => {
    navigate(`/event/${task.event.id}/tasks`, {
      state: { highlightTaskId: task.id },
    });
  };

  const handleExport = async () => {
    if (exporting || filteredTasks.length === 0) return;
    setExporting(true);
    try {
      const [excelModule, fileSaverModule] = await Promise.all([
        import("exceljs"),
        import("file-saver"),
      ]);

      const ExcelJS = excelModule.default ?? excelModule;
      const saveAs = fileSaverModule.saveAs ?? fileSaverModule.default;

      if (!ExcelJS?.Workbook || typeof saveAs !== "function") {
        throw new Error("Task export dependencies failed to load");
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "ChronoFlow";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("Tasks");
      worksheet.columns = [
        { header: "Task", key: "task", width: 36 },
        { header: "Event", key: "event", width: 28 },
        { header: "Status", key: "status", width: 18 },
        { header: "Start", key: "start", width: 22 },
        { header: "End", key: "end", width: 22 },
        { header: "Assignee Name", key: "assigneeName", width: 26 },
        { header: "Assignee Email", key: "assigneeEmail", width: 32 },
        { header: "Assignee Phone", key: "assigneePhone", width: 20 },
      ];

      sortedTasks.forEach((task) => {
        worksheet.addRow({
          task: task.name,
          event: task.event.name,
          status: getTaskStatusText(task.status as TaskStatusCode),
          start: task.startTime ?? undefined,
          end: task.endTime ?? undefined,
          assigneeName: task.assignedUser?.name ?? "",
          assigneeEmail: task.assignedUser?.email ?? "",
          assigneePhone: task.assignedUser?.phone ?? "",
        });
      });

      worksheet.getColumn("start").numFmt = "yyyy-mm-dd hh:mm";
      worksheet.getColumn("end").numFmt = "yyyy-mm-dd hh:mm";

      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date().toISOString().slice(0, 10);
      saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `tasks-${timestamp}.xlsx`
      );
    } catch (error) {
      console.error("Failed to export tasks", error);
    } finally {
      setExporting(false);
    }
  };

  const hasTasks = tasks.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">Task Assignments</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your latest responsibilities across events and when they are due.
          </p>
        </div>
        {hasTasks ? (
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUS_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? "Exporting..." : "Export list"}
            </Button>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {!hasTasks ? (
          <div className="px-6 py-12 text-sm text-muted-foreground">
            No tasks assigned yet. Once organisers assign work to you, it will appear here.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Task</TableHead>
                <TableHead className="w-[200px]">Event</TableHead>
                <TableHead className="w-[200px]">Schedule</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="min-w-[160px]">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    No tasks match the current filter.
                  </TableCell>
                </TableRow>
              ) : (
                pageTasks.map((task) => {
                  const status = task.status as TaskStatusCode;
                  const style = getTaskStatusStyle(status);
                  const dueTime = task.endTime?.getTime() ?? task.startTime?.getTime() ?? null;
                  const isCompleted = status === 2;
                  const isOverdue = !!dueTime && dueTime < now && !isCompleted;
                  const isDueSoon =
                    !!dueTime && dueTime >= now && dueTime - now <= threeDays && !isCompleted;

                  return (
                    <TableRow
                      key={task.id}
                      onClick={() => handleNavigate(task)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isOverdue
                          ? "bg-rose-50/80 text-rose-900 hover:bg-rose-50"
                          : isDueSoon
                            ? "bg-amber-50/60 hover:bg-amber-50"
                            : undefined
                      )}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleNavigate(task);
                        }
                      }}
                    >
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">{task.name}</span>
                          {task.description ? (
                            <span className="text-sm text-muted-foreground">{task.description}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-foreground">{task.event.name}</span>
                          {task.event.location ? (
                            <span className="text-xs text-muted-foreground">{task.event.location}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground">
                        {formatSchedule(task)}
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          variant="outline"
                          className={cn("ring-1 ring-inset", style.badge)}
                        >
                          {getTaskStatusText(status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          {task.assignedUser?.name ? (
                            <span className="font-medium text-foreground">
                              {task.assignedUser.name}
                            </span>
                          ) : null}
                          {task.assignedUser?.email ? (
                            <span>{task.assignedUser.email}</span>
                          ) : null}
                          {task.assignedUser?.phone ? <span>{task.assignedUser.phone}</span> : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {filteredTasks.length > pageSize ? (
        <div className="flex flex-col gap-4 border-t px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPageIndex(0);
              }}
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
  );
}
