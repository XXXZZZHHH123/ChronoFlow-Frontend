import { unwrap } from "@/lib/utils";
// import { eventTaskListSchema, type EventTask } from "@/lib/validation/schema";

// export async function getEventTasks(eventId: string): Promise<EventTask[]> {
//   const res = await http.get(`/system/events/${eventId}/tasks`);
//   const raw = unwrap(res.data);
//   return eventTaskListSchema.parse(raw);
// }

import { http } from "@/lib/http";
import {
  assignableMembersResponseSchema,
  type EventGroupWithAssignableMembers,
  type EventTask,
  type EventTaskConfig,
} from "@/lib/validation/schema";
// import { http } from "@/lib/http"; // keep commented while testing
// import { unwrap } from "@/lib/utils";
// import { eventTaskListSchema } from "@/lib/validation/schema";

export async function getEventTasks(eventId: string): Promise<EventTask[]> {
  // const res = await http.get(`/system/events/${eventId}/tasks`);
  // const raw = unwrap(res.data);
  // return eventTaskListSchema.parse(raw);

  // 🔹 Mock sample data
  console.log("Fetching tasks for event ID:", eventId);
  return [
    {
      id: "task_001",
      name: "Speaker Coordination",
      description: "Confirm speakers, schedules, and AV needs.",
      status: 1, // In Progress
      startTime: "2024-12-01T09:00:00Z",
      endTime: "2024-12-15T09:00:00Z",
      assignedUser: {
        id: "usr_2033",
        name: "Sarah Miller",
        group: {
          id: "grp_marketing",
          name: "Marketing Team",
        },
      },
    },
    {
      id: "task_002",
      name: "Catering Arrangements",
      description: "Arrange meals and note dietary preferences.",
      status: 0, // Pending
      startTime: null,
      endTime: "2024-12-09T10:00:00Z",
      assignedUser: {
        id: "usr_1107",
        name: "Anna Lee",
        group: {
          id: "grp_logistics",
          name: "Logistics Team",
        },
      },
    },
    {
      id: "task_003",
      name: "Venue Booking",
      description: null,
      status: 2, // Completed
      startTime: "2024-11-20T09:00:00Z",
      endTime: "2024-11-25T09:00:00Z",
      assignedUser: null, // unassigned task
    },
  ];
}

export async function createEventTask(eventId: string, input: EventTaskConfig) {
  const res = await http.post(`/system/events/${eventId}/tasks`, input);
  return unwrap(res.data);
}

export async function updateEventTask(
  eventId: string,
  taskId: string,
  input: EventTaskConfig
) {
  const res = await http.patch(
    `/system/events/${eventId}/tasks/${taskId}`,
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
