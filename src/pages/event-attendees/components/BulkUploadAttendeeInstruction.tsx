import { Info } from "lucide-react";

type BulkUploadAttendeeInstructionsProps = {
  extraColumns?: string[];
};

export function BulkUploadAttendeeInstructions({
  extraColumns = [],
}: BulkUploadAttendeeInstructionsProps) {
  const requiredCols = ["email", "name", "mobile"];
  const allCols = [...requiredCols, ...extraColumns];

  return (
    <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
      <div className="mb-2 flex items-center gap-2 font-medium text-amber-800">
        <Info className="h-4 w-4" />
        Template requirements
      </div>

      <ul className="list-disc space-y-1 pl-5 text-amber-900">
        <li>
          Columns (in any order):{" "}
          <span className="font-mono">{allCols.join(", ")}</span>.
        </li>
        <li>
          <span className="font-mono">email</span> must be a valid email
          address.
        </li>
        <li>
          <span className="font-mono">name</span> is required and must not be
          empty.
        </li>
        <li>
          <span className="font-mono">mobile</span> required. Singapore mobile
          number: starts with 8 or 9, 8 digits .
        </li>
        <li>
          Remove header duplicates and ensure each row has a unique{" "}
          <span className="font-mono">email</span>.
        </li>
        <li>Accepted file types: .xlsx / .xls</li>
      </ul>

      {/* Example table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border text-xs bg-white">
          <thead>
            <tr className="bg-muted">
              {allCols.map((c) => (
                <th key={c} className="border px-2 py-1 text-left font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1 font-mono">alice@example.com</td>
              <td className="border px-2 py-1">Alice Tan</td>
              <td className="border px-2 py-1 font-mono">91234567</td>
              {extraColumns.includes("remark") && (
                <td className="border px-2 py-1">VIP guest</td>
              )}
            </tr>
            <tr>
              <td className="border px-2 py-1 font-mono">bob@example.com</td>
              <td className="border px-2 py-1">Bob Lim</td>
              <td className="border px-2 py-1 font-mono">98765432</td>
              {extraColumns.includes("remark") && (
                <td className="border px-2 py-1">Wheelchair access</td>
              )}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-amber-800">
        Notes:
        <ul className="list-disc pl-5 space-y-1">
          <li>
            We’ll validate each row using the same rules as the single-attendee
            form.
          </li>
        </ul>
      </div>
    </div>
  );
}
