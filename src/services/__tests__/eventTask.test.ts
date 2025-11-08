import {
  TaskStatusEnum,
  TaskActionEnum,
  getTaskStatusText,
  getTaskStatusStyle,
  categorizeTasksForBoard,
  filterMyTasks,
  filterMyAssignedTasks,
  getInitialName,
  getStatusUX,
  getActionOptionsForStatus,
  getAssignableMembersOptions,
  buildTaskCreateFormData,
  buildTaskConfigFormData,
  getActionMeta,
  formatDT,
  formatFileBytes,
  actionsThatAllowFiles,
} from "@/services/eventTask";

import { describe, it, expect } from "vitest";

const pad = (n: number) => String(n).padStart(2, "0");
const fmtLocal = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

describe("status helpers", () => {
  it("getTaskStatusText returns friendly text and Unknown for null/unknown", () => {
    expect(getTaskStatusText(TaskStatusEnum.PENDING)).toBe("Pending");
    expect(getTaskStatusText(TaskStatusEnum.IN_PROGRESS)).toBe("In Progress");
    expect(getTaskStatusText(99 as any)).toBe("Unknown");
    expect(getTaskStatusText(null)).toBe("Unknown");
    expect(getTaskStatusText(undefined)).toBe("Unknown");
  });

  it("getTaskStatusStyle returns theme/dot and unknown style for invalid", () => {
    expect(getTaskStatusStyle(TaskStatusEnum.COMPLETED)).toMatchObject({
      theme: expect.stringContaining("green"),
      dot: expect.stringContaining("green"),
    });
    expect(getTaskStatusStyle(123 as any)).toMatchObject({
      theme: expect.stringContaining("zinc"),
      dot: expect.stringContaining("zinc"),
    });
  });
});

describe("board categorization", () => {
  const makeTask = (id: string, status: number) =>
    ({
      id,
      name: id,
      status,
    } as any);

  it("splits tasks into buckets and ignores unknown status", () => {
    const tasks = [
      makeTask("t0", 0),
      makeTask("t1", 1),
      makeTask("t2", 2),
      makeTask("t3", 3),
      makeTask("t4", 4),
      makeTask("t5", 5),
      makeTask("t6", 6),
      makeTask("tx", 99 as any),
    ];
    const b = categorizeTasksForBoard(tasks as any);

    expect(b.pending.map((t) => t.id)).toEqual(["t0"]);
    expect(b.progress.map((t) => t.id)).toEqual(["t1"]);
    expect(b.completed.map((t) => t.id)).toEqual(["t2"]);
    expect(b.delayed.map((t) => t.id)).toEqual(["t3"]);
    expect(b.blocked.map((t) => t.id)).toEqual(["t4"]);
    expect(b.pendingApproval.map((t) => t.id)).toEqual(["t5"]);
    expect(b.rejected.map((t) => t.id)).toEqual(["t6"]);
  });
});

describe("task filters", () => {
  const tasks: any[] = [
    {
      id: "a",
      assignedUser: { id: "U1" },
      assignerUser: { id: "U2" },
    },
    {
      id: "b",
      assignedUser: { id: "U2" },
      assignerUser: { id: "U1" },
    },
    {
      id: "c",
      assignedUser: null,
      assignerUser: null,
    },
  ];

  it("filterMyTasks keeps tasks where I'm the assignee", () => {
    expect(filterMyTasks(tasks as any, "U1").map((t) => t.id)).toEqual(["a"]);
    expect(filterMyTasks(tasks as any, "U2").map((t) => t.id)).toEqual(["b"]);
  });

  it("filterMyAssignedTasks keeps tasks where I'm the assigner", () => {
    expect(filterMyAssignedTasks(tasks as any, "U1").map((t) => t.id)).toEqual([
      "b",
    ]);
    expect(filterMyAssignedTasks(tasks as any, "U2").map((t) => t.id)).toEqual([
      "a",
    ]);
  });
});

