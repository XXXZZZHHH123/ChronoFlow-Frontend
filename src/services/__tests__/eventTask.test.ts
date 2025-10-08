import { describe, expect, it } from "vitest";
import type { EventTask } from "@/lib/validation/schema";
import {
  categorizeTasks,
  getTaskStatusStyle,
  getTaskStatusText,
  TaskStatusCode,
} from "../eventTask";

describe("services/eventTask getTaskStatusText", () => {
  const cases: Array<[TaskStatusCode, string]> = [
    [0, "Pending"],
    [1, "In Progress"],
    [2, "Completed"],
    [3, "Delayed"],
    [4, "Blocked"],
    [5, "Pending Approval"],
    [6, "Rejected"],
    [null, "Unknown"],
  ];

  it.each(cases)("returns %s for %s", (status, expected) => {
    expect(getTaskStatusText(status)).toBe(expected);
  });
});

describe("services/eventTask getTaskStatusStyle", () => {
  it("returns style map for known statuses", () => {
    expect(getTaskStatusStyle(0)).toEqual({
      badge: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
      dot: "bg-zinc-500",
    });
    expect(getTaskStatusStyle(4)).toEqual({
      badge: "bg-rose-100 text-rose-700 ring-rose-500/20",
      dot: "bg-rose-500",
    });
    expect(getTaskStatusStyle(6)).toEqual({
      badge: "bg-red-100 text-red-700 ring-red-500/20",
      dot: "bg-red-500",
    });
  });

  it("returns unknown styles when status missing", () => {
    expect(getTaskStatusStyle(undefined)).toEqual({
      badge: "bg-gray-100 text-gray-700 ring-gray-500/20",
      dot: "bg-gray-500",
    });
  });
});

const makeTask = (status: number, overrides: Partial<EventTask> = {}): EventTask => ({
  id: `task-${status}`,
  name: `Task ${status}`,
  description: null,
  status,
  startTime: null,
  endTime: null,
  assignedUser: null,
  ...overrides,
});

describe("services/eventTask categorizeTasks", () => {
  it("groups tasks by status buckets", () => {
    const tasks: EventTask[] = [
      makeTask(0),
      makeTask(1),
      makeTask(2),
      makeTask(3),
      makeTask(4),
      makeTask(5),
      makeTask(6),
      makeTask(99),
    ];

    const buckets = categorizeTasks(tasks);

    expect(buckets.pendingTasks).toHaveLength(1);
    expect(buckets.inProgressTasks).toHaveLength(1);
    expect(buckets.completedTasks).toHaveLength(1);
    expect(buckets.delayedTasks).toHaveLength(1);
    expect(buckets.blockedTasks).toHaveLength(1);
    expect(buckets.pendingApprovalTasks).toHaveLength(1);
    expect(buckets.rejectedTasks).toHaveLength(1);
  });

  it("returns empty arrays when input empty", () => {
    const buckets = categorizeTasks([]);

    expect(Object.values(buckets).every((list) => list.length === 0)).toBe(true);
  });
});
