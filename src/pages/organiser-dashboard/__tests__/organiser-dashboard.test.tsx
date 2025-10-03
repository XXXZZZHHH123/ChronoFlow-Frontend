import type { ReactNode } from "react"
import { describe, expect, it, beforeAll, afterAll, vi, afterEach } from "vitest"
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { DataTable } from "../components/data-table"
import { ChartAreaInteractive } from "../components/chart-area-interactive"
import { buildMetrics } from "../metrics"
import type { OrgEvent } from "@/lib/validation/schema"

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

const mocks = vi.hoisted(() => {
  return {
    addRowMock: vi.fn(),
    getRowMock: vi.fn(() => ({ font: {} })),
    getColumnMock: vi.fn(() => ({ alignment: {}, numFmt: "" })),
    writeBufferMock: vi.fn(() => Promise.resolve(new ArrayBuffer(0))),
    saveAsMock: vi.fn(),
  }
})

vi.mock("exceljs", () => {
  class FakeWorkbook {
    creator: string
    created: Date
    xlsx: { writeBuffer: typeof mocks.writeBufferMock }

    constructor() {
      this.creator = ""
      this.created = new Date()
      this.xlsx = { writeBuffer: mocks.writeBufferMock }
    }

    addWorksheet(): {
      columns: never[]
      addRow: typeof mocks.addRowMock
      getRow: typeof mocks.getRowMock
      getColumn: typeof mocks.getColumnMock
    } {
      return {
        columns: [],
        addRow: mocks.addRowMock,
        getRow: mocks.getRowMock,
        getColumn: mocks.getColumnMock,
      }
    }
  }

  return {
    default: { Workbook: FakeWorkbook },
    Workbook: FakeWorkbook,
  }
})

vi.mock("file-saver", () => ({
  default: mocks.saveAsMock,
  saveAs: mocks.saveAsMock,
}))

const { addRowMock, getRowMock, getColumnMock, writeBufferMock, saveAsMock } = mocks

vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartLegend: ({ children }: { children?: ReactNode }) => (
    <div data-testid="chart-legend">{children}</div>
  ),
  ChartTooltip: ({ children }: { children?: ReactNode }) => (
    <div data-testid="chart-tooltip">{children}</div>
  ),
  ChartTooltipContent: ({ children }: { children?: ReactNode }) => (
    <div data-testid="chart-tooltip-content">{children}</div>
  ),
}))

vi.mock("recharts", () => ({
  Area: ({ children }: { children?: ReactNode }) => (
    <div data-testid="recharts-area">{children}</div>
  ),
  AreaChart: ({ children }: { children?: ReactNode }) => (
    <div data-testid="recharts-area-chart">{children}</div>
  ),
  CartesianGrid: () => <div data-testid="recharts-grid" />,
  XAxis: () => <div data-testid="recharts-xaxis" />,
}))

afterEach(() => {
  vi.clearAllMocks()
})

const sampleEvents: OrgEvent[] = [
  {
    id: "event-1",
    name: "Event Alpha",
    description: "First event",
    location: "Main Hall",
    status: 1,
    startTime: new Date(2025, 8, 25, 9, 0),
    endTime: new Date(2025, 8, 25, 12, 0),
    remark: null,
    joiningParticipants: 25,
    groups: [],
    taskStatus: { total: 5, remaining: 1, completed: 4 },
  },
  {
    id: "event-2",
    name: "Event Beta",
    description: "Second event",
    location: "West Coast",
    status: 0,
    startTime: new Date(2025, 8, 26, 8, 0),
    endTime: new Date(2025, 10, 16, 17, 0),
    remark: null,
    joiningParticipants: 0,
    groups: [],
    taskStatus: { total: 3, remaining: 0, completed: 3 },
  },
  {
    id: "event-3",
    name: "Event Gamma",
    description: "Third event",
    location: "UTown Hall",
    status: 1,
    startTime: new Date(2025, 10, 15, 17, 0),
    endTime: new Date(2025, 11, 15, 17, 0),
    remark: null,
    joiningParticipants: 12,
    groups: [],
    taskStatus: { total: 4, remaining: 2, completed: 2 },
  },
]

