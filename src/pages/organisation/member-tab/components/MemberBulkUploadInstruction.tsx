import { Info } from "lucide-react";
import type { RoleOption } from "@/services/role";

type BulkUploadInstructionsProps = {
  roleOptions: RoleOption[];
};

export function BulkUploadInstructions({
  roleOptions,
}: BulkUploadInstructionsProps) {
  const uniqueKeys = Array.from(new Set(roleOptions.map((o) => o.label)));
  const exampleKeys = uniqueKeys.slice(0, 2).join(", ");

  return (
    <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
      <div className="mb-2 flex items-center gap-2 font-medium text-amber-800">
        <Info className="h-4 w-4" />
        Template requirements
      </div>

      <ul className="list-disc space-y-1 pl-5 text-amber-900">
        <li>
          Columns: <span className="font-mono">email</span>,{" "}
          <span className="font-mono">roleKeys</span> (separate multiple with
          commas), <span className="font-mono">remark</span>.
        </li>
        <li>
          Role keys must be typed in <strong>ALL CAPITAL LETTERS</strong>
          (for example: <span className="font-mono">MEMBER</span>,{" "}
          <span className="font-mono">ORGANIZER</span>).
        </li>
        <li>
          Eligible role keys:&nbsp;
          <span className="font-mono">
            {uniqueKeys.length > 0 ? uniqueKeys.join(", ") : "—"}
          </span>
        </li>
        <li>Accepted file types: .xlsx / .xls</li>
      </ul>

      {/* Example table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border text-xs bg-white">
          <thead>
            <tr className="bg-muted">
              <th className="border px-2 py-1 text-left font-medium">email</th>
              <th className="border px-2 py-1 text-left font-medium">
                roleKeys
              </th>
              <th className="border px-2 py-1 text-left font-medium">remark</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1 font-mono">user@acme.com</td>
              <td className="border px-2 py-1 font-mono">{exampleKeys}</td>
              <td className="border px-2 py-1">
                Assign {exampleKeys.toLowerCase()}{" "}
                {uniqueKeys.length > 1 ? "roles" : "role"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
