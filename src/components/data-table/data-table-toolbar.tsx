import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export type FilterOption = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
};

export type FilterColumn = {
  column: string;
  option: FilterOption[];
  searchParams?: boolean;
  title: string;
};

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchColumn?: string[];
  filterColumn?: FilterColumn[];
  button?: React.ReactNode;
  buttonRight?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  filterColumn,
  button,
  buttonRight,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [searchParams] = useSearchParams();

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      {/* Left side */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {button}

        {searchColumn && (
          <div className="flex h-9 items-center rounded-md border border-input bg-background pl-3 text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            {searchColumn.length === 0 ? (
              <input
                placeholder="Filter all columns..."
                value={table.getState().globalFilter ?? ""}
                onChange={(event) => {
                  table.setGlobalFilter(event.target.value);
                }}
                className="w-40 px-2 bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed"
              />
            ) : (
              <input
                placeholder={
                  searchColumn
                    .map(
                      (col) =>
                        table.getColumn(col)?.getFilterValue() as
                          | string
                          | undefined
                    )
                    .find((v) => v !== undefined) ?? "Filter ..."
                }
                onChange={(event) => {
                  const filterValue = event.target.value;
                  searchColumn.forEach((col) => {
                    table.getColumn(col)?.setFilterValue(filterValue);
                  });
                }}
                className="w-full px-2 bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed"
              />
            )}
          </div>
        )}

        {filterColumn?.map((col) => {
          const column = table.getColumn(col.column);
          if (!column) return null;

          return (
            <DataTableFacetedFilter
              key={col.column}
              column={column}
              title={col.title}
              options={col.option}
              selectedOption={
                col.searchParams === true
                  ? searchParams.get(col.column)?.split(",")
                  : undefined
              }
            />
          );
        })}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-9 px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">{buttonRight}</div>
    </div>
  );
}
