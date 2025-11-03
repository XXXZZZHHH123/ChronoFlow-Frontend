import { useParams } from "react-router-dom";
import { TasksProvider } from "@/contexts/event-tasks/EventTasksProvider";
import { EventTasksTabs } from "./shared-components/EventTasksTabs";

export default function EventTasksPage() {
  const { id: eventId = null } = useParams<{ id: string }>();
  return (
    <TasksProvider eventId={eventId} autoFetch>
      <EventTasksTabs />
    </TasksProvider>
  );
}
