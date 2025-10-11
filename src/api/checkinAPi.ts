import { http } from "@/lib/http";
import { unwrap } from "@/lib/utils";

export type AttendeeInfo = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  eventName: string;
  checkInTime?: string;
  checkInStatus: boolean;
  message?: string;
};

export type CheckInResult = {
  success: boolean;
  userName: string;
  eventName: string;
  checkInTime: string;
  message: string;
};

export async function getAttendeeInfo(token: string): Promise<AttendeeInfo> {
  const res = await http.get(`/system/attendee/scan?token=${token}`);
  return unwrap<AttendeeInfo>(res.data);
}

export async function staffCheckIn(token: string): Promise<CheckInResult> {
  const res = await http.post("/system/attendee/staff-scan", { token });
  return unwrap<CheckInResult>(res.data);
}
