import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTableLoading } from "@/components/data-table/data-table-skeleton";
import { usePermissions } from "@/hooks/permissions/usePermission";
import { PermissionColumns } from "./components/get-permission-table/columns";
import PermissionTable from "./components/get-permission-table/data-table";

export default function PermissionTab({
  autoFetch = false,
}: {
  autoFetch?: boolean;
}) {
  const {
    permissions,
    loading,
    error,
    onRefresh: onPermissionsRefresh,
  } = usePermissions(autoFetch);

  const columns = useMemo(
    () => PermissionColumns(onPermissionsRefresh),
    [onPermissionsRefresh]
  );

  return (
    <Card className="rounded-lg border-none">
      <CardContent className="p-4 sm:p-6">
        {loading ? (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <DataTableLoading columnCount={3} />
            </div>
          </div>
        ) : error ? (
          <div className="py-6 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <PermissionTable
                columns={columns}
                data={permissions}
                onRefresh={onPermissionsRefresh}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
