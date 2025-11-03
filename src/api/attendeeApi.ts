import { http } from "@/lib/http";
import { unwrap } from "@/lib/utils";
import {
  attendeesResponseSchema,
  type Attendee,
  type IndiAttendeeConfig,
} from "@/lib/validation/schema";

export async function getAttendees(
  eventId: string | number
): Promise<Attendee[]> {
  const res = await http.get(
    `/system/attendee/list/${encodeURIComponent(String(eventId))}`
  );
  const raw = unwrap<Attendee[]>(res.data);
  return attendeesResponseSchema.parse(raw);
}

export async function createIndividualAttendee(
  input: IndiAttendeeConfig,
  eventId: string | number
) {
  const toPayload = (input: IndiAttendeeConfig) => ({
    eventId: eventId,
    attendees: [input],
  });

  const res = await http.post("/system/attendee", toPayload(input));
  return unwrap(res.data);
}

export async function updateAttendee(
  attendeeId: string | number,
  input: IndiAttendeeConfig
) {
  const res = await http.patch(`/system/attendee/${attendeeId}`, {
    email: input.email,
    name: input.name,
    mobile: input.mobile,
  });
  return unwrap(res.data);
}

export async function uploadAttendeesExcel(
  file: File,
  eventId: string | number
) {
  const form = new FormData();
  form.append("file", file, file.name);

  const res = await http.post(`/system/attendee/bulk/${eventId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return unwrap(res.data);
}

export async function deleteAttendee(
  attendeeId: string | number
): Promise<boolean> {
  const res = await http.delete(`/system/attendee/${attendeeId}`);
  return unwrap<boolean>(res.data);
}
