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
import { cn } from "@/lib/utils";
import {
  EventConfigSchema,
  type EventConfig,
  type OrgEvent,
} from "@/lib/validation/schema";
import { createEvent, updateEvent } from "@/api/eventApi";
import Swal from "sweetalert2";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  event?: OrgEvent;
  onRefresh: () => void;
  triggerLabel?: string;
};

export default function EventConfigFormModal({
  event,
  onRefresh,
  triggerLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const isEdit = !!event;

  const form = useForm<EventConfig>({
    resolver: zodResolver(EventConfigSchema),
    defaultValues: {
      name: "",
      description: null,
      location: undefined,
      startTime: undefined,
      endTime: undefined,
      remark: null,
    },
  });

  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) return;
    if (isEdit && event) {
      reset({
        name: event.name,
        description: event.description ?? null,
        location: event.location ?? undefined,
        startTime:
          typeof event.startTime === "string"
            ? new Date(event.startTime)
            : event.startTime,
        endTime:
          typeof event.endTime === "string"
            ? new Date(event.endTime)
            : event.endTime ?? undefined,
        remark: event.remark ?? null,
      });
    } else {
      reset({
        name: "",
        description: null,
        location: undefined,
        startTime: undefined,
        endTime: undefined,
        remark: null,
      });
    }
  }, [open, isEdit, event, reset]);

  const onSubmit = handleSubmit(async (values: EventConfig) => {
    try {
      let title = "";
      let text = "";

      if (isEdit && event) {
        await updateEvent(event.id, values);
        title = "Event updated";
        text = "The event has been updated successfully.";
      } else {
        await createEvent(values);
        title = "Event created";
        text = "The event has been created successfully.";
      }

      reset();
      setOpen(false);

      await Swal.fire({ icon: "success", title, text });

      onRefresh();
    } catch (err: unknown) {
      setOpen(false);
      await Swal.fire({
        icon: "error",
        title: isEdit ? "Update failed" : "Creation failed",
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
        <Button>
          {triggerLabel ?? (isEdit ? "Edit event" : "Create event")}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{isEdit ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the event’s details."
              : "Create a new event with name, time, and details."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[85dvh] overflow-y-auto px-6 pb-6">
          <FormProvider {...form}>
            <form onSubmit={onSubmit} noValidate className="grid gap-5">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Event name"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.name?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Event description"
                  {...register("description")}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.description?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Location */}
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Venue"
                  {...register("location")}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.location?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Start Time */}
              <div className="grid gap-2">
                <Label>Start time</Label>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      date={field.value ?? undefined}
                      setDateTime={(d) => field.onChange(d ?? null)}
                    />
                  )}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.startTime?.message ?? "\u00A0"}
                </p>
              </div>

              {/* End Time */}
              <div className="grid gap-2">
                <Label>End time</Label>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      date={field.value ?? undefined}
                      setDateTime={(d) => field.onChange(d ?? null)}
                    />
                  )}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.endTime?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Remark */}
              <div className="grid gap-2">
                <Label htmlFor="remark">Remark (optional)</Label>
                <Input
                  id="remark"
                  placeholder="e.g. Internal note"
                  {...register("remark")}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.remark?.message ?? "\u00A0"}
                </p>
              </div>

              <Button
                type="submit"
                className={cn("h-11 w-full")}
                disabled={isSubmitting}
              >
                {isEdit
                  ? isSubmitting
                    ? "Saving…"
                    : "Save changes"
                  : isSubmitting
                  ? "Creating…"
                  : "Create event"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
