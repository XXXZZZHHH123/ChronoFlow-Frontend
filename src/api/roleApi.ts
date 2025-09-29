import { http } from "@/lib/http";
import { type Role } from "@/lib/validation/schema";
import { unwrap } from "@/lib/utils";

export async function getSystemRoles(): Promise<Role[]> {
  const res = await http.get("/system/roles");
  return unwrap<Role[]>(res.data);
}
