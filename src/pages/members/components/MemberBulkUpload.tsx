import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Loader2, Download } from "lucide-react";
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
import type { RoleOption } from "@/services/role";
import { BulkUploadInstructions } from "./MemberBulkUploadInstruction";

type BulkMemberUploadSheetProps = {
  onRefresh: () => void;
  roleOptions: RoleOption[];
};

export default function BulkMemberUploadSheet({
  onRefresh,
  roleOptions,
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setErr(msg);
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

        <BulkUploadInstructions roleOptions={roleOptions} />

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

          <Dialog
            open={resultDialogOpen}
            onOpenChange={(open) => {
              setResultDialogOpen(open);
              if (!open) {
                onRefresh();
                setResult(null);
                setErr(null);
              }
            }}
          >
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
                <Button
                  onClick={() => {
                    setResultDialogOpen(false);
                    onRefresh();
                    setResult(null);
                    setErr(null);
                  }}
                >
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
