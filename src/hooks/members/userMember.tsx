import { useCallback, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to load members");
      }
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
