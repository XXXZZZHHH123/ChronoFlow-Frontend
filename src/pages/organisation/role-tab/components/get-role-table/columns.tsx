import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { Role, Permission } from "@/lib/validation/schema";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { deleteRole } from "@/api/roleApi";
import RoleConfigFormModal from "../RoleConfigForm";

export const RoleColumns = (
  onRefresh: () => Promise<void> | void,
  permissionOptions: Permission[]
): ColumnDef<Role>[] => [
  {
    id: "actions",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Action" />
      </div>
    ),
    cell: ({ row }) => {
      const role = row.original;

      const onDelete = async () => {
        const result = await Swal.fire({
          title: "Delete role?",
          html: `This will remove <b>${role.name}</b>.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete",
          cancelButtonText: "Cancel",
          reverseButtons: true,
          focusCancel: true,
        });
        if (!result.isConfirmed) return;

        try {
          await deleteRole(role.id);
          await Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "The role has been deleted.",
            confirmButtonText: "OK",
          });
          await onRefresh?.();
        } catch (err: unknown) {
          const msg =
            err instanceof Error
              ? err.message
              : "Unable to delete the role. Please try again.";
          await Swal.fire({
            icon: "error",
            title: "Delete failed",
            text: msg,
            confirmButtonText: "OK",
          });
        }
      };

      return (
        <div className="flex justify-center gap-2">
          {role.isDefault ? (
            <span className="text-muted-foreground text-sm italic">
              Default role cannot be edited or deleted
            </span>
          ) : (
            <>
              <Button size="sm" variant="destructive" onClick={onDelete}>
                Delete
              </Button>
              <RoleConfigFormModal
                role={role}
                onRefresh={onRefresh}
                permissionOptions={permissionOptions}
              />
            </>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Role Name" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.getValue("name") as string}
      </div>
    ),
  },
  {
    accessorKey: "key",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Role Key" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center font-mono">
        {row.getValue("key") as string}
      </div>
    ),
  },
  {
    id: "perm_names",
    accessorFn: (row) => (row.permissions ?? []).map((p) => p.name),
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Permissions" />
      </div>
    ),
    cell: ({ row }) => {
      const perms = (row.getValue("perm_names") as string[]) ?? [];
      if (!perms.length)
        return (
          <div className="flex justify-center text-muted-foreground"></div>
        );
      return (
        <div className="flex justify-center flex-wrap gap-1">
          {perms.map((name) => (
            <span
              key={name}
              className="rounded bg-muted px-2 py-0.5 text-xs leading-5"
            >
              {name}
            </span>
          ))}
        </div>
      );
    },
    filterFn: (row, id, filterValues: string[]) => {
      const perms = (row.getValue(id) as string[]) ?? [];
      if (!Array.isArray(filterValues) || filterValues.length === 0)
        return true;
      return filterValues.every((v) => perms.includes(v));
    },
  },
];
