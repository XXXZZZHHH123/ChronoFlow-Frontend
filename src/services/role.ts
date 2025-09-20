// API shape
export type OrgSystemRole = {
  id: string;
  roleName: string;
  roleKey: string;
};

// UI-friendly option
export type RoleOption = {
  id: string;
  label: string;
};

// Transform API roles into RoleOption[]
export function buildRoleOptions(roles: OrgSystemRole[]): RoleOption[] {
  return roles.map((r) => ({ id: r.id, label: r.roleKey }));
}

// Get all keys (["ADMIN", "MEMBER", ...])
export function getAllRoleKeys(roles: OrgSystemRole[]): string[] {
  return roles.map((r) => r.roleKey);
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
