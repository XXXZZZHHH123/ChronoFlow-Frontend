import { http } from "@/lib/http";
import {
  roleResponseSchema,
  type Role,
  type RoleAssign,
  type RoleConfig,
} from "@/lib/validation/schema";
import { unwrap } from "@/lib/utils";

export async function getSystemRoles(): Promise<Role[]> {
  const res = await http.get("/system/roles");
  const raw = unwrap(res.data);
  return roleResponseSchema.parse(raw);
}

export async function createRole(input: RoleConfig) {
  const res = await http.post("/system/roles", input);
  return unwrap<Role>(res.data);
}

export async function updateRole(roleId: string, input: RoleConfig) {
  const res = await http.patch(`/system/roles/${roleId}`, input);
  return unwrap(res.data);
}

export async function deleteRole(roleId: string) {
  const res = await http.delete(`/system/roles/${roleId}`);
  return unwrap(res.data);
}

export async function assignRole(input: RoleAssign) {
  const res = await http.post("/system/roles/assign", input);
  return unwrap(res.data);
}
