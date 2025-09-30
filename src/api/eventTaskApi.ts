import { http } from "@/lib/http";
import { unwrap } from "@/lib/utils";
import { eventTaskListSchema, type EventTask } from "@/lib/validation/schema";

export async function getEventTasks(eventId: string): Promise<EventTask[]> {
  const res = await http.get(`/system/events/${eventId}/tasks`);
  const raw = unwrap(res.data);
  return eventTaskListSchema.parse(raw);
}
