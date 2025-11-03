import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <CardHeader className="pb-2">
        <CardTitle>Role Management</CardTitle>
        <CardDescription className="mt-1">
          Set up and manage roles the way you need.{" "}
          <span className="font-medium">Default roles are protected</span> and
          cannot be edited or deleted.
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
