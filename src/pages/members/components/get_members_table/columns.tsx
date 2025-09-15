import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import type { Member } from "@/lib/validation/schema";
import { mapRoleIdsToKeys } from "@/lib/shared/role";
import MemberConfigFormSheet from "../MemberConfigForm";
import Swal from "sweetalert2";
import { deleteMember } from "@/api/memberApi";

export const MemberColumns = (
  onRefresh: () => Promise<void> | void
): ColumnDef<Member>[] => [
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const member = row.original;

      const onDelete = async () => {
        const result = await Swal.fire({
          title: "Delete member?",
          html: `This will remove <b>${member.email}</b>.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete",
          cancelButtonText: "Cancel",
          reverseButtons: true,
          focusCancel: true,
        });

        if (!result.isConfirmed) return;

        try {
          await deleteMember(member.id);
          await Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "The member has been deleted.",
            confirmButtonText: "OK",
          });
          await onRefresh();
        } catch (err: any) {
          await Swal.fire({
            icon: "error",
            title: "Delete failed",
            text:
              err?.message ?? "Unable to delete the member. Please try again.",
            confirmButtonText: "OK",
          });
        }
      };

      return (
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" onClick={onDelete}>
            Delete
          </Button>
          <MemberConfigFormSheet member={member} onRefresh={onRefresh} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div>{row.getValue("name") ?? ""}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => <div>{row.getValue("phone") ?? ""}</div>,
  },
  {
    id: "role_keys",
    accessorFn: (row) => mapRoleIdsToKeys(row.roles.map(Number)),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roles" />
    ),
    cell: ({ row }) => {
      const roles = (row.getValue("role_keys") as string[]) ?? [];
      if (!roles.length) return "";
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((r) => (
            <span
              key={r}
              className="rounded bg-muted px-2 py-0.5 text-xs leading-5"
            >
              {r}
            </span>
          ))}
        </div>
      );
    },
    filterFn: (row, id, filterValues: string[]) => {
      const roles = (row.getValue(id) as string[]) ?? [];
      if (!Array.isArray(filterValues) || filterValues.length === 0)
        return true;
      return filterValues.every((v) => roles.includes(v));
    },
  },
  {
    accessorKey: "registered",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registered" />
    ),
    cell: ({ row }) => {
      const val = row.getValue("registered") as boolean;
      return (
        <span className={val ? "text-green-600" : "text-amber-600"}>
          {val ? "Yes" : "No"}
        </span>
      );
    },
    filterFn: (row, id, filterValues: string[]) => {
      if (!Array.isArray(filterValues) || filterValues.length === 0)
        return true;
      return filterValues.includes(String(row.getValue(id)));
    },
  },
];
