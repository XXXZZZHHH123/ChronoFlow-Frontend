import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMembers } from "@/api/memberApi";
import type { Member } from "@/lib/validation/schema";
import { useAuthStore } from "@/stores/authStore";

export type UseMembersType = {
  members: Member[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export function useMembers(autoFetch: boolean = false): UseMembersType {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery<Member[], Error>({
    queryKey: ["members", user?.id],
    queryFn: getMembers,
    enabled: !!user && autoFetch,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const onRefresh = async () => {
    if (!user) return;
    await queryClient.invalidateQueries({ queryKey: ["members", user.id] });
  };

  return {
    members: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: query.error ? query.error.message : null,
    onRefresh,
  };
}
