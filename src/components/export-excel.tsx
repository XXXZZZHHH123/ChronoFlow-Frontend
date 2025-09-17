import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Skeleton } from "@/components/ui/skeleton";
import Swal from "sweetalert2";

// Generic type: array of records
export async function exportToExcel<T extends Record<string, any>>(
  jsonData: T[],
  fileName: string = "data"
): Promise<void> {
  if (!jsonData || jsonData.length === 0) {
    console.warn("No data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  const headers = Object.keys(jsonData[0]);
  worksheet.addRow(headers);

  jsonData.forEach((item) => {
    worksheet.addRow(Object.values(item));
  });

  worksheet.getRow(1).font = { bold: true };

  const excelBuffer = await workbook.xlsx.writeBuffer();

  const date = new Date();
  const formattedDate = `${date.getFullYear()}${String(
    date.getMonth() + 1
  ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const formattedTime = `${String(date.getHours()).padStart(2, "0")}${String(
    date.getMinutes()
  ).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}`;
  const formattedFileName = `${formattedDate}-${formattedTime}-${fileName}.xlsx`;

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, formattedFileName);
}

interface ExportExcelProps<T extends Record<string, any>> {
  jsonData: T[];
  fileName?: string;
  loading?: boolean;
  label?: string;
}

export function ExportExcel<T extends Record<string, any>>({
  jsonData,
  fileName = "data",
  loading = false,
  label = "Export to Excel",
}: ExportExcelProps<T>) {
  return (
    <div>
      {loading ? (
        <Skeleton className="h-10 w-32" />
      ) : (
        <button
          className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-3 px-6"
          onClick={async () => {
            if (!jsonData || jsonData.length === 0) {
              Swal.fire({
                icon: "info",
                title: "No records",
                text: "There is no record to be exported.",
                confirmButtonText: "OK",
              });
              return;
            }
            await exportToExcel(jsonData, fileName);
          }}
        >
          {label}
        </button>
      )}
    </div>
  );
}
