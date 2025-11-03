import { DataTableLoading } from "@/components/data-table/data-table-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMembers } from "@/hooks/members/useMember";
import { useSystemRoles } from "@/hooks/roles/useSystemRoles";
import { useMemo } from "react";
import { MemberColumns } from "./components/get-member-table/columns";
import MembersTable from "./components/get-member-table/data-table";

export default function MembersTab({
  autoFetch = false,
}: {
  autoFetch?: boolean;
}) {
  const {
    members,
    loading: membersLoading,
    error: membersError,
    onRefresh: onMemberRefresh,
  } = useMembers(autoFetch);

  const {
    roleOptions,
    loading: rolesLoading,
    error: rolesError,
  } = useSystemRoles(autoFetch);

  const loading = membersLoading || rolesLoading;
  const error = membersError || rolesError;

  const columns = useMemo(
    () => MemberColumns(onMemberRefresh, roleOptions),
    [onMemberRefresh, roleOptions]
  );

  return (
    <Card className="rounded-lg border-none">
      <CardHeader className="pb-2">
        <CardTitle>Member Management</CardTitle>
        <CardDescription>
          View, edit, and manage all members, their roles, and registration
          status.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 p-4 sm:p-2">
        {loading ? (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <DataTableLoading columnCount={8} />
            </div>
          </div>
        ) : error ? (
          <div className="py-6 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[960px]">
              <MembersTable
                columns={columns}
                data={members}
                onRefresh={onMemberRefresh}
                roleOptions={roleOptions}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