describe("initials", () => {
  it("getInitialName builds up to 2 initials; returns '?' for empty", () => {
    expect(getInitialName("Ada Lovelace")).toBe("AL");
    expect(getInitialName("single")).toBe("S");
    expect(getInitialName("  alan   mathison   turing ")).toBe("AM");
    expect(getInitialName("")).toBe("?");
    expect(getInitialName()).toBe("?");
  });
});

describe("status UX messages", () => {
  it("assignee and assigner messages differ", () => {
    expect(getStatusUX(TaskStatusEnum.PENDING, false)).toMatch(/accept/i);
    expect(getStatusUX(TaskStatusEnum.PENDING, true)).toMatch(/assignee/i);
  });

  it("null/undefined returns null", () => {
    expect(getStatusUX(null, true)).toBeNull();
    expect(getStatusUX(undefined, false)).toBeNull();
  });

  it("returns tailored copy for every assigner-visible status", () => {
    expect(getStatusUX(TaskStatusEnum.IN_PROGRESS, true)).toMatch(
      /working on this task/i
    );
    expect(getStatusUX(TaskStatusEnum.DELAYED, true)).toMatch(/overdue/i);
    expect(getStatusUX(TaskStatusEnum.BLOCKED, true)).toMatch(/blocked/i);
    expect(getStatusUX(TaskStatusEnum.REJECTED, true)).toMatch(/rejected/i);
    expect(getStatusUX(TaskStatusEnum.PENDING_APPROVAL, true)).toMatch(
      /waiting for your review/i
    );
    expect(getStatusUX(TaskStatusEnum.COMPLETED, true)).toMatch(/approved/i);
  });

  it("returns tailored copy for every assignee-visible status", () => {
    expect(getStatusUX(TaskStatusEnum.IN_PROGRESS, false)).toMatch(
      /working on this task/i
    );
    expect(getStatusUX(TaskStatusEnum.DELAYED, false)).toMatch(/overdue/i);
    expect(getStatusUX(TaskStatusEnum.BLOCKED, false)).toMatch(/blocked/i);
    expect(getStatusUX(TaskStatusEnum.REJECTED, false)).toMatch(/rejected/i);
    expect(getStatusUX(TaskStatusEnum.PENDING_APPROVAL, false)).toMatch(
      /submitted the task/i
    );
    expect(getStatusUX(TaskStatusEnum.COMPLETED, false)).toMatch(/completed/i);
  });

  it("returns null for unrecognized status codes", () => {
    expect(getStatusUX(777 as any, true)).toBeNull();
    expect(getStatusUX(888 as any, false)).toBeNull();
  });
});

