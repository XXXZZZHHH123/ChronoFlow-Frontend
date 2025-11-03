import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
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
  IndiAttendeeConfigSchema,
  type IndiAttendeeConfig,
  type Attendee,
} from "@/lib/validation/schema";
import { createIndividualAttendee, updateAttendee } from "@/api/attendeeApi";
import Swal from "sweetalert2";

type Props = {
  eventId: string | number;
  attendee?: Attendee;
  onRefresh: () => void | Promise<void>;
};

export default function AttendeeConfigFormModal({
  eventId,
  attendee,
  onRefresh,
}: Props) {
  const [open, setOpen] = useState(false);
  const isEdit = !!attendee;

  const form = useForm<IndiAttendeeConfig>({
    resolver: zodResolver(IndiAttendeeConfigSchema),
    defaultValues: { email: "", name: "", mobile: "" },
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) return;
    if (isEdit && attendee) {
      reset({
        email: attendee.attendeeEmail,
        name: attendee.attendeeName,
        mobile: attendee.attendeeMobile,
      });
    } else {
      reset({ email: "", name: "", mobile: "" });
    }
  }, [open, isEdit, attendee, reset]);

  const onSubmit = handleSubmit(async (values: IndiAttendeeConfig) => {
    try {
      let title = "";
      let text = "";

      if (isEdit && attendee) {
        await updateAttendee(attendee.id, values);
        title = "Attendee updated";
        text = `${values.name} has been updated successfully.`;
      } else {
        await createIndividualAttendee(values, eventId);
        title = "Attendee added";
        text = `${values.name} has been added successfully.`;
      }

      reset();
      setOpen(false);
      await Swal.fire({ icon: "success", title, text });
      await onRefresh();
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
        <Button>{isEdit ? "Edit attendee" : "Add attendee"}</Button>
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{isEdit ? "Edit Attendee" : "Add Attendee"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the attendee’s details."
              : "Create a single attendee for this event."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[85dvh] overflow-y-auto px-6 pb-6">
          <FormProvider {...form}>
            <form onSubmit={onSubmit} noValidate className="grid gap-5">
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="alice@example.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.email?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Alice Tan"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.name?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Mobile */}
              <div className="grid gap-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  placeholder="91234567"
                  {...register("mobile")}
                  aria-invalid={!!errors.mobile}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.mobile?.message ?? "\u00A0"}
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
                  : "Add attendee"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
