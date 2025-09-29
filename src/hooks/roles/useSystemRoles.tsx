import { useCallback, useEffect, useMemo, useState } from "react";
import { getSystemRoles } from "@/api/roleApi";
import { type RoleOption, buildRoleOptions } from "@/services/role";
import { type Role } from "@/lib/validation/schema";

export type UseSystemRolesType = {
  roles: Role[];
  roleOptions: RoleOption[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useSystemRoles(autoFetch: boolean = false): UseSystemRolesType {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSystemRoles();
      setRoles(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load roles");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) void refresh();
  }, [autoFetch, refresh]);

  const roleOptions: RoleOption[] = useMemo(
    () => buildRoleOptions(roles),
    [roles]
  );

  return { roles, roleOptions, loading, error, refresh };
}
