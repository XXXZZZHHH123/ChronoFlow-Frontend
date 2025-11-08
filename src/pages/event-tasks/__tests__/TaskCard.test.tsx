import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TaskCard } from "../shared-components/TaskCard";
import {
  TasksContext,
  type TasksContextValue,
} from "@/contexts/event-tasks/useEventTasksContext";
import type { EventTask } from "@/lib/validation/schema";
import { TaskStatusEnum } from "@/services/eventTask";

const swalMock = vi.hoisted(() => ({
  fire: vi.fn(() => Promise.resolve({})),
}));

vi.mock("sweetalert2", () => ({
  __esModule: true,
  default: swalMock,
}));

const apiMocks = vi.hoisted(() => ({
  deleteEventTask: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/api/eventTasksApi", () => ({
  deleteEventTask: apiMocks.deleteEventTask,
}));

const authState = vi.hoisted(() => ({
  value: {
    user: {
      id: "assigner-1",
      name: "Assigner One",
      email: null,
      phone: null,
    },
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
        media: "(min-width: 0px)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
});

beforeEach(() => {
  vi.clearAllMocks();
  authState.value.user.id = "assigner-1";
});

function createTask(overrides: Partial<EventTask> = {}): EventTask {
  return {
    id: overrides.id ?? "task-1",
    name: overrides.name ?? "Sample Task",
    description: overrides.description ?? "Do something important",
    status: overrides.status ?? TaskStatusEnum.PENDING,
    startTime: overrides.startTime ?? new Date().toISOString(),
    endTime:
      overrides.endTime ??
      new Date(Date.now() + 60 * 60 * 1000).toISOString(),
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

function renderTaskCard(
  task: EventTask,
  overrides: Partial<TasksContextValue> = {}
) {
  const ctxValue: TasksContextValue = {
    allTasks: [],
    myTasks: [],
    myAssignedTasks: [],
    loading: false,
    error: null,
    onRefresh: vi.fn(() => Promise.resolve()),
    eventId: "event-1",
    assignableMembers: [{ id: "assignee-1", label: "Assignee One" }],
    ...overrides,
  };

  const view = render(
    <TasksContext.Provider value={ctxValue}>
      <TaskCard task={task} />
    </TasksContext.Provider>
  );

  return { ...view, ctxValue };
}

describe("TaskCard", () => {
  it("renders assigner/assignee details and action buttons for participants", () => {
    renderTaskCard(
      createTask({
        description: "Detailed task",
      })
    );

    expect(screen.getByText("Sample Task")).toBeInTheDocument();
    expect(screen.getByText("Detailed task")).toBeInTheDocument();
    expect(screen.getByText("Assigner One")).toBeInTheDocument();
    expect(screen.getByText("Assignee One")).toBeInTheDocument();
    expect(screen.getByText(/Waiting for assignee/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Delete task/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reassign/i })
    ).toBeInTheDocument();
  });

  it("confirms deletion and refreshes list when assigner deletes the task", async () => {
    const user = userEvent.setup();
    const { ctxValue } = renderTaskCard(createTask());

    swalMock.fire
      .mockResolvedValueOnce({ isConfirmed: true })
      .mockResolvedValueOnce({});
    apiMocks.deleteEventTask.mockResolvedValueOnce(undefined);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() =>
      expect(apiMocks.deleteEventTask).toHaveBeenCalledWith(
        "event-1",
        "task-1"
      )
    );
    expect(ctxValue.onRefresh).toHaveBeenCalled();
    expect(swalMock.fire).toHaveBeenCalledTimes(2);
  });

  it("shows hint when event context is missing for update actions", () => {
    renderTaskCard(createTask(), { eventId: null });

    expect(
      screen.getByText(/Event context missing — update action is disabled/i)
    ).toBeInTheDocument();
  });
});
