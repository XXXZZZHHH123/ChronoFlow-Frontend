import { describe, expect, it, vi } from "vitest";
import { cn, exportToExcel, getDropDownValues, unwrap } from "../utils";

const excelMocks = vi.hoisted(() => {
  const addRow = vi.fn();
  const getRow = vi.fn(() => ({ font: {} }));
  const writeBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));
  return { addRow, getRow, writeBuffer };
}) as {
  addRow: ReturnType<typeof vi.fn>;
  getRow: ReturnType<typeof vi.fn>;
  writeBuffer: ReturnType<typeof vi.fn>;
};

vi.mock("exceljs", () => ({
  default: {
    Workbook: class {
      worksheet = {
        addRow: excelMocks.addRow,
        getRow: excelMocks.getRow,
      };
      addWorksheet() {
        return this.worksheet;
      }
      xlsx = {
        writeBuffer: excelMocks.writeBuffer,
      };
    },
  },
}));

const fileSaverMocks = vi.hoisted(() => ({
  saveAs: vi.fn(),
})) as {
  saveAs: ReturnType<typeof vi.fn>;
};

vi.mock("file-saver", () => fileSaverMocks);

const addRowMock = excelMocks.addRow;
const getRowMock = excelMocks.getRow;
const writeBufferMock = excelMocks.writeBuffer;
const saveAsMock = fileSaverMocks.saveAs;

describe("utils cn", () => {
  it("merges class names intelligently", () => {
    const shouldHide = false;
    expect(cn("btn", shouldHide && "hidden", "primary")).toBe("btn primary");
  });
});

describe("utils unwrap", () => {
  it("returns data when response code is zero", () => {
    const data = { id: 1 };
    expect(unwrap({ code: 0, data })).toEqual(data);
  });

  it("throws error when response code is non-zero", () => {
    expect(() =>
      unwrap({ code: 1, msg: "Failed" })
    ).toThrowError("Failed");
  });
});

describe("utils getDropDownValues", () => {
  it("creates unique sorted list of values", () => {
    const values = getDropDownValues(
      [
        { role: "Admin" },
        { role: "Member" },
        { role: "Admin" },
        { role: null },
      ],
      "role"
    );

    expect(values).toEqual([
      { value: "Admin", label: "Admin" },
      { value: "Member", label: "Member" },
    ]);
  });
});

describe("utils exportToExcel", () => {
  it("returns early when no data provided", async () => {
    await exportToExcel([], "empty");

    expect(addRowMock).not.toHaveBeenCalled();
    expect(saveAsMock).not.toHaveBeenCalled();
  });

  it("writes data rows and triggers download", async () => {
    addRowMock.mockClear();
    getRowMock.mockClear();
    writeBufferMock.mockClear();
    saveAsMock.mockClear();

    const rows = [
      { id: 1, name: "Alpha" },
      { id: 2, name: "Beta" },
    ];

    await exportToExcel(rows, "report");

    expect(addRowMock).toHaveBeenCalledTimes(3); // header + 2 rows
    expect(writeBufferMock).toHaveBeenCalled();
    expect(saveAsMock).toHaveBeenCalled();
  });
});
