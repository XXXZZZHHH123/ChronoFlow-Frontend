import { useCallback, useEffect, useState } from "react";
import { getPermissions } from "@/api/permissionApi";
import type { Permission } from "@/lib/validation/schema";

export type UsePermissionsType = {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export function usePermissions(autoFetch: boolean = false): UsePermissionsType {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPermissions();
      setPermissions(data);
    } catch (e: unknown) {
      setPermissions([]);
      setError(e instanceof Error ? e.message : "Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) void fetchPermissions();
  }, [autoFetch, fetchPermissions]);

  return { permissions, loading, error, onRefresh: fetchPermissions };
}
