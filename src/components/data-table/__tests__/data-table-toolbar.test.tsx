import type { Table } from "@tanstack/react-table";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataTableToolbar } from "../data-table-toolbar";

type FacetedCall = {
  column: unknown;
  title: string;
  options: unknown;
  selectedOption?: string[];
};

const facetedCalls = vi.hoisted(() => [] as FacetedCall[]);

vi.mock("@/components/data-table/data-table-faceted-filter", () => ({
  DataTableFacetedFilter: (props: FacetedCall) => {
    facetedCalls.push(props);
    return (
      <button type="button" data-testid={`faceted-${props.title}`}>
        {props.title}
      </button>
    );
  },
}));

type SearchSetter = (
  nextInit: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)
) => void;
type UseSearchParamsReturn = [URLSearchParams, SearchSetter];

function createSetter(): ReturnType<typeof vi.fn<SearchSetter>> {
  return vi.fn<SearchSetter>(() => {});
}

const searchParamsMock = vi.hoisted(() => ({
  value: [new URLSearchParams(), createSetter()] as UseSearchParamsReturn,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useSearchParams: () => searchParamsMock.value,
  };
});

type TableConfig = {
  columnFilters?: unknown[];
  globalFilter?: string;
  columns?: Record<
    string,
    {
      id: string;
      setFilterValue: ReturnType<typeof vi.fn>;
    }
  >;
};

function createMockTable<TData>({
  columnFilters = [],
  globalFilter = "",
  columns = {},
}: TableConfig = {}) {
  const setGlobalFilter = vi.fn();
  const resetColumnFilters = vi.fn();

  const table = {
    getState: () => ({
      columnFilters,
      globalFilter,
    }),
    setGlobalFilter,
    getColumn: (id: string) => columns[id],
    resetColumnFilters,
  } as unknown as Table<TData>;

  return { table, setGlobalFilter, resetColumnFilters, columns };
}

beforeEach(() => {
  facetedCalls.length = 0;
  searchParamsMock.value = [new URLSearchParams(), createSetter()];
});

describe("DataTableToolbar global search", () => {
  it("renders global filter input when searchColumn empty array and updates table state", () => {
    const { table, setGlobalFilter } = createMockTable({
      columnFilters: [],
      globalFilter: "initial",
    });

    render(
      <DataTableToolbar
        table={table}
        searchColumn={[]}
        button={<div data-testid="left-button">Button</div>}
      />
    );

    const input = screen.getByPlaceholderText("Filter all columns...");
    expect(input).toHaveValue("initial");

    fireEvent.change(input, { target: { value: "alpha" } });
    expect(setGlobalFilter).toHaveBeenCalledWith("alpha");
  });
});

describe("DataTableToolbar column search", () => {
  it("writes filter value to each specified column", () => {
    const nameColumn = { id: "name", setFilterValue: vi.fn() };
    const emailColumn = { id: "email", setFilterValue: vi.fn() };

    const { table } = createMockTable({
      columns: { name: nameColumn, email: emailColumn },
    });

    render(
      <DataTableToolbar
        table={table}
        searchColumn={["name", "email"]}
      />
    );

    const input = screen.getByPlaceholderText("Filter by name, email...");
    fireEvent.change(input, { target: { value: "bob" } });

    expect(nameColumn.setFilterValue).toHaveBeenCalledWith("bob");
    expect(emailColumn.setFilterValue).toHaveBeenCalledWith("bob");
  });
});

describe("DataTableToolbar filters and reset", () => {
  it("renders faceted filters with search param selections", () => {
    const statusColumn = { id: "status", setFilterValue: vi.fn() };
    const { table } = createMockTable({
      columns: { status: statusColumn },
    });

    searchParamsMock.value = [
      new URLSearchParams("status=active,completed"),
      createSetter(),
    ];

    render(
      <DataTableToolbar
        table={table}
        filterColumn={[
          {
            column: "status",
            title: "Status",
            option: [],
            searchParams: true,
          },
        ]}
      />
    );

    expect(screen.getByTestId("faceted-Status")).toBeInTheDocument();
    expect(facetedCalls[0].selectedOption).toEqual(["active", "completed"]);
  });

  it("shows reset button when filters applied and triggers reset", () => {
    const { table, resetColumnFilters } = createMockTable({
      columnFilters: [{ id: "status", value: "active" }],
    });

    render(<DataTableToolbar table={table} />);

    const resetButton = screen.getByRole("button", { name: /Reset/i });
    fireEvent.click(resetButton);

    expect(resetColumnFilters).toHaveBeenCalled();
  });

  it("renders optional button slots on both sides", () => {
    const { table } = createMockTable();

    render(
      <DataTableToolbar
        table={table}
        button={<span data-testid="left-slot">Left</span>}
        buttonRight={<span data-testid="right-slot">Right</span>}
      />
    );

    expect(screen.getByTestId("left-slot")).toBeInTheDocument();
    expect(screen.getByTestId("right-slot")).toBeInTheDocument();
  });
});
