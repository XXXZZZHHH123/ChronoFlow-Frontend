import type { EventTask } from "@/lib/validation/schema";
import { TaskBoard } from "./TaskBoard";
import { TaskLane } from "./TaskLane";
import {
  categorizeTasksForBoard,
  getTaskStatusStyle,
  TaskStatusEnum,
} from "@/services/eventTask";

type TasksKanbanProps = {
  tasks: EventTask[];
  isMyTasks?: boolean;
};

export function TasksKanban({ tasks, isMyTasks = false }: TasksKanbanProps) {
  const {
    pending,
    progress,
    completed,
    delayed,
    blocked,
    pendingApproval,
    rejected,
  } = categorizeTasksForBoard(tasks);

  return (
    <TaskBoard>
      <TaskLane
        title="Pending"
        description="Task has been assigned but the assignee has not accepted yet."
        tasks={pending}
        headerColor={getTaskStatusStyle(TaskStatusEnum.PENDING).theme}
      />

      <TaskLane
        title="In Progress"
        description="Task is currently being worked on by the assignee."
        tasks={progress}
        headerColor={getTaskStatusStyle(TaskStatusEnum.IN_PROGRESS).theme}
      />

      <TaskLane
        title="Completed"
        description="Task is finished and verified by the assigner."
        tasks={completed}
        headerColor={getTaskStatusStyle(TaskStatusEnum.COMPLETED).theme}
      />

      <TaskLane
        title="Delayed"
        description="Task is overdue and has missed the expected end time."
        tasks={delayed}
        headerColor={getTaskStatusStyle(TaskStatusEnum.DELAYED).theme}
      />

      <TaskLane
        title="Blocked"
        description="Task cannot proceed due to a dependency or pending issue."
        tasks={blocked}
        headerColor={getTaskStatusStyle(TaskStatusEnum.BLOCKED).theme}
      />

      <TaskLane
        title="Pending Approval"
        description="Assignee has submitted the task for review. Waiting for approval."
        tasks={pendingApproval}
        headerColor={getTaskStatusStyle(TaskStatusEnum.PENDING_APPROVAL).theme}
      />

      {!isMyTasks && (
        <TaskLane
          title="Rejected"
          description="Task was rejected by the assignee."
          tasks={rejected}
          headerColor={getTaskStatusStyle(TaskStatusEnum.REJECTED).theme}
        />
      )}
    </TaskBoard>
  );
}
