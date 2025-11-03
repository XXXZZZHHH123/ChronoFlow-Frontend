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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BulkAttendeeUploadSheet from "../BulkAttendeeUploadSheet";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import AttendeeConfigFormModal from "../AttendeeConfigForm";
import type { Attendee } from "@/lib/validation/schema";
import { useMemo } from "react";
import { ExportExcel } from "@/components/export-excel";

type AttendeeTableProps = {
  eventId: string | number;
  columns: ColumnDef<Attendee, unknown>[];
  data: Attendee[];
  onRefresh: () => void | Promise<void>;
};

export default function AttendeeTable({
  eventId,
  columns,
  data,
  onRefresh,
}: AttendeeTableProps) {
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
      return {
        Name: item.attendeeName,
        Email: item.attendeeEmail,
        Phone: item.attendeeMobile || "N/A",
      };
    });
  }, [allTableData]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
        <DataTableToolbar
          table={table}
          searchColumn={[]}
          filterColumn={[]}
          buttonRight={
            <div className="flex items-center gap-2">
              <ExportExcel
                jsonData={excelExportData}
                fileName={`${eventId}_attendees`}
                loading={false}
              />
              <BulkAttendeeUploadSheet
                eventId={eventId}
                onRefresh={onRefresh}
              />
              <AttendeeConfigFormModal
                eventId={eventId}
                onRefresh={onRefresh}
              />
            </div>
          }
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[720px]">
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
