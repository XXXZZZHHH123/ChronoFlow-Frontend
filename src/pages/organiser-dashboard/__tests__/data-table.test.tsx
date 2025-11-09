import { render, screen, within, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "../components/data-table"
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

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn() as unknown as typeof Element.prototype.scrollIntoView
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

const paginatedEvents: OrgEvent[] = Array.from({ length: 8 }, (_, idx) => {
  const baseDate = new Date(2025, 7, 1 + idx, 9, 0)
  return {
    id: `bulk-${idx + 1}`,
    name: `Bulk Event ${idx + 1}`,
    description: `Bulk description ${idx + 1}`,
    location: `Room ${idx + 1}`,
    status: (idx % 3) as OrgEvent["status"],
    startTime: baseDate,
    endTime: new Date(baseDate.getTime() + 60 * 60 * 1000),
    remark: null,
    joiningParticipants: idx * 5,
    groups: [],
    taskStatus: { total: 4, remaining: idx % 2, completed: 4 - (idx % 2) },
  }
})

describe("DataTable", () => {
  it("renders events overview with chronological order by default and years in dates", () => {
    render(<DataTable events={sampleEvents} />)

    expect(screen.getByText("Events Overview")).toBeInTheDocument()

    const table = screen.getByRole("table")
    const rows = within(table).getAllByRole("row")

    expect(within(rows[1]).getByText("Event Alpha")).toBeInTheDocument()
    expect(within(rows[2]).getByText("Event Beta")).toBeInTheDocument()
    expect(within(rows[1]).getByText(/2025/)).toBeInTheDocument()
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

  it("filters events by status via the status select", async () => {
    const user = userEvent.setup()
    render(<DataTable events={sampleEvents} />)

    const [statusSelect] = screen.getAllByRole("combobox")
    await user.click(statusSelect)

    const activeOption = await screen.findByRole("option", { name: "Active" })
    await user.click(activeOption)

    expect(screen.queryByText("Event Beta")).not.toBeInTheDocument()
    expect(screen.getByText("Event Alpha")).toBeInTheDocument()
    expect(screen.getByText("Event Gamma")).toBeInTheDocument()
  })

  it("supports pagination controls across multiple pages", async () => {
    const user = userEvent.setup()
    render(<DataTable events={paginatedEvents} />)

    expect(screen.getByText("Rows per page")).toBeInTheDocument()

    const nextButton = screen.getByRole("button", { name: "›" })
    await user.click(nextButton)

    const table = screen.getByRole("table")
    const rowsPage2 = within(table).getAllByRole("row")
    expect(within(rowsPage2[1]).getByText("Bulk Event 7")).toBeInTheDocument()

    const lastButton = screen.getByRole("button", { name: "»" })
    await user.click(lastButton)
    expect(nextButton).toBeDisabled()

    const prevButton = screen.getByRole("button", { name: "‹" })
    await user.click(prevButton)
    expect(nextButton).not.toBeDisabled()

    const firstButton = screen.getByRole("button", { name: "«" })
    await user.click(firstButton)
    expect(prevButton).toBeDisabled()
  })

  it("highlights the soonest upcoming event", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 8, 24, 9, 0))

    try {
      const events: OrgEvent[] = [
        {
          id: "past",
          name: "Past Event",
          description: null,
          location: null,
          status: 1,
          startTime: new Date(2025, 6, 1, 9, 0),
          endTime: new Date(2025, 6, 1, 11, 0),
          remark: null,
          joiningParticipants: 5,
          groups: [],
          taskStatus: { total: 2, remaining: 0, completed: 2 },
        },
        {
          id: "future",
          name: "Future Event",
          description: null,
          location: null,
          status: 1,
          startTime: new Date(2025, 9, 1, 9, 0),
          endTime: new Date(2025, 9, 1, 11, 0),
          remark: null,
          joiningParticipants: 5,
          groups: [],
          taskStatus: { total: 2, remaining: 1, completed: 1 },
        },
      ]

      render(<DataTable events={events} />)

      const highlightedRow = screen.getByText("Future Event").closest("tr")
      const pastRow = screen.getByText("Past Event").closest("tr")

      expect(highlightedRow).toHaveClass("bg-primary/5")
      expect(pastRow).not.toHaveClass("bg-primary/5")
    } finally {
      vi.useRealTimers()
    }
  })
})
