import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMembers } from "@/api/memberApi";
import type { Member } from "@/lib/validation/schema";

export type UseMembersType = {
  members: Member[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export function useMembers(autoFetch: boolean = false): UseMembersType {
  const queryClient = useQueryClient();

  const query = useQuery<Member[], Error>({
    queryKey: ["members"],
    queryFn: getMembers,
    enabled: autoFetch,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const onRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["members"] });
  };

  return {
    members: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: query.error ? query.error.message : null,
    onRefresh,
  };
}
