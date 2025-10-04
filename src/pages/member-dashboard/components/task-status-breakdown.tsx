import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MemberDashboardTask } from "@/lib/validation/schema";
import {
  getTaskStatusStyle,
  getTaskStatusText,
  type TaskStatusCode,
} from "@/services/eventTask";

const STATUS_SEQUENCE: TaskStatusCode[] = [
  1, // In Progress
  0, // Pending
  3, // Delayed
  4, // Blocked
  5, // Pending Approval
  6, // Rejected
  2, // Completed
];

type TaskStatusBreakdownProps = {
  tasks: MemberDashboardTask[];
};

export function TaskStatusBreakdown({ tasks }: TaskStatusBreakdownProps) {
  const totalTasks = tasks.length;

  const counts = tasks.reduce<Record<number, number>>((acc, task) => {
    const code = task.status as number;
    acc[code] = (acc[code] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Status Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">
          Understand how your assignments are progressing across every event.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {STATUS_SEQUENCE.map((statusCode) => {
          const count = counts[statusCode] ?? 0;
          const style = getTaskStatusStyle(statusCode);
          const percentage = totalTasks ? Math.round((count / totalTasks) * 100) : 0;

          if (totalTasks === 0 && count === 0 && statusCode !== 0 && statusCode !== 1) {
            return null;
          }

          return (
            <div key={statusCode} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  <span className="font-medium">{getTaskStatusText(statusCode)}</span>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {count}
                  {totalTasks > 0 ? (
                    <span className="ml-1 text-xs text-muted-foreground">({percentage}%)</span>
                  ) : null}
                </span>
              </div>
              {totalTasks > 0 ? (
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${style.dot}`}
                    style={{ width: `${Math.max(percentage, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}

        {totalTasks === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks assigned yet. Once organisers assign work to you, it will appear here.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
