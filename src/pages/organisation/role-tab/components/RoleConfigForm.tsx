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
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  roleConfigSchema,
  type RoleConfig,
  type Role,
  type Permission,
} from "@/lib/validation/schema";
import { createRole, updateRole } from "@/api/roleApi";
import Swal from "sweetalert2";
import { ALL_PERMISSION_ID } from "@/services/role";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type RoleConfigFormProps = {
  role?: Role;
  onRefresh: () => void;
  permissionOptions: Permission[];
};

export default function RoleConfigFormModal({
  role,
  onRefresh,
  permissionOptions,
}: RoleConfigFormProps) {
  const [open, setOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const isEdit = !!role;

  const form = useForm<RoleConfig>({
    resolver: zodResolver(roleConfigSchema),
    defaultValues: { name: "", key: "", permissions: null },
  });

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = form;

  useEffect(() => {
    if (!open) return;
    if (isEdit && role) {
      reset({
        name: role.name,
        key: role.key,
        permissions: role.permissions?.map((p) => p.id) ?? null,
      });
    } else {
      reset({ name: "", key: "", permissions: null });
    }
  }, [open, isEdit, role, reset]);

  const permIdToLabel = useMemo(
    () => new Map(permissionOptions.map((p) => [p.id, p.name])),
    [permissionOptions]
  );

  const onSubmit = handleSubmit(async (values: RoleConfig) => {
    try {
      let title = "";
      let text = "";

      if (isEdit && role) {
        await updateRole(role.id, values);
        title = "Role updated";
        text = "The role details have been updated successfully.";
      } else {
        await createRole(values);
        title = "Role created";
        text = "The role has been created successfully.";
      }

      reset({ name: "", key: "", permissions: null });
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
        if (!v) reset({ name: "", key: "", permissions: null });
      }}
    >
      <DialogTrigger asChild>
        <Button>{isEdit ? "Edit role" : "Create role"}</Button>
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{isEdit ? "Edit Role" : "Create Role"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the role’s name, key, or permissions."
              : "Define a new role with an uppercase key and assign permissions."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[85dvh] overflow-y-auto px-6 pb-6">
          <FormProvider {...form}>
            <form onSubmit={onSubmit} noValidate className="grid gap-5">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  placeholder="Manager"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.name?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Key */}
              <div className="grid gap-2">
                <div className="mb-1 flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" aria-label="What is Role Key?">
                          <Info className="h-4 w-4 text-yellow-600" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        The role key is the unique identifier for the role
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Label htmlFor="key">Role Key</Label>
                </div>

                <Input
                  id="key"
                  placeholder="MANAGER"
                  {...register("key")}
                  aria-invalid={!!errors.key}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.key?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Permissions */}
              <div className="grid gap-4">
                <Label>Permissions</Label>
                <Controller
                  name="permissions"
                  control={control}
                  render={({ field }) => {
                    const current = (watch("permissions") ?? []) as string[];
                    const selected = new Set(current);
                    const allSelected = selected.has(ALL_PERMISSION_ID);

                    const labels = current
                      .map((id) => permIdToLabel.get(id))
                      .filter(Boolean) as string[];

                    const toggle = (id: string, nextChecked?: boolean) => {
                      // Handle the ALL permission toggle so it can be turned on/off
                      if (id === ALL_PERMISSION_ID) {
                        if (selected.has(ALL_PERMISSION_ID)) {
                          // deselect ALL
                          field.onChange([]);
                        } else {
                          // select ONLY ALL
                          field.onChange([ALL_PERMISSION_ID]);
                        }
                        return;
                      }

                      // If ALL is selected, ignore toggling others
                      if (allSelected) return;

                      const next = new Set(current);
                      const shouldAdd =
                        nextChecked !== undefined ? nextChecked : !next.has(id);

                      if (shouldAdd) next.add(id);
                      else next.delete(id);

                      // If selecting “some” (any non-ALL), ensure ALL is not present
                      next.delete(ALL_PERMISSION_ID);

                      field.onChange(Array.from(next));
                    };

                    return (
                      <>
                        <Popover open={permOpen} onOpenChange={setPermOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full !h-auto min-h-10 py-2 px-3 justify-start items-start text-left"
                              disabled={permissionOptions.length === 0}
                            >
                              <div className="w-full flex flex-wrap gap-2 whitespace-normal break-words">
                                {labels.length ? (
                                  labels.map((lbl) => (
                                    <Badge
                                      key={lbl}
                                      variant="secondary"
                                      className="px-2 py-0.5 shrink-0"
                                    >
                                      {lbl}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground">
                                    {permissionOptions.length === 0
                                      ? "No permissions available"
                                      : "Select permissions…"}
                                  </span>
                                )}
                              </div>
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                            <Command>
                              <CommandInput placeholder="Search permissions…" />
                              <CommandList>
                                <CommandEmpty>
                                  No permissions found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {permissionOptions.map((opt) => {
                                    const isAll = opt.id === ALL_PERMISSION_ID;
                                    const checked = selected.has(opt.id);

                                    const disableThis = allSelected
                                      ? !isAll
                                      : isAll && selected.size > 0;

                                    return (
                                      <CommandItem
                                        key={opt.id}
                                        value={opt.name}
                                        onSelect={() =>
                                          !disableThis && toggle(opt.id)
                                        }
                                        className={cn(
                                          "cursor-pointer",
                                          disableThis &&
                                            "opacity-50 pointer-events-none"
                                        )}
                                      >
                                        <Checkbox
                                          checked={checked}
                                          className="mr-2"
                                          aria-disabled={disableThis}
                                          onCheckedChange={(v) =>
                                            !disableThis &&
                                            toggle(opt.id, Boolean(v))
                                          }
                                        />
                                        {opt.name}
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <p className="h-5 text-sm text-destructive">
                          {errors.permissions?.message ?? "\u00A0"}
                        </p>
                      </>
                    );
                  }}
                />
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
                  : "Create role"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
