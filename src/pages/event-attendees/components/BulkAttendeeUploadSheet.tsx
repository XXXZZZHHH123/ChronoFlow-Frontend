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
import { uploadAttendeesExcel } from "@/api/attendeeApi";
import Swal from "sweetalert2";
import { BulkUploadAttendeeInstructions } from "./BulkUploadAttendeeInstruction";

type BulkAttendeeUploadSheetProps = {
  eventId: string | number;
  onRefresh: () => void | Promise<void>;
};

export default function BulkAttendeeUploadSheet({
  eventId,
  onRefresh,
}: BulkAttendeeUploadSheetProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onDownloadTemplate = () => {
    window.open("/templates/attendees_bulk_template.xlsx", "_blank");
  };

  async function onSubmit() {
    if (!file) return;
    setSubmitting(true);

    try {
      await uploadAttendeesExcel(file, eventId);
      setOpen(false);
      setFile(null);

      await Swal.fire({
        icon: "success",
        title: "Bulk upload complete",
        text: "Attendees uploaded and QR codes generated.",
        confirmButtonText: "OK",
      });

      await onRefresh?.();
    } catch (err: unknown) {
      setOpen(false);
      await Swal.fire({
        icon: "error",
        title: "Upload failed",
        text:
          err instanceof Error
            ? err.message
            : "Operation failed. Please try again.",
      });
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
        <SheetTitle>Bulk upload attendees</SheetTitle>
        <SheetDescription className="mt-1">
          Download the template, fill it, then upload.
        </SheetDescription>

        <BulkUploadAttendeeInstructions />

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
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
