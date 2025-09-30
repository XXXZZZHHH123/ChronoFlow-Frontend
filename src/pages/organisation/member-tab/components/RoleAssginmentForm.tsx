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
import { roleAssignSchema, type RoleAssign } from "@/lib/validation/schema";
import { assignRole } from "@/api/roleApi";
import Swal from "sweetalert2";
import type { RoleOption } from "@/services/role";

type RoleAssignFormProps = {
  userId: string;
  roleOptions: RoleOption[];
  currentRoles?: string[];
  onRefresh: () => void;
};

export default function RoleAssignFormModal({
  userId,
  roleOptions,
  currentRoles = [],
  onRefresh,
}: RoleAssignFormProps) {
  const [open, setOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);

  const form = useForm<RoleAssign>({
    resolver: zodResolver(roleAssignSchema),
    defaultValues: { userId, roles: [] },
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  // Reset when opened
  useEffect(() => {
    if (!open) return;
    reset({ userId, roles: currentRoles });
  }, [open, userId, currentRoles, reset]);

  const roleIdToLabel = useMemo(
    () => new Map(roleOptions.map((r) => [r.id, r.label] as const)),
    [roleOptions]
  );

  const onSubmit = handleSubmit(async (values: RoleAssign) => {
    try {
      await assignRole(values);
      reset({ userId, roles: [] });
      setOpen(false);
      await Swal.fire({
        icon: "success",
        title: "Roles reassigned",
        text: "The user’s roles have been updated.",
      });
      onRefresh();
    } catch (err: unknown) {
      setOpen(false);
      await Swal.fire({
        icon: "error",
        title: "Reassignment failed",
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
        if (!v) reset({ userId, roles: [] });
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Reassign Roles
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Reassign Roles</DialogTitle>
          <DialogDescription>
            Select the new set of roles for this user.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[85dvh] overflow-y-auto px-6 pb-6">
          <FormProvider {...form}>
            <form onSubmit={onSubmit} noValidate className="grid gap-5">
              <div className="grid gap-2">
                <Label>Roles</Label>
                <Controller
                  name="roles"
                  control={control}
                  render={({ field }) => {
                    const selected = new Set(field.value ?? []);
                    const labels = (field.value ?? [])
                      .map((id) => roleIdToLabel.get(id))
                      .filter(Boolean) as string[];

                    return (
                      <>
                        <Popover open={rolesOpen} onOpenChange={setRolesOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full !h-auto min-h-10 py-2 px-3 justify-start items-start text-left"
                              disabled={roleOptions.length === 0}
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
                                    {roleOptions.length === 0
                                      ? "No roles available"
                                      : "Select roles…"}
                                  </span>
                                )}
                              </div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                            <Command>
                              <CommandInput placeholder="Search roles…" />
                              <CommandList>
                                <CommandEmpty>No roles found.</CommandEmpty>
                                <CommandGroup>
                                  {roleOptions.map((opt) => {
                                    const checked = selected.has(opt.id);

                                    const toggle = (nextChecked?: boolean) => {
                                      const next = new Set(field.value ?? []);
                                      const shouldAdd = nextChecked ?? !checked;

                                      if (shouldAdd) {
                                        next.add(opt.id);
                                      } else {
                                        next.delete(opt.id);
                                      }

                                      field.onChange(Array.from(next));
                                    };

                                    return (
                                      <CommandItem
                                        key={opt.id}
                                        value={opt.label}
                                        onSelect={() => toggle()}
                                        className="cursor-pointer"
                                      >
                                        <Checkbox
                                          checked={checked}
                                          className="mr-2"
                                          onCheckedChange={(v) =>
                                            toggle(Boolean(v))
                                          }
                                        />
                                        {opt.label}
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <p className="h-5 text-sm text-destructive">
                          {errors.roles?.message ?? "\u00A0"}
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
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
