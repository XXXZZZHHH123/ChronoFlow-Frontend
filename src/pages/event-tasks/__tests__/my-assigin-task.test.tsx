import { render, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { MyAssignTaskTab } from "../my-assign-task";
import type { EventTask } from "@/lib/validation/schema";

type Ctx = {
  myAssignedTasks: EventTask[];
  loading: boolean;
  error: string | null;
};

const mockCtx: Ctx = { myAssignedTasks: [], loading: false, error: null };

vi.mock("@/contexts/event-tasks/useEventTasksContext", () => ({
  useEventTasksContext: () => mockCtx,
}));

vi.mock("@/pages/event-tasks/shared-components/TasksKaben", () => ({
  TasksKanban: ({ tasks }: { tasks: EventTask[] }) => (
    <div
      data-testid="kanban"
      data-count={Array.isArray(tasks) ? tasks.length : -1}
    />
  ),
}));

vi.mock("../shared-components/TasksKaben", () => ({
  TasksKanban: ({ tasks }: { tasks: EventTask[] }) => (
    <div
      data-testid="kanban"
      data-count={Array.isArray(tasks) ? tasks.length : -1}
    />
  ),
}));

afterEach(() => {
  mockCtx.myAssignedTasks = [];
  mockCtx.loading = false;
  mockCtx.error = null;
});

// ---- Tests ----
describe("MyAssignTaskTab", () => {
  it("shows loading state", () => {
    mockCtx.loading = true;

    render(<MyAssignTaskTab />);

    expect(screen.getByText(/loading tasks…/i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockCtx.error = "Something went wrong";

    render(<MyAssignTaskTab />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("renders TasksKanban with myAssignedTasks when not loading and no error", () => {
    mockCtx.myAssignedTasks = [
      {
        id: "t1",
        name: "Task 1",
        description: null,
        status: 0,
        startTime: null,
        endTime: null,
        createTime: null,
        updateTime: null,
        remark: null,
        assignerUser: {
          id: "u1",
          name: "User 1",
          email: null,
          phone: null,
          groups: null,
        },
        assignedUser: {
          id: "u2",
          name: "User 2",
          email: null,
          phone: null,
          groups: null,
        },
      },
      {
        id: "t2",
        name: "Task 2",
        description: null,
        status: 0,
        startTime: null,
        endTime: null,
        createTime: null,
        updateTime: null,
        remark: null,
        assignerUser: {
          id: "u1",
          name: "User 1",
          email: null,
          phone: null,
          groups: null,
        },
        assignedUser: {
          id: "u3",
          name: "User 3",
          email: null,
          phone: null,
          groups: null,
        },
      },
    ];

    render(<MyAssignTaskTab />);

    const kanban = screen.getByTestId("kanban");
    expect(kanban).toBeInTheDocument();
    expect(kanban.getAttribute("data-count")).toBe("2");

    // Ensure the fallback texts are not present
    expect(screen.queryByText(/loading tasks…/i)).toBeNull();
    expect(screen.queryByText(/something went wrong/i)).toBeNull();
  });

  it("renders empty kanban when there are zero tasks", () => {
    mockCtx.myAssignedTasks = [];

    render(<MyAssignTaskTab />);

    const kanban = screen.getByTestId("kanban");
    expect(kanban).toBeInTheDocument();
    expect(kanban.getAttribute("data-count")).toBe("0");
  });
});
