import type {
  EventGroupWithAssignableMembers,
  EventTask,
  EventTaskCreateConfig,
} from "@/lib/validation/schema";

/* ──────────────────────────────────────────────────────────────────────────────
 *  Task Statuses & Styles
 * ────────────────────────────────────────────────────────────────────────────── */

export type TaskStatusCode =
  | 0 // Pending
  | 1 // Progress
  | 2 // Completed
  | 3 // Delayed
  | 4 // Blocked
  | 5 // Pending Approval
  | 6 // Rejected
  | null
  | undefined;

export const TaskStatusEnum = {
  PENDING: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  DELAYED: 3,
  BLOCKED: 4,
  PENDING_APPROVAL: 5,
  REJECTED: 6,
} as const;

export type TaskStatusEnumType =
  (typeof TaskStatusEnum)[keyof typeof TaskStatusEnum];

const STATUS_META: Record<
  Exclude<TaskStatusCode, null | undefined>,
  { text: string; theme: string; dot: string }
> = {
  0: {
    text: "Pending",
    theme: "bg-gray-100 text-gray-700 ring-gray-500/20",
    dot: "bg-gray-500",
  },
  1: {
    text: "In Progress",
    theme: "bg-cyan-100 text-cyan-700 ring-cyan-500/20",
    dot: "bg-cyan-500",
  },
  2: {
    text: "Completed",
    theme: "bg-green-100 text-green-700 ring-green-500/20",
    dot: "bg-green-500",
  },
  3: {
    text: "Delayed",
    theme: "bg-orange-100 text-orange-700 ring-orange-500/20",
    dot: "bg-orange-500",
  },
  4: {
    text: "Blocked",
    theme: "bg-amber-100 text-amber-700 ring-amber-500/20",
    dot: "bg-amber-500",
  },
  5: {
    text: "Pending Approval",
    theme: "bg-blue-100 text-blue-700 ring-blue-500/20",
    dot: "bg-blue-500",
  },
  6: {
    text: "Rejected",
    theme: "bg-red-100 text-red-700 ring-red-500/20",
    dot: "bg-red-500",
  },
};

const UNKNOWN_STYLE = {
  theme: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
  dot: "bg-zinc-500",
};

/* ──────────────────────────────────────────────────────────────────────────────
 *  Helpers: Status Text & Styles
 * ────────────────────────────────────────────────────────────────────────────── */

export function getTaskStatusText(status: TaskStatusCode): string {
  return status != null ? STATUS_META[status]?.text ?? "Unknown" : "Unknown";
}

export function getTaskStatusStyle(status: TaskStatusCode): {
  theme: string;
  dot: string;
} {
  return status != null ? STATUS_META[status] ?? UNKNOWN_STYLE : UNKNOWN_STYLE;
}

/* ──────────────────────────────────────────────────────────────────────────────
 *  Board Categorization
 * ────────────────────────────────────────────────────────────────────────────── */

export type BoardBuckets = {
  pending: EventTask[];
  progress: EventTask[];
  completed: EventTask[];
  delayed: EventTask[];
  blocked: EventTask[];
  pendingApproval: EventTask[];
  rejected: EventTask[];
};

export function categorizeTasksForBoard(tasks: EventTask[]): BoardBuckets {
  const buckets: BoardBuckets = {
    pending: [],
    progress: [],
    completed: [],
    delayed: [],
    blocked: [],
    pendingApproval: [],
    rejected: [],
  };

  for (const t of tasks) {
    switch (t.status as TaskStatusCode) {
      case 0:
        buckets.pending.push(t);
        break;
      case 1:
        buckets.progress.push(t);
        break;
      case 2:
        buckets.completed.push(t);
        break;
      case 3:
        buckets.delayed.push(t);
        break;
      case 4:
        buckets.blocked.push(t);
        break;
      case 5:
        buckets.pendingApproval.push(t);
        break;
      case 6:
        buckets.rejected.push(t);
        break;
      default:
        break;
    }
  }

  return buckets;
}

/* ──────────────────────────────────────────────────────────────────────────────
 *  Filters: My Tasks / My Assigned Tasks
 * ────────────────────────────────────────────────────────────────────────────── */

export function filterMyTasks(
  tasks: EventTask[],
  currentUserId: string
): EventTask[] {
  return tasks.filter(
    (task) => task.assignedUser && task.assignedUser.id === currentUserId
  );
}

