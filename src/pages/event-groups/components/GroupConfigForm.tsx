// src/pages/event-groups/components/GroupConfigForm.tsx
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateGroupConfigSchema,
  GroupConfigSchema,
  type CreateGroupConfig,
  type GroupConfig,
  type Group,
} from "@/lib/validation/schema";
import {
  createGroup,
  updateGroup,
  getGroupMembers,
  addMembersToGroup,
} from "@/api/groupApi";
import { useMembers } from "@/hooks/members/userMember";
import Swal from "sweetalert2";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  group?: Group;
  onRefresh: () => void;
  eventId?: string;
  triggerLabel?: string;
};

export default function GroupConfigFormModal({
  group,
  onRefresh,
  eventId,
  triggerLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const isEdit = !!group;

  const { members: allMembers, loading: membersLoading } = useMembers(open);

  const form = useForm({
    resolver: zodResolver(isEdit ? GroupConfigSchema : CreateGroupConfigSchema),
    defaultValues: isEdit
      ? {
          name: "",
          leadUserId: null,
          remark: null,
          sort: 0,
          status: 0,
        }
      : {
          name: "",
          eventId: eventId || "",
          leadUserId: "",
          remark: null,
          sort: 0,
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
    if (isEdit && group) {
      reset({
        name: group.name,
        leadUserId: group.leadUserId,
        remark: group.remark,
        sort: group.sort,
        status: group.status,
      });
    } else {
      reset({
        name: "",
        eventId: eventId || "",
        leadUserId: "",
        remark: null,
        sort: 0,
      });
    }
  }, [open, isEdit, group, eventId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      let title = "";
      let text = "";

      if (isEdit && group) {
        // Update group
        await updateGroup(group.id, values as GroupConfig);

        // If leadUserId changed, ensure the new leader is a member
        if (values.leadUserId && values.leadUserId !== group.leadUserId) {
          // Check if new leader is already a member
          const members = await getGroupMembers(group.id);
          const isMember = members.some((m) => m.userId === values.leadUserId);

          if (!isMember) {
            // Add new leader to the group
            await addMembersToGroup(group.id, [values.leadUserId]);
          }
        }

        title = "Group updated";
        text = "The group has been updated successfully.";
      } else {
        await createGroup(values as CreateGroupConfig);
        title = "Group created";
        text = "The group has been created successfully.";
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
        <Button>{triggerLabel ?? (isEdit ? "Edit" : "Create group")}</Button>
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{isEdit ? "Edit Group" : "Create Group"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the group's details."
              : "Create a new group for this event."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[85dvh] overflow-y-auto px-6 pb-6">
          <FormProvider {...form}>
            <form onSubmit={onSubmit} noValidate className="grid gap-5">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Group name"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.name?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Lead User - Show for both create and edit */}
              <div className="grid gap-2">
                <Label htmlFor="leadUserId">Lead User {!isEdit && "*"}</Label>
                <Controller
                  name="leadUserId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={membersLoading}
                    >
                      <SelectTrigger
                        id="leadUserId"
                        className={cn(
                          errors.leadUserId && "border-destructive"
                        )}
                      >
                        <SelectValue
                          placeholder={
                            membersLoading
                              ? "Loading members..."
                              : "Select a lead user"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {allMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} ({member.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.leadUserId?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Sort */}
              <div className="grid gap-2">
                <Label htmlFor="sort">Sort Order</Label>
                <Controller
                  name="sort"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="sort"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 0 : Math.max(0, value));
                      }}
                      value={field.value}
                    />
                  )}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.sort?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Remark */}
              <div className="grid gap-2">
                <Label htmlFor="remark">Remark</Label>
                <Textarea
                  id="remark"
                  placeholder="Optional notes"
                  {...register("remark")}
                  rows={3}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.remark?.message ?? "\u00A0"}
                </p>
              </div>

              <Button
                type="submit"
                className={cn("h-11 w-full")}
                disabled={isSubmitting || membersLoading}
              >
                {isEdit
                  ? isSubmitting
                    ? "Saving…"
                    : "Save changes"
                  : isSubmitting
                  ? "Creating…"
                  : "Create group"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
