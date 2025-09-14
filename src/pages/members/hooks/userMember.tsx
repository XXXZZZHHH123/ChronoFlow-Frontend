import { useCallback, useEffect, useState } from "react";
import { getMembers } from "@/api/memberApi";
import type { Member } from "@/lib/validation/schema";

export function useMembers(autoFetch: boolean = true) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load members");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) void fetchMembers();
  }, [autoFetch, fetchMembers]);

  return { members, loading, error, onRefresh: fetchMembers };
}
