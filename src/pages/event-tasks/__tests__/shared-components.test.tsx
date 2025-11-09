import type { ReactNode } from "react";
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventTasksTabs } from "../shared-components/EventTasksTabs";
import TaskActionNoteModal from "../shared-components/TaskActionNoteModal";
import { TaskBoard } from "../shared-components/TaskBoard";
import { TaskLane } from "../shared-components/TaskLane";
import TaskConfigUpdateFormModal from "../shared-components/TaskConfigForm";
import TaskLogModal from "../shared-components/TaskLogPanel";
import { TasksKanban } from "../shared-components/TasksKaben";

import {
  TasksContext,
  type TasksContextValue,
} from "@/contexts/event-tasks/useEventTasksContext";
import type { EventTask, TaskLog } from "@/lib/validation/schema";
import { TaskStatusEnum, TaskActionEnum } from "@/services/eventTask";

const swalMock = vi.hoisted(() => ({
  fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
}));

vi.mock("sweetalert2", () => ({
  __esModule: true,
  default: swalMock,
}));

const apiMocks = vi.hoisted(() => ({
  deleteEventTask: vi.fn(() => Promise.resolve()),
  updateEventTask: vi.fn(() => Promise.resolve()),
  createEventTask: vi.fn(() => Promise.resolve()),
  getEventTaskLogs: vi.fn(() => Promise.resolve([] as TaskLog[])),
}));

vi.mock("@/api/eventTasksApi", () => ({
  deleteEventTask: apiMocks.deleteEventTask,
  updateEventTask: apiMocks.updateEventTask,
  createEventTask: apiMocks.createEventTask,
  getEventTaskLogs: apiMocks.getEventTaskLogs,
}));

const authState = vi.hoisted(() => ({
  value: {
    user: { id: "auth-user", name: "Auth User", email: null, phone: null },
  },
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (state: (typeof authState)["value"]) => unknown) =>
    selector(authState.value),
}));

beforeAll(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        media: "(min-width: 0px)",
        onchange: null,
      })),
    });
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver;
  }

  if (!URL.createObjectURL) {
    URL.createObjectURL = vi.fn(() => "blob://mock") as typeof URL.createObjectURL;
  }

  if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = vi.fn() as typeof URL.revokeObjectURL;
  }
});

beforeEach(() => {
  vi.clearAllMocks();
});


function createContextValue(
  overrides: Partial<TasksContextValue> = {}
): TasksContextValue {
  return {
    allTasks: [],
    myTasks: [],
    myAssignedTasks: [],
    loading: false,
    error: null,
    onRefresh: vi.fn(() => Promise.resolve()),
    eventId: "event-123",
    assignableMembers: [],
    ...overrides,
  };
}

function renderWithTasksProvider(
  ui: ReactNode,
  overrides?: Partial<TasksContextValue>
) {
  const value = createContextValue(overrides);
  return render(
    <TasksContext.Provider value={value}>{ui}</TasksContext.Provider>
  );
}

function createTask(overrides: Partial<EventTask> = {}): EventTask {
  return {
    id: overrides.id ?? "task-1",
    name: overrides.name ?? "Sample Task",
    description: overrides.description ?? "Do something important",
    status: overrides.status ?? TaskStatusEnum.PENDING,
    startTime: overrides.startTime ?? new Date().toISOString(),
    endTime:
      overrides.endTime ?? new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    createTime: overrides.createTime ?? new Date().toISOString(),
    updateTime: overrides.updateTime ?? new Date().toISOString(),
    remark: overrides.remark ?? null,
    assignerUser:
      overrides.assignerUser ?? {
        id: "assigner-1",
        name: "Assigner One",
        email: "assigner@example.com",
        phone: null,
        groups: [{ id: "g1", name: "Ops" }],
      },
    assignedUser:
      overrides.assignedUser ?? {
        id: "assignee-1",
        name: "Assignee One",
        email: "assignee@example.com",
        phone: null,
        groups: [{ id: "g2", name: "Crew" }],
      },
  };
}


