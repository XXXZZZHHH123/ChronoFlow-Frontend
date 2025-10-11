import type {
  EventGroupWithAssignableMembers,
  EventTask,
  EventTaskConfig,
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

//Update action only for zod schema
export const allowedActions = [
  TaskActionEnum.ASSIGN,
  TaskActionEnum.UPDATE,
  TaskActionEnum.SUBMIT,
  TaskActionEnum.BLOCK,
  TaskActionEnum.ACCEPT,
  TaskActionEnum.REJECT,
  TaskActionEnum.APPROVE,
  TaskActionEnum.DELETE,
] as const;

export type AllowAction = (typeof allowedActions)[number];

// Assignee Task Progress Action;
export type UpdateActionOption = {
  label: string;
  value: AllowAction;
  description: string;
};
export function getStatusUX(
  status: TaskStatusEnumType | null | undefined,
  isAssigner: boolean
): string | null {
  if (status == null) return null;

  if (isAssigner) {
    switch (status) {
      case TaskStatusEnum.PENDING:
        return "Waiting for assignee to accept or reject the task.";
      case TaskStatusEnum.IN_PROGRESS:
        return "Assignee is working on this task.";
      case TaskStatusEnum.DELAYED:
        return "Task is overdue and pending follow-up.";
      case TaskStatusEnum.BLOCKED:
        return "Task is blocked.";
      case TaskStatusEnum.REJECTED:
        return "Task was rejected by the assignee and awaits reassignment or update.";
      case TaskStatusEnum.PENDING_APPROVAL:
        return "The task has been submitted and is waiting for your review or approval.";
      case TaskStatusEnum.COMPLETED:
        return "Task has been completed and approved successfully.";
      default:
        return null;
    }
  }

  // Assignee side
  switch (status) {
    case TaskStatusEnum.PENDING:
      return "A new task has been assigned to you. Please accept or reject it.";
    case TaskStatusEnum.IN_PROGRESS:
      return "You are working on this task.";
    case TaskStatusEnum.DELAYED:
      return "This task is overdue.";
    case TaskStatusEnum.BLOCKED:
      return "This task is blocked. Your assigner may update the task.";
    case TaskStatusEnum.REJECTED:
      return "You have rejected this task. Await further updates from your assigner.";
    case TaskStatusEnum.PENDING_APPROVAL:
      return "You’ve submitted the task. Waiting for your assigner’s approval.";
    case TaskStatusEnum.COMPLETED:
      return "You have completed this task. No further action required.";
    default:
      return null;
  }
}

export function getActionOptionsForStatus(
  status: TaskStatusEnumType | null | undefined,
  isAssigner: boolean
): UpdateActionOption[] {
  if (status == null) return [];
  if (isAssigner) {
    switch (status) {
      case TaskStatusEnum.PENDING:
        return [
          {
            label: "Update",
            value: TaskActionEnum.UPDATE,
            description:
              "Modify task details, deadlines, or attachments before acceptance.",
          },
          {
            label: "Delete",
            value: TaskActionEnum.DELETE,
            description:
              "Remove this task if it was created by mistake or is no longer needed.",
          },
          {
            label: "Reassign",
            value: TaskActionEnum.ASSIGN,
            description:
              "Reassign the task to another member or back to the same assignee after updates.",
          },
        ];

      case TaskStatusEnum.IN_PROGRESS:
        return [
          {
            label: "Update",
            value: TaskActionEnum.UPDATE,
            description: "Modify task details, deadlines, or attachments.",
          },
          {
            label: "Block",
            value: TaskActionEnum.BLOCK,
            description:
              "Mark the task as blocked due to external dependencies or issues.",
          },
          {
            label: "Delete",
            value: TaskActionEnum.DELETE,
            description:
              "Remove this task if it’s no longer required. This action is irreversible.",
          },
          {
            label: "Ressign",
            value: TaskActionEnum.ASSIGN,
            description:
              "Reassign the task to another member or back to the same assignee after updates.",
          },
        ];

      case TaskStatusEnum.DELAYED:
        return [
          {
            label: "Update",
            value: TaskActionEnum.UPDATE,
            description: "Revise deadlines or add remarks about the delay.",
          },
          {
            label: "Block",
            value: TaskActionEnum.BLOCK,
            description:
              "Mark the task as blocked due to external issues or missing dependencies.",
          },
          {
            label: "Delete",
            value: TaskActionEnum.DELETE,
            description:
              "Remove this task if it’s no longer relevant after the delay.",
          },
          {
            label: "Reassign",
            value: TaskActionEnum.ASSIGN,
            description:
              "Reassign the task to another member or back to the same assignee after updates.",
          },
        ];

      case TaskStatusEnum.BLOCKED:
        return [
          {
            label: "Update",
            value: TaskActionEnum.UPDATE,
            description:
              "Update details or resolve the blocker (e.g., adjust scope, deadlines, or dependencies).",
          },
          {
            label: "Delete",
            value: TaskActionEnum.DELETE,
            description: "Remove this task if it’s no longer required.",
          },
          {
            label: "Reassign",
            value: TaskActionEnum.ASSIGN,
            description:
              "Reassign the task to another member or back to the same assignee after updates.",
          },
        ];

      case TaskStatusEnum.REJECTED:
        return [
          {
            label: "Update",
            value: TaskActionEnum.UPDATE,
            description:
              "Review and modify task details or clarify requirements before reassignment.",
          },
          {
            label: "Reassign",
            value: TaskActionEnum.ASSIGN,
            description:
              "Reassign the task to another member or back to the same assignee after updates.",
          },
          {
            label: "Delete",
            value: TaskActionEnum.DELETE,
            description:
              "Remove this task if it’s no longer relevant after rejection.",
          },
        ];

      case TaskStatusEnum.PENDING_APPROVAL:
        return [
          {
            label: "Approve",
            value: TaskActionEnum.APPROVE,
            description: "Confirm that the task is completed.",
          },
        ];

      case TaskStatusEnum.COMPLETED:
        return [
          {
            label: "Delete",
            value: TaskActionEnum.DELETE,
            description:
              "Remove this completed task if it’s no longer needed for record-keeping.",
          },
        ];

      default:
        return [];
    }
  } else {
    // Assignee
    switch (status) {
      case TaskStatusEnum.PENDING:
        return [
          {
            label: "Accept",
            value: TaskActionEnum.ACCEPT,
            description:
              "Acknowledge and accept this task assignment to begin work.",
          },
          {
            label: "Reject",
            value: TaskActionEnum.REJECT,
            description:
              "Decline this task assignment if it’s invalid or not applicable.",
          },
        ];

      case TaskStatusEnum.IN_PROGRESS:
        return [
          {
            label: "Submit",
            value: TaskActionEnum.SUBMIT,
            description:
              "Mark the task as completed and submit it for approval.",
          },
          {
            label: "Block",
            value: TaskActionEnum.BLOCK,
            description:
              "Indicate that progress is halted due to an issue or dependency.",
          },
        ];

      case TaskStatusEnum.DELAYED:
        return [
          {
            label: "Submit",
            value: TaskActionEnum.SUBMIT,
            description:
              "Submit the task for approval if it’s now completed despite the delay.",
          },
          {
            label: "Block",
            value: TaskActionEnum.BLOCK,
            description:
              "Report that progress is halted due to an ongoing issue or dependency.",
          },
        ];

      case TaskStatusEnum.BLOCKED:
        return [];

      case TaskStatusEnum.REJECTED:
        return [];

      case TaskStatusEnum.PENDING_APPROVAL:
        return [];

      case TaskStatusEnum.COMPLETED:
        return [];

      default:
        return [];
    }
  }
}

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

export function buildTaskConfigFormData(input: EventTaskConfig): FormData {
  const form = new FormData();

  // Only append fields if provided (backend treats all as optional)
  if (input.name != null) form.append("name", input.name);
  if (input.description != null) form.append("description", input.description);

  // type: integer enum (ASSIGN/UPDATE/SUBMIT/BLOCK/ACCEPT/REJECT/APPROVE)
  if (typeof input.type === "number") {
    form.append("type", String(input.type));
  }

  // targetUserId: backend expects Long; send as string if present
  if (input.targetUserId) {
    form.append("targetUserId", String(input.targetUserId));
  }

  // LocalDateTime (no timezone/offset)
  const start = fmtLocal(input.startTime);
  const end = fmtLocal(input.endTime);
  if (start) form.append("startTime", start);
  if (end) form.append("endTime", end);

  // files
  if (input.files?.length) {
    for (const f of input.files) {
      form.append("files", f, f.name);
    }
  }

  return form;
}

// Task log
export const ACTION_META: Record<
  keyof typeof TaskActionEnum,
  { label: string; theme: string }
> = {
  CREATE: {
    label: "Created",
    theme: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  },
  ASSIGN: {
    label: "Assigned",
    theme: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
  },
  DELETE: {
    label: "Deleted",
    theme: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  },
  UPDATE: {
    label: "Updated",
    theme: "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200",
  },
  SUBMIT: {
    label: "Submitted",
    theme: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  },
  BLOCK: {
    label: "Blocked",
    theme: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  },
  ACCEPT: {
    label: "Accepted",
    theme: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  },
  REJECT: {
    label: "Rejected",
    theme: "bg-red-100 text-red-700 ring-1 ring-red-200",
  },
  APPROVE: {
    label: "Approved",
    theme: "bg-green-100 text-green-700 ring-1 ring-green-200",
  },
};

export function getActionMeta(action: number) {
  const key = Object.entries(TaskActionEnum).find(
    ([, code]) => code === action
  )?.[0] as keyof typeof TaskActionEnum | undefined;
  if (!key)
    return {
      label: `Action ${action}`,
      theme: "bg-muted text-foreground/70 ring-1 ring-border",
    };
  return ACTION_META[key];
}

export function formatDT(s: string) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatFileBytes(n: number) {
  if (!Number.isFinite(n)) return `${n} bytes`;
  const units = ["bytes", "KB", "MB", "GB"];
  let idx = 0;
  while (n >= 1024 && idx < units.length - 1) {
    n /= 1024;
    idx++;
  }
  return `${n.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}
