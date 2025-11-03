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
import Swal from "sweetalert2";

import {
  permissionConfigSchema,
  type PermissionConfig,
  type Permission,
} from "@/lib/validation/schema";
import { createPermission, updatePermission } from "@/api/permissionApi";

type PermissionConfigFormProps = {
  permission?: Permission;
  onRefresh: () => void | Promise<void>;
};

export default function PermissionConfigFormModal({
  permission,
  onRefresh,
}: PermissionConfigFormProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!permission;

  const form = useForm<PermissionConfig>({
    resolver: zodResolver(permissionConfigSchema),
    defaultValues: { name: "", key: "", description: "" },
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  useEffect(() => {
    if (!open) return;
    if (isEdit && permission) {
      reset({
        name: permission.name ?? "",
        key: permission.key ?? "",
        description: permission.description ?? "",
      });
    } else {
      reset({ name: "", key: "", description: "" });
    }
  }, [open, isEdit, permission, reset]);

  const onSubmit = handleSubmit(async (values: PermissionConfig) => {
    try {
      let title = "";
      let text = "";

      if (isEdit && permission) {
        await updatePermission(permission.id, values);
        title = "Permission updated";
        text = "The permission has been updated successfully.";
      } else {
        await createPermission(values);
        title = "Permission created";
        text = "The permission has been created successfully.";
      }

      reset({ name: "", key: "", description: "" });
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
        if (!v) reset({ name: "", key: "", description: "" });
      }}
    >
      <DialogTrigger asChild>
        <Button>{isEdit ? "Edit permission" : "Create permission"}</Button>
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            {isEdit ? "Edit Permission" : "Create Permission"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the permission’s name, key, or description."
              : "Define a new permission with a unique key and optional description."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[85dvh] overflow-y-auto px-6 pb-6">
          <FormProvider {...form}>
            <form onSubmit={onSubmit} noValidate className="grid gap-5">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="perm-name">Permission Name</Label>
                <Input
                  id="perm-name"
                  placeholder="e.g. Manage Task"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.name?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Key */}
              <div className="grid gap-2">
                <Label htmlFor="perm-key">Permission Key</Label>
                <Input
                  id="perm-key"
                  placeholder="e.g. task.manage"
                  className="font-mono"
                  {...register("key")}
                  aria-invalid={!!errors.key}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.key?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Description (optional) */}
              <div className="grid gap-2">
                <Label htmlFor="perm-desc">Description (optional)</Label>
                <Input
                  id="perm-desc"
                  placeholder="e.g. Ability to create, update, and delete tasks"
                  {...register("description")}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.description?.message ?? "\u00A0"}
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
                  : "Create permission"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
