import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { EventTask } from "@/lib/validation/schema";
import {
  getInitialName,
  getTaskStatusStyle,
  type TaskStatusCode,
} from "@/services/eventTask";
import * as React from "react";
import {
  deleteEventTaskSample,
  updateEventTaskSample,
} from "@/api/eventTasksApi";
import { ArrowRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  task: EventTask;
}

export function TaskCard({ task }: TaskCardProps) {
  const assigneeInitials = getInitialName(task.assignedUser?.name);
  const assignerInitials = getInitialName(task.assignerUser?.name) || "??";

  const dueText = React.useMemo(() => {
    if (!task.endTime) return "No Due Date";
    const date = new Date(task.endTime);
    if (Number.isNaN(date.getTime())) return "No Due Date";
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, [task.endTime]);

  const isScheduled =
    !!task.endTime && !Number.isNaN(new Date(task.endTime).getTime());

  const [isOpen, setIsOpen] = React.useState(true);

  const statusStyle = React.useMemo(() => {
    return getTaskStatusStyle(task.status as TaskStatusCode);
  }, [task.status]);

  return (
    <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
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
                {isOpen ? <ChevronUp /> : assigneeInitials}
              </AvatarFallback>
            </Avatar>
          )}
        </CollapsibleTrigger>

        {/* Expanded content */}
        <CollapsibleContent className="mt-2 space-y-6 text-sm">
          {task.description && (
            <p className="text-muted-foreground">{task.description}</p>
          )}

          {/* Assigner → Assignee (with arrow divider) */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Assigner */}
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">
                  {assignerInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {task.assignerUser?.name ?? "Unassigned"}
                </div>
                {task.assignerUser?.groups && (
                  <div className="text-xs text-muted-foreground">
                    {task.assignerUser.groups.map((g) => g.name).join(", ")}
                  </div>
                )}
              </div>
            </div>

            {/* Arrow divider with status-based background */}
            <div className="justify-self-center">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1",
                  statusStyle.theme // ← uses the same color theme as the task status
                )}
              >
                assigns&nbsp;to
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-2 justify-self-end">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">
                  {assigneeInitials}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <div className="font-medium">
                  {task.assignedUser?.name ?? "Unassigned"}
                </div>
                {task.assignedUser?.groups && (
                  <div className="text-xs text-muted-foreground">
                    {task.assignedUser.groups.map((g) => g.name).join(", ")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Due date + optional remark icon */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-2">
              <span>Due:</span>

              {isScheduled ? (
                <Badge
                  variant="secondary"
                  className="bg-rose-100 text-rose-700 ring-1 ring-rose-200 font-medium"
                >
                  {dueText}
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 font-medium"
                >
                  {dueText}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-2">
            {/* Left side: Edit + Delete */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateEventTaskSample()}
              >
                Update
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteEventTaskSample()}
              >
                Delete
              </Button>
            </div>

            {/* Right side: View Task Log */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => console.log("View Task Log clicked")}
            >
              View Task Log
            </Button>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
