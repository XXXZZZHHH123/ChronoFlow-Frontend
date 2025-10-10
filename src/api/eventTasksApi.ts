import { unwrap } from "@/lib/utils";
import { http } from "@/lib/http";
import {
  assignableMembersResponseSchema,
  eventTaskListSchema,
  type EventGroupWithAssignableMembers,
  type EventTask,
  type EventTaskCreateConfig,
} from "@/lib/validation/schema";

export async function getEventTasks(eventId: string): Promise<EventTask[]> {
  const res = await http.get(`/system/task/${eventId}`);
  const raw = unwrap(res.data);
  return eventTaskListSchema.parse(raw);
}

export async function createEventTask(eventId: string, input: EventTaskCreateConfig) {
  const res = await http.post(`/system/task/${eventId}`, input);
  return unwrap(res.data);
}

export async function updateEventTask(
  eventId: string,
  taskId: string,
  input: EventTaskCreateConfig
) {
  const res = await http.patch(
    `/system/task/${eventId}/${taskId}`,
    input
  );
  return unwrap(res.data);
}

export async function getAssignableMembers(
  eventId: string
): Promise<EventGroupWithAssignableMembers[]> {
  const res = await http.get(`/system/events/${eventId}/assignable-members`);
  const raw = unwrap(res.data);
  return assignableMembersResponseSchema.parse(raw);
}

export async function deleteEventTaskSample() {
  console.log("deleted");
}

export async function updateEventTaskSample() {
  console.log("updated");
}