export type Role = "ORGANIZER" | "MANAGER" | "STAFF" | "ADMIN";

export const SYS_MEMBER_ROLE_MAP = {
  "1": "ADMIN",
  "2": "ORGANIZER",
  "3": "STAFF",
  "4": "MANAGER",
} as const satisfies Record<string, Role>;

export type SysMemberRoleId = keyof typeof SYS_MEMBER_ROLE_MAP;

// for profile display for system
export function normalizeRoles(input?: string | string[] | null): Role[] {
  if (!input) return [];

  const tokens = (Array.isArray(input) ? input : [input])
    .flatMap((r) => r.split(","))
    .map((r) => r.trim())
    .filter(Boolean);

  const out = new Set<Role>();

  for (const t of tokens) {
    if (t in SYS_MEMBER_ROLE_MAP) {
      out.add(SYS_MEMBER_ROLE_MAP[t as SysMemberRoleId]);
      continue;
    }
    const upper = t.toUpperCase();

    if (
      upper === "ADMIN" ||
      upper === "ORGANIZER" ||
      upper === "STAFF" ||
      upper === "MANAGER"
    ) {
      out.add(upper as Role);
    }
  }
  return Array.from(out);
}

// Role checking for dynamic menu for system
export function hasAnyRole(userRoles: Role[] | undefined, ...need: Role[]) {
  return !!userRoles?.some((r) => need.includes(r));
}

// For organisation members
export const ORG_MEMBER_ROLE_MAP = {
  "2": "ORGANIZER",
  "3": "STAFF",
  "4": "MANAGER",
} as const satisfies Record<string, Role>;

export type OrgMemberRoleId = keyof typeof ORG_MEMBER_ROLE_MAP;

// Transform ID array
export function mapOrgMemberRoleIdsToKeys(roleIds: readonly string[]): Role[] {
  const out = new Set<Role>();
  for (const id of roleIds ?? []) {
    const role = ORG_MEMBER_ROLE_MAP[id as OrgMemberRoleId];
    if (role) out.add(role);
  }
  return Array.from(out);
}

export function mapOrgMemberRoleIdToKey(
  roleId: string
): Role | `UNKNOWN(${string})` {
  return ORG_MEMBER_ROLE_MAP[roleId as OrgMemberRoleId] ?? `UNKNOWN(${roleId})`;
}

// Derived keys
export const ORG_MEMBER_ROLE_KEYS = Object.values(
  ORG_MEMBER_ROLE_MAP
) as Role[];

// Filter options for UI
export function orgMemberRoleFilterOptions(): { label: Role; value: Role }[] {
  return ORG_MEMBER_ROLE_KEYS.map((k) => ({ label: k, value: k }));
}

// Options list that preserves string IDs
export type OrgMemberRoleOption = { id: OrgMemberRoleId; label: Role };
export const ORG_MEMBER_ROLE_OPTIONS: OrgMemberRoleOption[] = (
  Object.entries(ORG_MEMBER_ROLE_MAP) as [OrgMemberRoleId, Role][]
).map(([id, label]) => ({ id, label }));
