import { memo } from "react";
import type { EventTask } from "@/lib/validation/schema";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";

type TaskLaneProps = {
  title: string;
  tasks: EventTask[];
  className?: string;
  emptyText?: string;
};

function TaskLaneBase({
  title,
  tasks,
  className,
  emptyText = "No tasks",
}: TaskLaneProps) {
  return (
    <section
      className={cn(
        "flex-shrink-0 min-w-[320px] max-w-[380px] w-[32vw] sm:w-[360px]",
        "rounded-lg border bg-background",
        className
      )}
    >
      {/* Lane header */}
      <header className="sticky top-0 z-10 rounded-t-lg bg-muted/40 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <span className="text-xs rounded-full px-2 py-0.5 bg-muted text-muted-foreground">
          {tasks.length}
        </span>
      </header>

      {/* Lane body */}
      <div className="p-3 space-y-3">
        {tasks.length === 0 ? (
          <div className="text-sm text-muted-foreground px-1 py-6 text-center">
            {emptyText}
          </div>
        ) : (
          tasks.map((t) => <TaskCard key={t.id} task={t} />)
        )}
      </div>
    </section>
  );
}

export const TaskLane = memo(TaskLaneBase);
