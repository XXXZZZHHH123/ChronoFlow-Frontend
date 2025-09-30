import { useEffect, useState, useCallback } from "react";
import { getMembers } from "@/api/memberApi";
import type { Member } from "@/lib/validation/schema";

export type UseMembersType = {
  members: Member[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export function useMembers(autoFetch: boolean = false): UseMembersType {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMembers();
      setMembers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchMembers();
    }
  }, [autoFetch, fetchMembers]);

  return {
    members,
    loading,
    error,
    onRefresh: fetchMembers,
  };
}
