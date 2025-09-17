import { Skeleton } from "@/components/ui/skeleton";
import { exportToExcel } from "@/lib/utils";
import Swal from "sweetalert2";

interface ExportExcelProps<T extends Record<string, unknown>> {
  jsonData: T[];
  fileName?: string;
  loading?: boolean;
  label?: string;
}

export function ExportExcel<T extends Record<string, unknown>>({
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
              await Swal.fire({
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
