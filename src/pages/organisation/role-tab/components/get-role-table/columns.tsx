import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { Role } from "@/lib/validation/schema";

export const RoleColumns = (
  onRefresh: () => Promise<void> | void
): ColumnDef<Role>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role Name" />
    ),
    cell: ({ row }) => <div>{row.getValue("name") as string}</div>,
  },
  {
    accessorKey: "key",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role Key" />
    ),
    cell: ({ row }) => (
      <div className="font-mono">{row.getValue("key") as string}</div>
    ),
  },
  {
    id: "perm_keys",
    accessorFn: (row) => (row.permissions ?? []).map((p) => p.key),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Permissions" />
    ),
    cell: ({ row }) => {
      const perms = (row.getValue("perm_keys") as string[]) ?? [];
      if (!perms.length)
        return <span className="text-muted-foreground"></span>;
      return (
        <div className="flex flex-wrap gap-1">
          {perms.map((k) => (
            <span
              key={k}
              className="rounded bg-muted px-2 py-0.5 text-xs leading-5"
            >
              {k}
            </span>
          ))}
        </div>
      );
    },
  },
];
