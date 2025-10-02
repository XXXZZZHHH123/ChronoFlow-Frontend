import type { EventTask } from "@/lib/validation/schema";
import { TaskBoard } from "./TaskBoard";
import { TaskLane } from "./TaskLane";
import { categorizeTasks } from "@/services/eventTask";

type TasksKanbanProps = {
  tasks: EventTask[];
};

export function TasksKanban({ tasks }: TasksKanbanProps) {
  const {
    pendingTasks,
    inProgressTasks,
    delayedTasks,
    blockedTasks,
    completedTasks,
  } = categorizeTasks(tasks);

  return (
    <TaskBoard>
      <TaskLane title="Pending" tasks={pendingTasks} />
      <TaskLane title="In Progress" tasks={inProgressTasks} />
      <TaskLane title="Delayed" tasks={delayedTasks} />
      <TaskLane title="Blocked" tasks={blockedTasks} />
      <TaskLane title="Completed" tasks={completedTasks} />
    </TaskBoard>
  );
}