describe("EventTasksTabs", () => {
  it("shows loading placeholders when context is loading", () => {
    renderWithTasksProvider(<EventTasksTabs />, { loading: true });

    const placeholders = screen.getAllByText("Loading…");
    expect(placeholders.length).toBeGreaterThanOrEqual(1);
  });

  it("renders disabled create task hint when no event is selected", () => {
    renderWithTasksProvider(<EventTasksTabs />, { eventId: null });

    expect(screen.getByText("Select an event to create tasks")).toBeVisible();
    expect(screen.getByRole("button", { name: /create task/i })).toBeDisabled();
  });
});

describe("TaskBoard", () => {
  it("wraps children inside scroll container", () => {
    render(
      <TaskBoard>
        <div data-testid="child">child</div>
      </TaskBoard>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});

describe("TaskLane", () => {
  it("renders empty state when no tasks", () => {
    renderWithTasksProvider(
      <TaskLane
        title="Pending"
        description="desc"
        tasks={[]}
        emptyText="Nothing here"
      />
    );

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders TaskCard entries when tasks exist", () => {
    const task = createTask({ id: "task-card" });
    renderWithTasksProvider(<TaskLane title="Pending" tasks={[task]} />);

    expect(screen.getByText("Sample Task")).toBeInTheDocument();
  });
});

describe("TaskActionNoteModal", () => {
  it("submits remark and invokes update API", async () => {
    const user = userEvent.setup();

    renderWithTasksProvider(
      <TaskActionNoteModal
        eventId="event-1"
        taskId="task-1"
        action={TaskActionEnum.BLOCK}
        initialName="Task Name"
        onRefresh={vi.fn()}
        showFiles={false}
      />
    );

    await user.click(screen.getByRole("button", { name: /proceed/i }));

    const textarea = await screen.findByPlaceholderText(
      /type any note\/remark/i
    );
    await user.type(textarea, "  Done ");

    await user.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() =>
      expect(apiMocks.updateEventTask).toHaveBeenCalledWith("event-1", "task-1", {
        name: "Task Name",
        remark: "Done",
        type: TaskActionEnum.BLOCK,
        files: undefined,
      })
    );
  });
});


describe("TaskConfigUpdateFormModal", () => {
  it("submits update payload with TaskActionEnum.UPDATE type", async () => {
    const user = userEvent.setup();
    renderWithTasksProvider(
      <TaskConfigUpdateFormModal
        eventId="event-22"
        taskId="task-22"
        onRefresh={vi.fn()}
        initial={{
          name: "Old",
          description: "desc",
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: /update task/i }));

    const nameInput = await screen.findByLabelText("Task name");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Task");

    await user.click(screen.getByRole("button", { name: /apply changes/i }));

    await waitFor(() =>
      expect(apiMocks.updateEventTask).toHaveBeenCalledWith("event-22", "task-22", expect.objectContaining({
        name: "Updated Task",
        type: TaskActionEnum.UPDATE,
      }))
    );
  });
});

describe("TaskLogModal", () => {
  it("loads logs on open and refresh", async () => {
    const user = userEvent.setup();
    const logs: TaskLog[] = [
      {
        id: "log-1",
        action: TaskActionEnum.SUBMIT,
        remark: "Submitted work",
        createTime: "2025-05-01T10:00:00",
        fileResults: [],
        sourceUser: { id: "u1", name: "Alpha" },
        targetUser: { id: "u2", name: "Bravo" },
      },
    ];
    apiMocks.getEventTaskLogs.mockResolvedValueOnce(logs);

    render(<TaskLogModal eventId="event-4" taskId="task-4" />);

    await user.click(screen.getByRole("button", { name: /view task log/i }));

    await waitFor(() =>
      expect(apiMocks.getEventTaskLogs).toHaveBeenCalledWith(
        "event-4",
        "task-4"
      )
    );

    expect(await screen.findByText("Submitted")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /refresh/i }));
    expect(apiMocks.getEventTaskLogs).toHaveBeenCalledTimes(2);
  });
});

describe("TasksKanban", () => {
  it("renders all default lanes and hides rejected for my tasks view", () => {
    const tasks = [
      createTask({ id: "p1", status: TaskStatusEnum.PENDING }),
      createTask({ id: "r1", status: TaskStatusEnum.REJECTED }),
    ];

    const firstRender = renderWithTasksProvider(<TasksKanban tasks={tasks} />);

    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();

    firstRender.unmount();

    renderWithTasksProvider(<TasksKanban tasks={tasks} isMyTasks />);

    expect(screen.queryByText("Rejected")).not.toBeInTheDocument();
  });
});
