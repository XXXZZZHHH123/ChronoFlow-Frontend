import { type Role } from "@/lib/validation/schema";

// UI-friendly option
export type RoleOption = {
  id: string;
  label: string;
};

// Transform API roles into RoleOption[]
export function buildRoleOptions(roles: Role[]): RoleOption[] {
  return roles.map((r) => ({ id: r.id, label: r.key }));
}

// Get all keys (["ADMIN", "MEMBER", ...])
export function getAllRoleKeys(roles: Role[]): string[] {
  return roles.map((r) => r.key);
}

// Resolve IDs to keys
export function getRoleKeysByIds(
  roleIds: readonly string[] = [],
  roleOptions: RoleOption[] = []
): string[] {
  const idToLabel = Object.fromEntries(roleOptions.map((o) => [o.id, o.label]));
  const out = new Set<string>();

  for (const id of roleIds) {
    const label = idToLabel[id];
    if (label) out.add(label);
  }

  return Array.from(out);
}

// All system permission
export const ALL_PERMISSION_ID = "1971465366969307147";