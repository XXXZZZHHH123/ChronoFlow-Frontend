import { useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import Swal from "sweetalert2";

import {
  eventTaskCreateConfigSchema,
  type EventTaskCreateConfig,
} from "@/lib/validation/schema";
import { createEventTask } from "@/api/eventTasksApi";
import { DateTimePicker } from "@/components/ui/date-time-picker";

type AssigneeOption = { id: string; label: string };

type TaskConfigFormProps = {
  eventId: string;
  onRefresh: () => void;
  assigneeOptions: AssigneeOption[];
};

export default function TaskConfigFormModal({
  eventId,
  onRefresh,
  assigneeOptions,
}: TaskConfigFormProps) {
  const [open, setOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);

  const form = useForm<EventTaskCreateConfig>({
    resolver: zodResolver(eventTaskCreateConfigSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      startTime: undefined,
      endTime: undefined,
      targetUserId: undefined,
      files: undefined,
    },
  });

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = form;

  useEffect(() => {
    if (!open) return;
    reset({
      id: undefined,
      name: "",
      description: "",
      startTime: undefined,
      endTime: undefined,
      targetUserId: undefined,
      files: undefined,
    });
  }, [open, reset]);

  const assigneeIdToLabel = useMemo(
    () => new Map(assigneeOptions.map((o) => [o.id, o.label] as const)),
    [assigneeOptions]
  );

  const selectedTargetUserId = watch("targetUserId");
  const selectedAssigneeLabel =
    selectedTargetUserId != null
      ? assigneeIdToLabel.get(String(selectedTargetUserId)) ?? ""
      : "";

  const onSubmit = handleSubmit(async (values: EventTaskCreateConfig) => {
    try {
      await createEventTask(eventId, values);
      reset();
      setOpen(false);
      await Swal.fire({
        icon: "success",
        title: "Task created",
        text: "The task has been created successfully.",
      });
      onRefresh();
    } catch (err: unknown) {
      setOpen(false);
      await Swal.fire({
        icon: "error",
        title: "Creation failed",
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
        <Button>Create task</Button>
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Create a new task with details, schedule and assignee.
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
                  placeholder="Event registration setup"
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
                <Label>Start time (optional)</Label>
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
                <Label>End time (optional)</Label>
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

              {/* Assignee (targetUserId) */}
              <div className="grid gap-2">
                <Label>Assignee</Label>
                <Controller
                  name="targetUserId"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Popover
                        open={assigneeOpen}
                        onOpenChange={setAssigneeOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-between",
                              field.value == null && "text-muted-foreground"
                            )}
                            disabled={assigneeOptions.length === 0}
                          >
                            {selectedAssigneeLabel ||
                              (assigneeOptions.length === 0
                                ? "No members available"
                                : "Select assignee…")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                          <Command>
                            <CommandInput placeholder="Search members…" />
                            <CommandList>
                              <CommandEmpty>No members found.</CommandEmpty>
                              <CommandGroup>
                                {assigneeOptions.map((opt) => (
                                  <CommandItem
                                    key={opt.id}
                                    value={opt.label}
                                    onSelect={() => {
                                      const num = Number(opt.id);
                                      field.onChange(
                                        Number.isFinite(num) ? num : undefined
                                      );
                                      setAssigneeOpen(false);
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
                {selectedTargetUserId != null && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() =>
                        setValue("targetUserId", "", { shouldValidate: true })
                      }
                    >
                      Clear assignee
                    </Button>
                  </div>
                )}
              </div>

              {/* Files */}
              <div className="grid gap-2">
                <Label htmlFor="files">Attachments (optional)</Label>
                <Controller
                  name="files"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input
                        id="files"
                        type="file"
                        multiple
                        onChange={(e) => {
                          const fl = e.target.files;
                          field.onChange(
                            fl && fl.length > 0 ? Array.from(fl) : undefined
                          );
                        }}
                      />
                      <p className="h-5 text-sm text-muted-foreground">
                        Accepted: any file type supported by your backend
                      </p>
                    </>
                  )}
                />
              </div>

              <Button
                type="submit"
                className={cn("h-11 w-full")}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating…" : "Create task"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
