// components/get_members_table/columns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import type { Member } from "@/lib/validation/schema";
import { mapRoleIdsToKeys } from "@/lib/shared/role";

export const MemberAdminColumns = (
  onRefresh: () => Promise<void> | void
): ColumnDef<Member>[] => [
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              if (confirm(`Delete ${member.email}?`)) {
                // TODO: await deleteMember(member.id)
                await onRefresh();
              }
            }}
          >
            Delete
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.getValue("id")}</div>
    ),
    size: 80,
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
    accessorFn: (row) => mapRoleIdsToKeys(row.roles),
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
