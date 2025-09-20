import { http } from "@/lib/http";
import type { OrgSystemRole } from "@/services/role";

// Need to refine later after Chen polishes the API
export async function getSystemRoles(): Promise<OrgSystemRole[]> {
  const res = await http.get("/system/role/list");
  return res.data;
}