describe("buildMetrics", () => {
  beforeAll(() => {
    const fixedNow = new Date(2025, 8, 24, 9, 0)
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it("summarises organiser metrics correctly", () => {
    const metrics = buildMetrics(sampleEvents)

    expect(metrics).toHaveLength(4)
    expect(metrics[0]).toMatchObject({
      title: "Total Events",
      value: "3",
      badge: "2 active right now",
    })

    expect(metrics[2]).toMatchObject({
      title: "Registrations",
      value: "37",
      badge: "Across 2 events",
    })

    expect(metrics[3]).toMatchObject({
      title: "Open Tasks",
      value: "3",
      badge: "Present in 2 events",
      badgeTone: "down",
    })

    expect(metrics[1].badge).toMatch(/^Next: /)
  })
})

describe("DataTable", () => {
  it("renders events overview with chronological order by default and years in dates", () => {
    render(<DataTable events={sampleEvents} />)

    expect(screen.getByText("Events Overview")).toBeInTheDocument()

    const table = screen.getByRole("table")
    const rows = within(table).getAllByRole("row")

    expect(within(rows[1]).getByText("Event Alpha")).toBeInTheDocument()
    expect(within(rows[2]).getByText("Event Beta")).toBeInTheDocument()

    expect(within(rows[1]).getByText(/25 Sep[t]? 2025/)).toBeInTheDocument()
  })

  it("toggles sort order when the Starts → Ends button is clicked", async () => {
    const user = userEvent.setup()
    render(<DataTable events={sampleEvents} />)

    const sortButton = screen.getByRole("button", { name: /Starts/ })

    await user.click(sortButton)

    const table = screen.getByRole("table")
    const rows = within(table).getAllByRole("row")

    expect(within(rows[1]).getByText("Event Gamma")).toBeInTheDocument()

    await user.click(sortButton)

    const rowsAsc = within(table).getAllByRole("row")
    expect(within(rowsAsc[1]).getByText("Event Alpha")).toBeInTheDocument()
  })

  it("shows empty state when there are no events", () => {
    render(<DataTable events={[]} />)

    expect(screen.getByText("No events match the current filter.")).toBeInTheDocument()
  })

  it("exports the full list to an Excel file", async () => {
    const user = userEvent.setup()
    render(<DataTable events={sampleEvents} />)

    const exportButton = screen.getByRole("button", { name: /Export list/i })
    await user.click(exportButton)

    await waitFor(() => {
      expect(saveAsMock).toHaveBeenCalledTimes(1)
    })

    expect(addRowMock).toHaveBeenCalledTimes(sampleEvents.length)
    expect(getRowMock).toHaveBeenCalled()
    expect(getColumnMock).toHaveBeenCalled()
    expect(writeBufferMock).toHaveBeenCalled()
  })
})

const chartEvents: OrgEvent[] = [
  {
    id: "chart-1",
    name: "Momentum Event",
    description: null,
    location: null,
    status: 1,
    startTime: new Date(Date.UTC(2025, 8, 26, 9, 0)),
    endTime: new Date(Date.UTC(2025, 8, 26, 11, 0)),
    remark: null,
    joiningParticipants: 10,
    groups: [],
    taskStatus: { total: 2, completed: 1, remaining: 1 },
  },
]

describe("ChartAreaInteractive", () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2025, 9, 3, 0, 0, 0)))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it("renders chart data and allows narrowing the date range", () => {
    render(<ChartAreaInteractive events={chartEvents} />)

    expect(screen.getByTestId("chart-container")).toBeInTheDocument()

    const fromInput = screen.getByLabelText(/^From$/i) as HTMLInputElement
    expect(fromInput.value).toMatch(/\d{4}-\d{2}-\d{2}/)

    fireEvent.change(fromInput, { target: { value: "2025-10-05" } })

    expect(screen.getByText("No events in this time range.")).toBeInTheDocument()
  })

  it("focuses the input when date picker button is pressed", async () => {
    render(<ChartAreaInteractive events={chartEvents} />)

    const focusSpy = vi.spyOn(HTMLInputElement.prototype, "focus")
    const calendarButton = screen.getByRole("button", { name: /select from date/i })

    fireEvent.click(calendarButton)

    expect(focusSpy).toHaveBeenCalled()
    focusSpy.mockRestore()
  })
})
