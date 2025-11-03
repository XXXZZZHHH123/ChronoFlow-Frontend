import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import { AttachmentsField } from "./AttachmentField";
import { updateEventTask } from "@/api/eventTasksApi";
import { type AllowAction } from "@/services/eventTask";
import type { BaseActionSchemaType } from "@/lib/validation/schema";
import { baseActionSchema } from "@/lib/validation/schema";

type TaskActionNoteModalProps = {
  eventId: string | number;
  taskId: string | number;
  /** Which action to perform on submit */
  action: AllowAction;
  /** The task name (BE requires name to be present) */
  initialName: string;
  /** Show file upload (ASSIGN/BLOCK/SUBMIT/UPDATE, etc.) */
  showFiles?: boolean;
  /** Button label if you don't pass a custom trigger */
  triggerLabel?: string;
  /** Optional custom trigger node */
  trigger?: React.ReactNode;
  /** Called after success to refresh lists */
  onRefresh: () => void;
  /** Optional dialog title/description overrides */
  title?: string;
  description?: string;
};

export default function TaskActionNoteModal({
  eventId,
  taskId,
  action,
  initialName,
  showFiles = false,
  triggerLabel = "Proceed",
  trigger,
  onRefresh,
  title,
  description,
}: TaskActionNoteModalProps) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<BaseActionSchemaType>({
    resolver: zodResolver(baseActionSchema),
    defaultValues: { remark: "", files: undefined },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateEventTask(eventId, taskId, {
        name: initialName,
        type: action,
        remark: values.remark?.trim() || undefined,
        files: showFiles ? values.files : undefined,
      });

      reset();
      setOpen(false);
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Action applied successfully.",
      });
      onRefresh();
    } catch (err: unknown) {
      setOpen(false);
      await Swal.fire({
        icon: "error",
        title: "Action failed",
        text:
          err instanceof Error
            ? err.message
            : "Operation failed. Please try again.",
      });
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset({ remark: "", files: undefined });
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">{triggerLabel}</Button>}
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{title ?? "Add Remark"}</DialogTitle>
          <DialogDescription>
            {description ?? "Optionally add a remark. Upload files if needed."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[85dvh] overflow-y-auto px-6 pb-6">
          <FormProvider {...form}>
            <form onSubmit={onSubmit} className="grid gap-5" noValidate>
              {/* Remark */}
              <div className="grid gap-2">
                <Label htmlFor="remark">Remark</Label>
                <Textarea
                  id="remark"
                  placeholder="Type any note/remark for this action…"
                  rows={3}
                  {...form.register("remark")}
                />
                <p className="h-5 text-sm text-destructive">&nbsp;</p>
              </div>

              {/* Files (conditionally shown) */}
              {showFiles && (
                <AttachmentsField
                  control={form.control}
                  name={"files"}
                  helperText="Attach supporting files (documents, images, PDFs)."
                />
              )}

              <Button
                type="submit"
                className="h-11 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Applying…" : "Apply"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