export function filterMyAssignedTasks(
  tasks: EventTask[],
  currentUserId: string
): EventTask[] {
  return tasks.filter(
    (task) => task.assignerUser && task.assignerUser.id === currentUserId
  );
}

export function getInitialName(name?: string): string {
  if (!name) return "?";
  return (
    name
      .trim()
      .split(/\s+/)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "?"
  );
}

//Action Type
export const TaskActionEnum = {
  CREATE: 1,
  ASSIGN: 2,
  DELETE: 3,
  UPDATE: 4,
  SUBMIT: 5,
  BLOCK: 6,
  ACCEPT: 7,
  REJECT: 8,
  APPROVE: 9,
} as const;

export type TaskActionEnumType =
  (typeof TaskActionEnum)[keyof typeof TaskActionEnum];

//Update action only
export const allowedUpdateActions = [
  TaskActionEnum.ASSIGN,
  TaskActionEnum.UPDATE,
  TaskActionEnum.SUBMIT,
  TaskActionEnum.BLOCK,
  TaskActionEnum.ACCEPT,
  TaskActionEnum.REJECT,
  TaskActionEnum.APPROVE,
] as const;

export type UpdateAction = (typeof allowedUpdateActions)[number];

// Assignee Task Progress Action;
export const AssigneeTaskProgressActions = [
  {
    label: "Update",
    value: TaskActionEnum.UPDATE,
    description: "Make changes to the task’s details or progress information.",
  },
  {
    label: "Submit",
    value: TaskActionEnum.SUBMIT,
    description: "Mark the task as completed and submit it for approval.",
  },
  {
    label: "Block",
    value: TaskActionEnum.BLOCK,
    description:
      "Indicate that progress is halted due to an issue or dependency.",
  },
] as const;

export const AssigneeTaskDecisionActions = [
  {
    label: "Accept",
    value: TaskActionEnum.ACCEPT,
    description: "Acknowledge and approve the submitted work as complete.",
  },
  {
    label: "Reject",
    value: TaskActionEnum.REJECT,
    description:
      "Decline the submitted work and request further updates or corrections.",
  },
] as const;

export const AssignerTaskActions = [
  {
    label: "Assign",
    value: TaskActionEnum.ASSIGN,
    description: "Reassign the task to another member or update the assignee.",
  },
  {
    label: "Update",
    value: TaskActionEnum.UPDATE,
    description: "Modify task details or adjust deadlines and descriptions.",
  },
  {
    label: "Block",
    value: TaskActionEnum.BLOCK,
    description:
      "Mark the task as blocked due to external dependencies or issues.",
  },
] as const;

export const AssignerApprovalTaskActions = [
  {
    label: "Approve",
    value: TaskActionEnum.APPROVE,
    description:
      "Confirm and approve the task completion after submission by the assignee.",
  },
] as const;

/* ──────────────────────────────────────────────────────────────────────────────
 *  Assignee Member Options for Select Input
 * ────────────────────────────────────────────────────────────────────────────── */
export type AssigneeOption = { id: string; label: string };

export function getAssignableMembersOptions(
  groups: EventGroupWithAssignableMembers[]
): AssigneeOption[] {
  const seen = new Set<string>();

  return groups.flatMap((group) =>
    group.members
      .filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      })
      .map((m) => ({
        id: m.id,
        label: `${m.username} (${group.name})`,
      }))
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
 *  Create task payload helper
 * ────────────────────────────────────────────────────────────────────────────── */
function fmtLocal(d?: Date) {
  if (!d) return undefined;
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;
}

/** Build FormData from EventTaskCreateConfig */
export function buildTaskCreateFormData(
  input: EventTaskCreateConfig
): FormData {
  const form = new FormData();

  form.append("name", input.name);
  form.append("targetUserId", String(input.targetUserId));

  if (input.description != null) form.append("description", input.description);
  if (input.remark != null) form.append("remark", input.remark);

  const start = fmtLocal(input.startTime);
  const end = fmtLocal(input.endTime);
  if (start) form.append("startTime", start);
  if (end) form.append("endTime", end);

  if (input.files?.length) {
    for (const f of input.files) form.append("files", f, f.name);
  }
  return form;
}