describe("action options", () => {
  it("assigner: PENDING has Update/Delete/Reassign", () => {
    const opts = getActionOptionsForStatus(TaskStatusEnum.PENDING, true);
    expect(opts.map((o) => o.label)).toEqual([
      "Update",
      "Delete",
      "Reassign",
    ]);
    expect(opts.map((o) => o.value)).toEqual([
      TaskActionEnum.UPDATE,
      TaskActionEnum.DELETE,
      TaskActionEnum.ASSIGN,
    ]);
  });

  it("assignee: IN_PROGRESS has Submit/Block", () => {
    const opts = getActionOptionsForStatus(TaskStatusEnum.IN_PROGRESS, false);
    expect(opts.map((o) => o.label)).toEqual(["Submit", "Block"]);
    expect(opts.map((o) => o.value)).toEqual([
      TaskActionEnum.SUBMIT,
      TaskActionEnum.BLOCK,
    ]);
  });

  it("assigner: IN_PROGRESS has Update/Block/Delete/Ressign", () => {
    const opts = getActionOptionsForStatus(TaskStatusEnum.IN_PROGRESS, true);
    expect(opts.map((o) => o.label)).toEqual([
      "Update",
      "Block",
      "Delete",
      "Ressign",
    ]);
    expect(opts.map((o) => o.value)).toEqual([
      TaskActionEnum.UPDATE,
      TaskActionEnum.BLOCK,
      TaskActionEnum.DELETE,
      TaskActionEnum.ASSIGN,
    ]);
  });

  it("assigner: DELAYED has Update/Block/Delete/Reassign", () => {
    const opts = getActionOptionsForStatus(TaskStatusEnum.DELAYED, true);
    expect(opts.map((o) => o.label)).toEqual([
      "Update",
      "Block",
      "Delete",
      "Reassign",
    ]);
    expect(opts.map((o) => o.value)).toEqual([
      TaskActionEnum.UPDATE,
      TaskActionEnum.BLOCK,
      TaskActionEnum.DELETE,
      TaskActionEnum.ASSIGN,
    ]);
  });

  it("assigner: BLOCKED has Update/Delete/Reassign", () => {
    const opts = getActionOptionsForStatus(TaskStatusEnum.BLOCKED, true);
    expect(opts.map((o) => o.label)).toEqual([
      "Update",
      "Delete",
      "Reassign",
    ]);
    expect(opts.map((o) => o.value)).toEqual([
      TaskActionEnum.UPDATE,
      TaskActionEnum.DELETE,
      TaskActionEnum.ASSIGN,
    ]);
  });

  it("assigner: REJECTED has Update/Reassign/Delete", () => {
    const opts = getActionOptionsForStatus(TaskStatusEnum.REJECTED, true);
    expect(opts.map((o) => o.label)).toEqual([
      "Update",
      "Reassign",
      "Delete",
    ]);
    expect(opts.map((o) => o.value)).toEqual([
      TaskActionEnum.UPDATE,
      TaskActionEnum.ASSIGN,
      TaskActionEnum.DELETE,
    ]);
  });

  it("assigner: PENDING_APPROVAL can only Approve", () => {
    const opts = getActionOptionsForStatus(
      TaskStatusEnum.PENDING_APPROVAL,
      true
    );
    expect(opts).toHaveLength(1);
    expect(opts[0]?.label).toBe("Approve");
    expect(opts[0]?.value).toBe(TaskActionEnum.APPROVE);
  });

  it("assigner: COMPLETED can only Delete", () => {
    const opts = getActionOptionsForStatus(TaskStatusEnum.COMPLETED, true);
    expect(opts).toHaveLength(1);
    expect(opts[0]?.label).toBe("Delete");
    expect(opts[0]?.value).toBe(TaskActionEnum.DELETE);
  });

  it("assignee: PENDING has Accept/Reject", () => {
    const opts = getActionOptionsForStatus(TaskStatusEnum.PENDING, false);
    expect(opts.map((o) => o.label)).toEqual(["Accept", "Reject"]);
    expect(opts.map((o) => o.value)).toEqual([
      TaskActionEnum.ACCEPT,
      TaskActionEnum.REJECT,
    ]);
  });

  it("assignee: DELAYED mirrors Submit/Block choices", () => {
    const opts = getActionOptionsForStatus(TaskStatusEnum.DELAYED, false);
    expect(opts.map((o) => o.label)).toEqual(["Submit", "Block"]);
    expect(opts.map((o) => o.value)).toEqual([
      TaskActionEnum.SUBMIT,
      TaskActionEnum.BLOCK,
    ]);
  });

  it("assignee: BLOCKED, REJECTED, PENDING_APPROVAL, COMPLETED have no follow-up actions", () => {
    expect(
      getActionOptionsForStatus(TaskStatusEnum.BLOCKED, false)
    ).toHaveLength(0);
    expect(
      getActionOptionsForStatus(TaskStatusEnum.REJECTED, false)
    ).toHaveLength(0);
    expect(
      getActionOptionsForStatus(TaskStatusEnum.PENDING_APPROVAL, false)
    ).toHaveLength(0);
    expect(
      getActionOptionsForStatus(TaskStatusEnum.COMPLETED, false)
    ).toHaveLength(0);
  });

  it("unknown status yields empty array", () => {
    expect(getActionOptionsForStatus(999 as any, true)).toEqual([]);
    expect(getActionOptionsForStatus(999 as any, false)).toEqual([]);
  });
});

