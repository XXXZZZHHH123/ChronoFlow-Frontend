import { Card, CardContent } from "@/components/ui/card";
import { TasksKanban } from "../shared-components/TasksKaben";
import { useEventTasksContext } from "@/contexts/event-tasks/useEventTasksContext";

export function AllTasksTab() {
  const { tasks, loading, error } = useEventTasksContext();

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
          <TasksKanban tasks={tasks} />
        )}
      </CardContent>
    </Card>
  );
}
