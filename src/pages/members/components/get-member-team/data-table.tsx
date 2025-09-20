import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ExportExcel } from "@/components/export-excel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { type Member } from "@/lib/validation/schema";
import { getRoleKeysByIds, type RoleOption } from "@/services/role";
import { registeredFilterOptions } from "@/services/member";
import BulkMemberUploadSheet from "../MemberBulkUpload";
import CreateMemberSheet from "../MemberConfigForm";
import { getDropDownValues } from "@/lib/utils";
import { useMemo } from "react";

type MembersTableProps = {
  columns: ColumnDef<Member, unknown>[];
  data: Member[];
  onRefresh: () => void;
  roleOptions: RoleOption[];
};

export default function MembersTable({
  columns,
  data,
  onRefresh,
  roleOptions,
}: MembersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableRowSelection: true,
  });

  const allTableData = useMemo(() => {
    return table.getFilteredRowModel().rows.map((row) => row.original);
  }, [table]);

  const excelExportData = useMemo(() => {
    return allTableData.map((item) => {
      const resolved = getRoleKeysByIds(item.roles ?? [], roleOptions);
      return {
        Name: item.name,
        Email: item.email,
        Phone: item.phone,
        Roles: resolved.join(", "),
        Registered: item.registered ? "Yes" : "No",
      };
    });
  }, [allTableData, roleOptions]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
        <DataTableToolbar
          table={table}
          searchColumn={[]}
          filterColumn={[
            {
              column: "registered",
              option: registeredFilterOptions(),
              title: "Registeration",
              searchParams: true,
            },
            {
              column: "role_keys",
              option: getDropDownValues(roleOptions, "label"),
              title: "Role",
              searchParams: true,
            },
          ]}
          buttonRight={
            <div className="flex items-center gap-2">
              <ExportExcel
                jsonData={excelExportData}
                fileName={"members"}
                loading={false}
              />
              <BulkMemberUploadSheet
                onRefresh={onRefresh}
                roleOptions={roleOptions}
              />
              <CreateMemberSheet
                onRefresh={onRefresh}
                rolesOptions={roleOptions}
              />
            </div>
          }
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
