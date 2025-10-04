import { http } from "@/lib/http";
import { unwrap } from "@/lib/utils";
import {
  MemberDashboardSchema,
  type MemberDashboard,
} from "@/lib/validation/schema";

export async function getMemberDashboard(): Promise<MemberDashboard> {
  const res = await http.get("/system/events/tasks/dashboard");
  const raw = unwrap<unknown>(res.data);
  return MemberDashboardSchema.parse(raw);
}
