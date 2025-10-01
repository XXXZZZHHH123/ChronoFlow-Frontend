import type { EventTask } from "@/lib/validation/schema";
import { TaskBoard } from "./TaskBoard";
import { TaskLane } from "./TaskLane";
import { categorizeTasks } from "@/services/eventTask";

type ExampleProps = {
  tasks: EventTask[];
  onEdit: (t: EventTask) => void;
  onDelete: (t: EventTask) => void;
};

export function TasksKanban({ tasks, onEdit, onDelete }: ExampleProps) {
  const {
    pendingTasks,
    inProgressTasks,
    delayedTasks,
    blockedTasks,
    completedTasks,
  } = categorizeTasks(tasks);

  return (
    <TaskBoard>
      <TaskLane
        title="Pending"
        tasks={pendingTasks}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <TaskLane
        title="In Progress"
        tasks={inProgressTasks}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <TaskLane
        title="Delayed"
        tasks={delayedTasks}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <TaskLane
        title="Blocked"
        tasks={blockedTasks}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <TaskLane
        title="Completed"
        tasks={completedTasks}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </TaskBoard>
  );
}
