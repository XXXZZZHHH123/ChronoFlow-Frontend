import { describe, expect, it } from "vitest";
import {
  categorizeTasksForBoard,
  getTaskStatusStyle,
  getTaskStatusText,
  filterMyTasks,
  filterMyAssignedTasks,
  getInitialName,
  type TaskStatusCode,
} from "@/services/eventTask";

type TestUser = {
  id: string;
  name?: string;
  groups?: { id?: string; name: string }[];
} | null;

type TestTask = {
  id: string;
  name: string;
  description: string | null;
  status: TaskStatusCode | number | null | undefined;
  startTime: string | null;
  endTime: string | null;
  assignedUser: TestUser;
  assignerUser: TestUser;
};


const makeTask = (status: TaskStatusCode, overrides: Partial<TestTask> = {}): TestTask => ({
  id: `task-${String(status)}`,
  name: `Task ${String(status)}`,
  description: null,
  status,
  startTime: null,
  endTime: null,
  assignedUser: null,
  assignerUser: null,
  ...overrides,
});

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
    [undefined, "Unknown"],
  ];

  it.each(cases)("returns '%s' for status %s", (status, expected) => {
    expect(getTaskStatusText(status)).toBe(expected);
  });
});

describe("services/eventTask getTaskStatusStyle", () => {
  it("returns known theme styles", () => {
    expect(getTaskStatusStyle(0)).toEqual({
      text: "Pending",
      theme: "bg-gray-100 text-gray-700 ring-gray-500/20",
      dot: "bg-gray-500",
    });
    expect(getTaskStatusStyle(4)).toEqual({
      text: "Blocked",
      theme: "bg-amber-100 text-amber-700 ring-amber-500/20",
      dot: "bg-amber-500",
    });
    expect(getTaskStatusStyle(6)).toEqual({
      text: "Rejected",
      theme: "bg-red-100 text-red-700 ring-red-500/20",
      dot: "bg-red-500",
    });
  });

  it("returns unknown styles for missing or invalid status (no text key)", () => {
    const unknown1 = getTaskStatusStyle(undefined);
    expect(unknown1).toEqual({
      theme: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
      dot: "bg-zinc-500",
    });
    expect("text" in unknown1).toBe(false);

    const unknown2 = getTaskStatusStyle(99 as TaskStatusCode);
    expect(unknown2).toEqual({
      theme: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
      dot: "bg-zinc-500",
    });
    expect("text" in unknown2).toBe(false);
  });
});

describe("services/eventTask categorizeTasksForBoard", () => {
  it("categorizes tasks correctly", () => {
    const tasks: TestTask[] = [
      makeTask(0),
      makeTask(1),
      makeTask(2),
      makeTask(3),
      makeTask(4),
      makeTask(5),
      makeTask(6),
      makeTask(99 as TaskStatusCode),
    ];

    const buckets = categorizeTasksForBoard(
      tasks as unknown as Parameters<typeof categorizeTasksForBoard>[0]
    );

    expect(buckets.pending).toHaveLength(1);
    expect(buckets.progress).toHaveLength(1);
    expect(buckets.completed).toHaveLength(1);
    expect(buckets.delayed).toHaveLength(1);
    expect(buckets.blocked).toHaveLength(1);
    expect(buckets.pendingApproval).toHaveLength(1);
    expect(buckets.rejected).toHaveLength(1);
  });

  it("returns empty arrays for empty input", () => {
    const buckets = categorizeTasksForBoard(
      [] as unknown as Parameters<typeof categorizeTasksForBoard>[0]
    );
    expect(Object.values(buckets).every((arr) => arr.length === 0)).toBe(true);
  });
});

describe("services/eventTask filters", () => {
  const userId = "u1";

  const tasks: TestTask[] = [
    makeTask(1, { assignedUser: { id: "u1", name: "Alice", groups: [] } }),
    makeTask(2, { assignedUser: { id: "u2", name: "Bob", groups: [] } }),
    makeTask(3, { assignerUser: { id: "u1", name: "Alice", groups: [] } }),
    makeTask(4, { assignerUser: { id: "u2", name: "Bob", groups: [] } }),
  ];

  it("filters my tasks correctly", () => {
    const filtered = filterMyTasks(
      tasks as unknown as Parameters<typeof filterMyTasks>[0],
      userId
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].assignedUser?.id).toBe(userId);
  });

  it("filters my assigned tasks correctly", () => {
    const filtered = filterMyAssignedTasks(
      tasks as unknown as Parameters<typeof filterMyAssignedTasks>[0],
      userId
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].assignerUser?.id).toBe(userId);
  });
});

describe("services/eventTask getInitialName", () => {
  it("returns initials from name", () => {
    expect(getInitialName("John Doe")).toBe("JD");
    expect(getInitialName("  alice   ")).toBe("A");
    expect(getInitialName("bob charlie delta")).toBe("BC");
  });

  it("returns ? for invalid or empty input", () => {
    expect(getInitialName("")).toBe("?");
    expect(getInitialName(undefined)).toBe("?");
    expect(getInitialName(null as unknown as string)).toBe("?");
  });
});