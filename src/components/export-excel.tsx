import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Skeleton } from "@/components/ui/skeleton";
import Swal from "sweetalert2";

// Generic type: array of records
export function exportToExcel<T extends Record<string, any>>(
  jsonData: T[],
  fileName: string = "data"
): void {
  if (!jsonData || jsonData.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Step 1: Convert JSON to worksheet
  const worksheet = XLSX.utils.json_to_sheet(jsonData);

  // Step 2: Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Step 3: Generate Excel buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // Step 4: Format datetime for filename
  const date = new Date();
  const formattedDate = `${date.getFullYear()}${String(
    date.getMonth() + 1
  ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const formattedTime = `${String(date.getHours()).padStart(2, "0")}${String(
    date.getMinutes()
  ).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}`;
  const formattedFileName = `${formattedDate}-${formattedTime}-${fileName}.xlsx`;

  // Step 5: Save to file
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(data, formattedFileName);
}

// Props for the ExportExcel component
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
          onClick={() => {
            if (!jsonData || jsonData.length === 0) {
              Swal.fire({
                icon: "info",
                title: "No records",
                text: "There is no record to be exported.",
                confirmButtonText: "OK",
              });
              return;
            }
            exportToExcel(jsonData, fileName);
          }}
        >
          {label}
        </button>
      )}
    </div>
  );
}
