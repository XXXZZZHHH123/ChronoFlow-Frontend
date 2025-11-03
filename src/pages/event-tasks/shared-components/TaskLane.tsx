import { memo } from "react";
import type { EventTask } from "@/lib/validation/schema";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";

type TaskLaneProps = {
  title: string;
  description?: string;
  tasks: EventTask[];
  className?: string;
  emptyText?: string;
  headerColor?: string;
};

function TaskLaneBase({
  title,
  description,
  tasks,
  className,
  emptyText = "No tasks",
  headerColor = "bg-muted/40",
}: TaskLaneProps) {
  return (
    <section
      className={cn(
        "flex-shrink-0 min-w-[380px] max-w-[460px] w-[36vw] sm:w-[420px]",
        "rounded-lg border bg-background shadow-sm",
        className
      )}
    >
      {/* Lane header */}
      <header
        className={cn(
          "sticky top-0 z-10 rounded-t-lg px-4 py-3 flex flex-col justify-between",
          headerColor
        )}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          <span className="text-xs rounded-full px-2 py-0.5 bg-white/70 text-muted-foreground font-medium">
            {tasks.length}
          </span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-tight">
            {description}
          </p>
        )}
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
