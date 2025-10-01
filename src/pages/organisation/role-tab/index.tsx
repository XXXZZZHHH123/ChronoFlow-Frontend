import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTableLoading } from "@/components/data-table/data-table-skeleton";
import { useSystemRoles } from "@/hooks/roles/useSystemRoles";
import RoleTable from "./components/get-role-table/data-table";
import { RoleColumns } from "./components/get-role-table/columns";
import { usePermissions } from "@/hooks/permissions/usePermission";

export default function RoleTab({
  autoFetch = false,
}: {
  autoFetch?: boolean;
}) {
  const {
    roles,
    loading,
    error,
    refresh: onRolesRefresh,
  } = useSystemRoles(autoFetch);

  const { permissions } = usePermissions(autoFetch);

  const columns = useMemo(
    () => RoleColumns(onRolesRefresh, permissions),
    [onRolesRefresh, permissions]
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
              <RoleTable
                columns={columns}
                data={roles}
                onRefresh={onRolesRefresh}
                permissionOptions={permissions}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
