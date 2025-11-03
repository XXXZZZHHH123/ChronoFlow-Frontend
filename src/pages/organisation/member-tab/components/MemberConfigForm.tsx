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
  MemberConfigSchema,
  type MemberConfig,
  type Member,
} from "@/lib/validation/schema";
import { createMember, updateMember } from "@/api/memberApi";
import Swal from "sweetalert2";
import type { RoleOption } from "@/services/role";

type MemberConfigFormProps = {
  member?: Member;
  onRefresh: () => void;
  rolesOptions: RoleOption[];
};

export default function MemberConfigFormModal({
  member,
  onRefresh,
  rolesOptions,
}: MemberConfigFormProps) {
  const [open, setOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const isEdit = !!member;

  const form = useForm<MemberConfig>({
    resolver: zodResolver(MemberConfigSchema),
    defaultValues: { email: "", roleIds: [], remark: "" },
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
    if (isEdit && member) {
      reset({ email: member.email, roleIds: member.roles ?? [], remark: "" });
    } else {
      reset({ email: "", roleIds: [], remark: "" });
    }
  }, [open, isEdit, member, reset]);

  const roleIdToLabel = useMemo(
    () => new Map(rolesOptions.map((o) => [o.id, o.label] as const)),
    [rolesOptions]
  );

  const onSubmit = handleSubmit(async (values: MemberConfig) => {
    try {
      let title = "";
      let text = "";

      if (isEdit && member) {
        await updateMember(member.id, values);
        title = "Member updated";
        text = "The member details have been updated successfully.";
      } else {
        await createMember(values);
        title = "Member created";
        text = "The member has been created successfully.";
      }

      reset({ email: "", roleIds: [], remark: "" });
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
        if (!v) reset({ email: "", roleIds: [], remark: "" });
      }}
    >
      <DialogTrigger asChild>
        <Button>{isEdit ? "Edit member" : "Create member"}</Button>
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{isEdit ? "Edit Member" : "Create Member"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the member’s email, roles, or remark."
              : "Add a single member by email and assign roles."}
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
                  type="email"
                  placeholder="user@acme.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                <p className="h-5 text-sm text-destructive">
                  {errors.email?.message ?? "\u00A0"}
                </p>
              </div>

              {/* Roles */}
              <div className="grid gap-2">
                <Label>Roles</Label>
                <Controller
                  name="roleIds"
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
                              className="w-full justify-between"
                              disabled={rolesOptions.length === 0}
                            >
                              {labels.length ? (
                                <div className="flex flex-wrap gap-1">
                                  {labels.map((lbl) => (
                                    <Badge
                                      key={lbl}
                                      variant="secondary"
                                      className="px-2 py-0.5"
                                    >
                                      {lbl}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  {rolesOptions.length === 0
                                    ? "No roles available"
                                    : "Select roles…"}
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                            <Command>
                              <CommandInput placeholder="Search roles…" />
                              <CommandList>
                                <CommandEmpty>No roles found.</CommandEmpty>
                                <CommandGroup>
                                  {rolesOptions.map((opt) => {
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
                          {errors.roleIds?.message ?? "\u00A0"}
                        </p>
                      </>
                    );
                  }}
                />
              </div>

              {/* Remark */}
              <div className="grid gap-2">
                <Label htmlFor="remark">Remark (optional)</Label>
                <Input
                  id="remark"
                  placeholder="e.g. Invited by Alice"
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
                  : "Create member"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
