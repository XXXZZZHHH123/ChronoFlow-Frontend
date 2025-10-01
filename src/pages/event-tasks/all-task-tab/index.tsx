import { Card, CardContent } from "@/components/ui/card";
import type { EventTask } from "@/lib/validation/schema";
import { TasksKanban } from "../shared-components/TasksKaben";

interface AllTasksTabProps {
  tasks: EventTask[];
  loading?: boolean;
  error?: string | null;
  onEdit: (task: EventTask) => void;
  onDelete: (task: EventTask) => void;
}

export function AllTasksTab({
  tasks,
  loading,
  error,
  onEdit,
  onDelete,
}: AllTasksTabProps) {
  return (
    <Card className="rounded-lg border-none">
      <CardContent className="p-4 sm:p-6 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading tasks…</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks available.</p>
        ) : (
          <TasksKanban tasks={tasks} onEdit={onEdit} onDelete={onDelete} />
        )}
      </CardContent>
    </Card>
  );
}
