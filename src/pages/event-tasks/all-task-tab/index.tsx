import { Card, CardContent } from "@/components/ui/card";
import { TasksKanban } from "../shared-components/TasksKaben";
import { useEventTasksContext } from "@/contexts/event-tasks/useEventTasksContext";

export function AllTasksTab() {
  const { allTasks, loading, error } = useEventTasksContext();

  const renderContent = () => {
    if (loading)
      return <p className="text-sm text-muted-foreground">Loading tasks…</p>;
    if (error) return <p className="text-sm text-red-500">{error}</p>;
    return <TasksKanban tasks={allTasks} />;
  };

  return (
    <Card className="rounded-lg border-none">
      <CardContent className="p-4 sm:p-6 space-y-3">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