describe("assignable members options", () => {
  it("dedupes members across groups and annotates with group name", () => {
    const groups: any = [
      {
        name: "Ops",
        members: [
          { id: "m1", username: "alice" },
          { id: "m2", username: "bob" },
        ],
      },
      {
        name: "Logistics",
        members: [
          { id: "m2", username: "bob" }, // duplicate
          { id: "m3", username: "carol" },
        ],
      },
    ];
    const opts = getAssignableMembersOptions(groups);
    expect(opts).toEqual([
      { id: "m1", label: "alice (Ops)" },
      { id: "m2", label: "bob (Ops)" }, // first time seen
      { id: "m3", label: "carol (Logistics)" },
    ]);
  });
});

describe("form-data builders", () => {
  it("buildTaskCreateFormData appends expected fields and files", () => {
    const start = new Date(2025, 0, 2, 3, 4, 5);
    const end = new Date(2025, 0, 2, 6, 7, 8);
    const f1 = new File([new Blob(["x"])], "a.txt", { type: "text/plain" });
    const f2 = new File([new Blob(["y"])], "b.md", { type: "text/markdown" });

    const fd = buildTaskCreateFormData({
      name: "Task A",
      targetUserId: 123,
      description: "desc",
      remark: "note",
      startTime: start,
      endTime: end,
      files: [f1, f2],
    } as any);

    const entries = Array.from(fd.entries());
    expect(entries).toContainEqual(["name", "Task A"]);
    expect(entries).toContainEqual(["targetUserId", "123"]);
    expect(entries).toContainEqual(["description", "desc"]);
    expect(entries).toContainEqual(["remark", "note"]);
    expect(entries).toContainEqual(["startTime", fmtLocal(start)]);
    expect(entries).toContainEqual(["endTime", fmtLocal(end)]);

    const fileNames = entries
      .filter(([k]) => k === "files")
      .map(([, v]) => (v as File).name);
    expect(fileNames).toEqual(["a.txt", "b.md"]);
  });

  it("buildTaskConfigFormData appends only provided fields and coerces types", () => {
    const start = new Date(2024, 6, 1, 9, 10, 11);

    const fd = buildTaskConfigFormData({
      name: "X",
      description: undefined,
      type: TaskActionEnum.SUBMIT,
      targetUserId: 987,
      startTime: start,
      remark: "r",
    } as any);

    const entries = Array.from(fd.entries());
    expect(entries).toContainEqual(["name", "X"]);
    expect(entries).toContainEqual(["type", String(TaskActionEnum.SUBMIT)]);
    expect(entries).toContainEqual(["targetUserId", "987"]);
    expect(entries).toContainEqual(["startTime", fmtLocal(start)]);
    expect(entries).toContainEqual(["remark", "r"]);

    // should NOT include description or endTime when absent
    const keys = entries.map(([k]) => k);
    expect(keys).not.toContain("description");
    expect(keys).not.toContain("endTime");
  });
});

describe("action meta & formatting helpers", () => {
  it("getActionMeta resolves known codes and builds fallback for unknown", () => {
    expect(getActionMeta(TaskActionEnum.SUBMIT)).toMatchObject({
      label: "Submitted",
    });
    expect(getActionMeta(999)).toMatchObject({
      label: "Action 999",
    });
  });

  it("formatDT returns original string for invalid date", () => {
    expect(formatDT("not-a-date")).toBe("not-a-date");
  });

  it("formatFileBytes handles units and non-finite", () => {
    expect(formatFileBytes(500)).toBe("500 bytes");
    expect(formatFileBytes(1536)).toBe("1.5 KB");
    expect(formatFileBytes(1048576)).toBe("1.0 MB");
    expect(formatFileBytes(Infinity as any)).toBe("Infinity bytes");
  });

  it("actionsThatAllowFiles contains SUBMIT and BLOCK only (sample checks)", () => {
    expect(actionsThatAllowFiles.has(TaskActionEnum.SUBMIT)).toBe(true);
    expect(actionsThatAllowFiles.has(TaskActionEnum.BLOCK)).toBe(true);
    expect(actionsThatAllowFiles.has(TaskActionEnum.APPROVE)).toBe(false);
  });
});
