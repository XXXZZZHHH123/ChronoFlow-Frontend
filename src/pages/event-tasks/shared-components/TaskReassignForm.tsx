import * as React from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import Swal from "sweetalert2";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { updateEventTask } from "@/api/eventTasksApi";
import { TaskActionEnum, type AssigneeOption } from "@/services/eventTask";
import { AttachmentsField } from "./AttachmentField";
import { reAssignSchema, type ReAssignFormType } from "@/lib/validation/schema";

type InitialValues = {
  /** current assignee id (used to filter + guard) */
  targetUserId?: string | null;
  /** task title (BE requires name) */
  taskName?: string | null;
  /** prefill remark */
  remark?: string | null;
};

type TaskReassignModalProps = {
  eventId: string | number;
  taskId: string | number;
  onRefresh: () => void;
  options: AssigneeOption[];
  initial?: InitialValues;
  triggerLabel?: string;
  trigger?: React.ReactNode;
};

export default function TaskReassignModal({
  eventId,
  taskId,
  onRefresh,
  options,
  initial,
  triggerLabel = "Reassign",
  trigger,
}: TaskReassignModalProps) {
  const [open, setOpen] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  // current assignee (if any)
  const currentAssigneeId = initial?.targetUserId ?? "";

  // remove current assignee from the list
  const filteredOptions = React.useMemo(
    () => options.filter((o) => o.id !== currentAssigneeId),
    [options, currentAssigneeId]
  );

  const form = useForm<ReAssignFormType>({
    resolver: zodResolver(reAssignSchema),
    defaultValues: {
      targetUserId: "",               // do NOT preselect the current assignee
      remark: initial?.remark ?? "",
      files: undefined,
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    register,
    setValue,
  } = form;

  // Reset to latest props when the dialog opens
  React.useEffect(() => {
    if (!open) return;
    reset({
      targetUserId: "",               // keep empty when opening
      remark: initial?.remark ?? "",
      files: undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.remark]);

  const selectedId = watch("targetUserId");
  const selectedLabel = selectedId
    ? filteredOptions.find((o) => o.id === selectedId)?.label ?? ""
    : "";

  const onSubmit = handleSubmit(async (values) => {
    setOpen(false);
    // Defense-in-depth: prevent reassigning to the same person
    if (values.targetUserId === currentAssigneeId) {
      await Swal.fire({
        icon: "error",
        title: "No change made",
        text: "This task is already assigned to that member. Please choose someone else.",
      });
      return;
    }

    try {
      await updateEventTask(eventId, taskId, {
        name: initial?.taskName ?? "",
        type: TaskActionEnum.ASSIGN,
        targetUserId: values.targetUserId,
        remark: values.remark?.trim() || undefined,
        files: values.files && values.files.length ? values.files : undefined,
      });

      reset({ targetUserId: "", remark: "", files: undefined });
      setOpen(false);

      await Swal.fire({
        icon: "success",
        title: "Assignee updated",
        text: "The task has been reassigned successfully.",
      });
      onRefresh();
    } catch (err: unknown) {
      setOpen(false);
      await Swal.fire({
        icon: "error",
        title: "Reassign failed",
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
        if (!v) {
          reset({ targetUserId: "", remark: initial?.remark ?? "", files: undefined });
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">{triggerLabel}</Button>}
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Reassign Task</DialogTitle>
          <DialogDescription>
            Choose a new assignee, optionally add a remark, and attach files if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[85dvh] overflow-y-auto px-6 pb-6">
          <FormProvider {...form}>
            <form onSubmit={onSubmit} className="grid gap-5" noValidate>
              {/* Assignee */}
              <div className="grid gap-2">
                <Label>Assignee</Label>
                <Controller
                  name="targetUserId"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={filteredOptions.length === 0 || isSubmitting}
                          >
                            {selectedLabel ||
                              (filteredOptions.length === 0
                                ? "No other members available"
                                : "Select assignee…")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                          <Command>
                            <CommandInput placeholder="Search members…" />
                            <CommandList>
                              <CommandEmpty>No members found.</CommandEmpty>
                              <CommandGroup>
                                {filteredOptions.map((opt) => (
                                  <CommandItem
                                    key={opt.id}
                                    value={opt.label}
                                    onSelect={() => {
                                      setValue("targetUserId", opt.id, { shouldValidate: true });
                                      setPickerOpen(false);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {opt.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <p className="h-5 text-sm text-destructive">
                        {errors.targetUserId?.message ?? "\u00A0"}
                      </p>
                    </>
                  )}
                />
              </div>

              {/* Remark */}
              <div className="grid gap-2">
                <Label htmlFor="remark">Remark</Label>
                <Textarea
                  id="remark"
                  placeholder="Type any note/remark for this action…"
                  rows={3}
                  {...register("remark")}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.remark?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Attachments */}
              <AttachmentsField
                control={form.control}
                name={"files"}
                helperText="Attach supporting files (documents, images, PDFs)."
              />

              <Button
                type="submit"
                className="h-11 w-full"
                disabled={isSubmitting || !selectedId}
              >
                {isSubmitting ? "Reassigning…" : "Confirm Reassign"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}