import { http } from "@/lib/http";
import { unwrap } from "@/lib/utils";
import {
  OrgEventSchema,
  OrgEventsResponseSchema,
  type EventConfig,
  type OrgEvent,
} from "@/lib/validation/schema";

export async function getEvents(): Promise<OrgEvent[]> {
  const res = await http.get("/system/events");
  const raw = unwrap<OrgEvent[]>(res.data);
  return OrgEventsResponseSchema.parse(raw);
}

export async function getEventById(id: string | number): Promise<OrgEvent> {
  const res = await http.get(`/system/events/${id}`);
  const raw = unwrap(res.data);
  return OrgEventSchema.parse(raw);
}

const toUtcNoMillis = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
const formatForApi = (d: Date) => toUtcNoMillis(d);
const toPayload = (input: EventConfig) => {
  if (!input.startTime || !input.endTime) {
    throw new Error("Start time and end time are required");
  }
  return {
    name: input.name,
    description: input.description ?? undefined,
    location: input.location,
    startTime: formatForApi(input.startTime),
    endTime: formatForApi(input.endTime),
    ...(input.remark ? { remark: input.remark } : {}),
  };
};

export async function createEvent(input: EventConfig) {
  const res = await http.post("/system/events", toPayload(input));
  return unwrap(res.data);
}

export async function updateEvent(id: string, input: EventConfig) {
  const res = await http.patch(`/system/events/${id}`, toPayload(input));
  return unwrap(res.data);
}

export async function deleteEvent(id: string) {
  const res = await http.delete(`/system/events/${id}`);
  return unwrap(res.data);
}
