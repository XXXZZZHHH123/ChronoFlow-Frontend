import { render, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { MyTaskTab } from "../my-task-tab";
import type { EventTask } from "@/lib/validation/schema";

type Ctx = {
  myTasks: EventTask[];
  loading: boolean;
  error: string | null;
};
const mockCtx: Ctx = { myTasks: [], loading: false, error: null };

vi.mock("@/contexts/event-tasks/useEventTasksContext", () => ({
  useEventTasksContext: () => mockCtx,
}));

vi.mock("@/pages/event-tasks/shared-components/TasksKaben", () => ({
  TasksKanban: ({
    tasks,
    isMyTasks,
  }: {
    tasks: EventTask[];
    isMyTasks?: boolean;
  }) => (
    <div
      data-testid="kanban"
      data-count={Array.isArray(tasks) ? tasks.length : -1}
      data-ismy={isMyTasks ? "true" : "false"}
    />
  ),
}));

vi.mock("../shared-components/TasksKaben", () => ({
  TasksKanban: ({
    tasks,
    isMyTasks,
  }: {
    tasks: EventTask[];
    isMyTasks?: boolean;
  }) => (
    <div
      data-testid="kanban"
      data-count={Array.isArray(tasks) ? tasks.length : -1}
      data-ismy={isMyTasks ? "true" : "false"}
    />
  ),
}));

afterEach(() => {
  mockCtx.myTasks = [];
  mockCtx.loading = false;
  mockCtx.error = null;
});

// ---- Tests ----
describe("MyTaskTab", () => {
  it("shows loading state", () => {
    mockCtx.loading = true;

    render(<MyTaskTab />);

    expect(screen.getByText(/loading tasks…/i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockCtx.error = "Could not load";

    render(<MyTaskTab />);

    expect(screen.getByText(/could not load/i)).toBeInTheDocument();
  });

  it("renders TasksKanban with myTasks and passes isMyTasks=true", () => {
    mockCtx.myTasks = [
      {
        id: "1",
        name: "A",
        description: null,
        status: 0,
        startTime: null,
        endTime: null,
        createTime: null,
        updateTime: null,
        remark: null,
        assignerUser: {
          id: "user1",
          name: "Test User",
          email: null,
          phone: null,
          groups: null,
        },
        assignedUser: {
          id: "user2",
          name: "Assigned User",
          email: null,
          phone: null,
          groups: null,
        },
      },
    ];

    render(<MyTaskTab />);

    const kanban = screen.getByTestId("kanban");
    expect(kanban).toBeInTheDocument();
    expect(kanban.getAttribute("data-count")).toBe("1");
    expect(kanban.getAttribute("data-ismy")).toBe("true");

    // No fallbacks
    expect(screen.queryByText(/loading tasks…/i)).toBeNull();
    expect(screen.queryByText(/could not load/i)).toBeNull();
  });

  it("renders empty kanban when there are zero tasks", () => {
    mockCtx.myTasks = [];

    render(<MyTaskTab />);

    const kanban = screen.getByTestId("kanban");
    expect(kanban).toBeInTheDocument();
    expect(kanban.getAttribute("data-count")).toBe("0");
    expect(kanban.getAttribute("data-ismy")).toBe("true");
  });
});
