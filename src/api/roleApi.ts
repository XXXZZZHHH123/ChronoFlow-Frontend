import { http } from "@/lib/http";
import type { OrgSystemRole } from "@/services/role";
import { unwrap } from "@/lib/utils";

export async function getSystemRoles(): Promise<OrgSystemRole[]> {
  const res = await http.get("/system/role/list");
  return unwrap<OrgSystemRole[]>(res.data);
}
