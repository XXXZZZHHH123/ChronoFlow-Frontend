import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { EventTask } from "@/lib/validation/schema";
import {
  getTaskStatusStyle,
  getTaskStatusText,
  type TaskStatusCode,
} from "@/services/eventTask";
import * as React from "react";
import {
  deleteEventTaskSample,
  updateEventTaskSample,
} from "@/api/eventTasksApi";

interface TaskCardProps {
  task: EventTask;
}

export function TaskCard({ task }: TaskCardProps) {
  const assigneeInitials =
    task.assignedUser?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  const status = task.status as TaskStatusCode;
  const statusStyle = getTaskStatusStyle(status);

  const dueText = React.useMemo(() => {
    if (!task.endTime) return "—";
    const date = new Date(task.endTime);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString();
  }, [task.endTime]);

  return (
    <Collapsible asChild>
      <Card className="w-full p-3">
        {/* Header (trigger) */}
        <CollapsibleTrigger
          className="flex w-full items-center justify-between text-left outline-none"
          aria-label={`Toggle details for task ${task.name}`}
        >
          <span className="font-medium truncate">{task.name}</span>
          {task.assignedUser && (
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="text-xs">
                {assigneeInitials}
              </AvatarFallback>
            </Avatar>
          )}
        </CollapsibleTrigger>

        {/* Expanded content */}
        <CollapsibleContent className="mt-3 space-y-3 text-sm">
          {task.description && (
            <p className="text-muted-foreground">{task.description}</p>
          )}

          <div className="flex items-center justify-between">
            {/* Assignee */}
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">
                  {assigneeInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {task.assignedUser?.name ?? "Unassigned"}
                </div>
                {task.assignedUser?.group && (
                  <div className="text-xs text-muted-foreground">
                    {task.assignedUser.group.name}
                  </div>
                )}
              </div>
            </div>

            {/* Status badge */}
            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs font-medium ring-1",
                statusStyle.badge
              )}
            >
              {getTaskStatusText(status)}
            </span>
          </div>

          {/* Due date */}
          <div className="text-xs text-muted-foreground">Due: {dueText}</div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateEventTaskSample()}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteEventTaskSample()}
            >
              Delete
            </Button>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
