import { useEffect, useState } from "react";
import { FormProvider, Controller, useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import {
  eventTaskConfigSchema,
  type EventTaskConfig,
} from "@/lib/validation/schema";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { AttachmentsField } from "./AttachmentField";
import { updateEventTask } from "@/api/eventTasksApi";
import { TaskActionEnum } from "@/services/eventTask";

type InitialValues = {
  name?: string | null;
  description?: string | null;
  startTime?: Date | undefined;
  endTime?: Date | undefined;
  remark?: string | null;
};

type TaskConfigUpdateFormProps = {
  eventId: string | number;
  taskId: string | number;
  onRefresh: () => void;
  triggerLabel?: string;
  initial: InitialValues;
};

export default function TaskConfigUpdateFormModal({
  eventId,
  taskId,
  onRefresh,
  triggerLabel = "Update task",
  initial,
}: TaskConfigUpdateFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<EventTaskConfig>({
    resolver: zodResolver(eventTaskConfigSchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      startTime: initial?.startTime,
      endTime: initial?.endTime,
      files: undefined,
      remark: initial?.remark ?? null,
    },
  });

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  useEffect(() => {
    if (!open) return;
    reset({
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      startTime: initial?.startTime,
      endTime: initial?.endTime,
      files: undefined,
      remark: initial?.remark ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const onSubmit = handleSubmit(async (values: EventTaskConfig) => {
    try {
      const payload: EventTaskConfig = {
        ...values,
        type: TaskActionEnum.UPDATE,
      };

      await updateEventTask(eventId, taskId, payload);
      reset();
      setOpen(false);

      await Swal.fire({
        icon: "success",
        title: "Task updated",
        text: "The task has been updated successfully.",
      });
      onRefresh();
    } catch (err: unknown) {
      setOpen(false);
      await Swal.fire({
        icon: "error",
        title: "Update failed",
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
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Update Task</DialogTitle>
          <DialogDescription>
            Adjust details, schedule, and attachments.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[85dvh] overflow-y-auto px-6 pb-6">
          <FormProvider {...form}>
            <form onSubmit={onSubmit} noValidate className="grid gap-5">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Task name</Label>
                <Input
                  id="name"
                  placeholder="Task title"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.name?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the task details…"
                  rows={3}
                  {...register("description")}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.description?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Start Time */}
              <div className="grid gap-2">
                <Label>Start time</Label>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <>
                      <DateTimePicker
                        date={field.value ?? undefined}
                        setDateTime={(d) => field.onChange(d ?? undefined)}
                      />
                      <p className="h-5 text-sm text-destructive">
                        {errors.startTime?.message ?? "\u00A0"}
                      </p>
                    </>
                  )}
                />
              </div>

              {/* End Time */}
              <div className="grid gap-2">
                <Label>End time</Label>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <>
                      <DateTimePicker
                        date={field.value ?? undefined}
                        setDateTime={(d) => field.onChange(d ?? undefined)}
                      />
                      <p className="h-5 text-sm text-destructive">
                        {errors.endTime?.message ?? "\u00A0"}
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

              {/* Files */}
              <AttachmentsField
                control={control}
                name={"files"}
                helperText="Accepted: common file types such as documents, images, and PDFs."
              />

              <Button
                type="submit"
                className="h-11 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving…" : "Apply changes"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
