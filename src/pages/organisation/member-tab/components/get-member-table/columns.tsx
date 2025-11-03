import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import type { Member } from "@/lib/validation/schema";
import MemberConfigFormSheet from "../MemberConfigForm";
import Swal from "sweetalert2";
import { deleteMember } from "@/api/memberApi";
import type { RoleOption } from "@/services/role";

export const MemberColumns = (
  onRefresh: () => Promise<void> | void,
  roleOptions: RoleOption[]
): ColumnDef<Member>[] => [
  {
    id: "actions",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Action" />
      </div>
    ),
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
        } catch (err: unknown) {
          const msg =
            err instanceof Error
              ? err.message
              : "Unable to delete the member. Please try again.";
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
          <MemberConfigFormSheet
            member={member}
            onRefresh={onRefresh}
            rolesOptions={roleOptions}
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
        <DataTableColumnHeader column={column} title="Name" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">{row.getValue("name") ?? ""}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Email" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Phone" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">{row.getValue("phone") ?? ""}</div>
    ),
  },
  {
    id: "role_keys",
    accessorFn: (row) => {
      const ids = row.roles ?? [];
      return Array.from(
        new Set(
          ids
            .map((id) => roleOptions.find((o) => o.id === id)?.label)
            .filter(Boolean)
        )
      );
    },
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Roles" />
      </div>
    ),
    cell: ({ row }) => {
      const roles = (row.getValue("role_keys") as string[]) ?? [];
      if (!roles.length) return <div className="flex justify-center"></div>;
      return (
        <div className="flex justify-center flex-wrap gap-1">
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
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Registered" />
      </div>
    ),
    cell: ({ row }) => {
      const val = row.getValue("registered") as boolean;
      return (
        <div className="flex justify-center">
          <span className={val ? "text-green-600" : "text-amber-600"}>
            {val ? "Yes" : "No"}
          </span>
        </div>
      );
    },
    filterFn: (row, id, filterValues: string[]) => {
      if (!Array.isArray(filterValues) || filterValues.length === 0)
        return true;
      return filterValues.includes(String(row.getValue(id)));
    },
  },
];
