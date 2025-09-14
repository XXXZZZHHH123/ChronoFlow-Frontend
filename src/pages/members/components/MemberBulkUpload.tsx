import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Loader2, Download, Info } from "lucide-react";
import { uploadMembersExcel } from "@/api/memberApi";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type BulkMemberUploadSheetProps = {
  onRefresh: () => void;
};

export default function BulkMemberUploadSheet({
  onRefresh,
}: BulkMemberUploadSheetProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [result, setResult] = useState<null | Awaited<
    ReturnType<typeof uploadMembersExcel>
  >>(null);
  const [err, setErr] = useState<string | null>(null);

  const onDownloadTemplate = () => {
    window.open("/templates/members_bulk_template.xlsx", "_blank");
  };

  async function onSubmit() {
    if (!file) return;
    setSubmitting(true);
    setErr(null);
    setResult(null);

    try {
      const res = await uploadMembersExcel(file);
      setResult(res);
      setResultDialogOpen(true);
      onRefresh();
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
      setResultDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary">Bulk upload</Button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-2xl w-full overflow-auto">
        <SheetTitle>Bulk upload members</SheetTitle>
        <SheetDescription className="mt-1">
          Download the template, fill it, then upload.
        </SheetDescription>

        {/* Instructions */}
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
          <div className="mb-2 flex items-center gap-2 font-medium text-amber-800">
            <Info className="h-4 w-4" />
            Template requirements
          </div>

          <ul className="list-disc space-y-1 pl-5 text-amber-900">
            <li>
              Columns: <span className="font-mono">email</span>,{" "}
              <span className="font-mono">roleIds</span> (comma-separated
              numbers), <span className="font-mono">remark</span>.
            </li>
            <li>
              Role ID mapping: <span className="font-mono">2 = ORGANIZER</span>,{" "}
              <span className="font-mono">3 = MANAGER</span>,{" "}
              <span className="font-mono">4 = STAFF</span>.
            </li>
            <li>Accepted file types: .xlsx / .xls</li>
          </ul>

          {/* Example table */}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border text-xs bg-white">
              <thead>
                <tr className="bg-muted">
                  <th className="border px-2 py-1 text-left font-medium">
                    email
                  </th>
                  <th className="border px-2 py-1 text-left font-medium">
                    roleIds
                  </th>
                  <th className="border px-2 py-1 text-left font-medium">
                    remark
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1 font-mono">user@acme.com</td>
                  <td className="border px-2 py-1 font-mono">3,4</td>
                  <td className="border px-2 py-1">Assign Manager & Staff</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1 font-mono">admin@acme.com</td>
                  <td className="border px-2 py-1 font-mono">2</td>
                  <td className="border px-2 py-1">Organizer role only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <Button
            type="button"
            variant="outline"
            onClick={onDownloadTemplate}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download template
          </Button>

          <div className="space-y-2">
            <label className="text-sm font-medium">Excel file</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-accent hover:file:text-accent-foreground"
            />
          </div>

          <div className="flex gap-2">
            <Button
              disabled={!file || submitting}
              onClick={onSubmit}
              className="gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Uploading…" : "Upload"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setFile(null);
                setResult(null);
                setErr(null);
              }}
            >
              Close
            </Button>
          </div>

          <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                {err ? (
                  <>
                    <DialogTitle>Upload failed</DialogTitle>
                    <DialogDescription>
                      Something went wrong while uploading your file.
                    </DialogDescription>
                  </>
                ) : (
                  <>
                    {/* derive title */}
                    <DialogTitle>
                      {result &&
                      (result.failedCount ?? result.failures?.length ?? 0) > 0
                        ? "Completed with issues"
                        : "Bulk upload complete"}
                    </DialogTitle>
                    <DialogDescription>
                      Here is the summary of your upload.
                    </DialogDescription>
                  </>
                )}
              </DialogHeader>

              {!err && result && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Stat label="Total rows" value={result.totalRows} />
                    <Stat label="Created" value={result.createdCount} />
                    <Stat label="Updated" value={result.updatedCount} />
                    <Stat
                      label="Failed"
                      value={result.failedCount}
                      highlight={(result.failedCount ?? 0) > 0}
                    />
                  </div>

                  {(result.failures?.length ?? 0) > 0 && (
                    <div className="rounded-md border p-3 text-sm">
                      <p className="mb-2 font-medium text-amber-700">
                        Failures
                      </p>
                      <ul className="space-y-1">
                        {result.failures!.map((f, i) => (
                          <li
                            key={`${f.rowIndex}-${i}`}
                            className="rounded bg-muted px-2 py-1"
                          >
                            <span className="font-mono">Row {f.rowIndex}</span>{" "}
                            — {f.email} —{" "}
                            <span className="text-destructive">{f.reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {err && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {err}
                </div>
              )}

              <DialogFooter>
                <Button onClick={() => setResultDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md border px-3 py-2",
        highlight && "border-amber-500/40 bg-amber-500/10"
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
