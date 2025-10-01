import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { Permission } from "@/lib/validation/schema";
import PermissionConfigFormModal from "../PermissionConfigForm";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { deletePermission } from "@/api/permissionApi";

export const PermissionColumns = (
  onRefresh: () => Promise<void> | void
): ColumnDef<Permission>[] => [
  {
    id: "actions",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Action" />
      </div>
    ),
    cell: ({ row }) => {
      const permission = row.original;

      const onDelete = async () => {
        const result = await Swal.fire({
          title: "Delete permission?",
          html: `This will remove <b>${permission.name}</b>.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete",
          cancelButtonText: "Cancel",
          reverseButtons: true,
          focusCancel: true,
        });

        if (!result.isConfirmed) return;

        try {
          await deletePermission(permission.id);
          await Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "The permission has been deleted.",
            confirmButtonText: "OK",
          });
          await onRefresh();
        } catch (err: unknown) {
          const msg =
            err instanceof Error
              ? err.message
              : "Unable to delete the permission. Please try again.";
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
          <Button size="sm" variant="destructive" onClick={onDelete}>
            Delete
          </Button>
          <PermissionConfigFormModal
            permission={permission}
            onRefresh={onRefresh}
          />
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
        <DataTableColumnHeader column={column} title="Permission Name" />
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
        <DataTableColumnHeader column={column} title="Permission Key" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center font-mono">
        {row.getValue("key") as string}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Description" />
      </div>
    ),
    cell: ({ row }) => {
      const desc = row.getValue("description") as string | undefined;
      return (
        <div className="flex justify-center">
          {desc ? (
            <span>{desc}</span>
          ) : (
            <span className="text-muted-foreground"></span>
          )}
        </div>
      );
    },
  },
];
