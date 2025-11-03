import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <CardHeader className="pb-2">
        <CardTitle>Permission Management</CardTitle>
        <CardDescription className="mt-1">
          Create and configure permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 p-4 sm:p-2">
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
