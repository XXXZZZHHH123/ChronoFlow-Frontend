import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getMemberDashboard } from "@/api/memberDashBoardApi";
import type { MemberDashboard } from "@/lib/validation/schema";
import { useAuthStore } from "@/stores/authStore";

export type UseMemberDashboardResult = {
  member: MemberDashboard["member"] | null;
  groups: MemberDashboard["groups"];
  tasks: MemberDashboard["tasks"];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export function useMemberDashboard(
  autoFetch: boolean = false
): UseMemberDashboardResult {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery<MemberDashboard, Error>({
    queryKey: ["member-dashboard", user?.id],
    queryFn: getMemberDashboard,
    enabled: !!user && autoFetch,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const onRefresh = async () => {
    if (!user) return;
    await queryClient.invalidateQueries({
      queryKey: ["member-dashboard", user.id],
    });
  };

  const data = query.data ?? null;

  return {
    member: data?.member ?? null,
    groups: data?.groups ?? [],
    tasks: data?.tasks ?? [],
    loading: query.isLoading || query.isFetching,
    error: query.error ? query.error.message : null,
    onRefresh,
  };
}
