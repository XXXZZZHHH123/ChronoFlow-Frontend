import { DataTableLoading } from "@/components/data-table/data-table-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import MembersTable from "./components/get_members_table/data-table";
import { MemberAdminColumns } from "./components/get_members_table/columns";
import { useMembers } from "./hooks/userMember";

export default function MembersPage() {
  const { members, loading, error, onRefresh } = useMembers(true);

  return (
    <Card className="rounded-lg border-none">
      <CardContent className="p-4 sm:p-6">
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
                columns={MemberAdminColumns(onRefresh)}
                data={members}
                onRefresh={onRefresh}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
