import { unwrap } from "@/lib/utils";
import { http } from "@/lib/http";
import {
  assignableMembersResponseSchema,
  eventTaskListSchema,
  taskLogResponseSchema,
  type EventGroupWithAssignableMembers,
  type EventTask,
  type EventTaskConfig,
  type EventTaskCreateConfig,
  type TaskLog,
} from "@/lib/validation/schema";
import {
  buildTaskCreateFormData,
  buildTaskConfigFormData,
} from "@/services/eventTask";

export async function getEventTasks(eventId: string): Promise<EventTask[]> {
  const res = await http.get(`/system/task/${eventId}`);
  const raw = unwrap(res.data);
  return eventTaskListSchema.parse(raw);
}

export async function createEventTask(
  eventId: string,
  input: EventTaskCreateConfig
) {
  const form = buildTaskCreateFormData(input);

  const res = await http.post(`/system/task/${eventId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return unwrap(res.data);
}

export async function updateEventTask(
  eventId: string | number,
  taskId: string | number,
  input: EventTaskConfig
) {
  const form = buildTaskConfigFormData(input);
  const res = await http.patch(`/system/task/${eventId}/${taskId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return unwrap(res.data);
}

export async function getAssignableMembers(
  eventId: string
): Promise<EventGroupWithAssignableMembers[]> {
  const res = await http.get(`/system/events/${eventId}/assignable-member`);
  const raw = unwrap(res.data);
  return assignableMembersResponseSchema.parse(raw);
}

export async function deleteEventTask(
  eventId: string | number,
  taskId: string | number
) {
  const res = await http.delete(`/system/task/${eventId}/${taskId}`);
  return unwrap(res.data);
}

export async function getEventTaskLogs(
  eventId: string | number,
  taskId: string | number
): Promise<TaskLog[]> {
  const res = await http.get(`/system/task/${eventId}/log/${taskId}`);
  const data = unwrap(res.data);
  return taskLogResponseSchema.parse(data);
}
