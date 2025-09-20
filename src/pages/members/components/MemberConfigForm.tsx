import { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { useMemo } from "react";
import type { RoleOption } from "@/services/role";

type MemberConfigFormProps = {
  member?: Member;
  onRefresh: () => void;
  rolesOptions: RoleOption[];
};

export default function MemberConfigFormSheet({
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
    if (isEdit && member) {
      form.reset({
        email: member.email,
        roleIds: member.roles ?? [],
        remark: "",
      });
    } else {
      form.reset({ email: "", roleIds: [], remark: "" });
    }
  }, [isEdit, member, open, form]);

  const onSubmit = handleSubmit(async (values: MemberConfig) => {
    try {
      if (isEdit && member) {
        await updateMember(member.id, values);
        await Swal.fire({
          icon: "success",
          title: "Member updated",
          text: "The member details have been updated successfully.",
          confirmButtonText: "OK",
        });
      } else {
        await createMember(values);
        await Swal.fire({
          icon: "success",
          title: "Member created",
          text: "The member has been created successfully.",
          confirmButtonText: "OK",
        });
      }

      reset({ email: "", roleIds: [], remark: "" });
      setOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Operation failed. Please try again.";
      await Swal.fire({
        icon: "error",
        title: isEdit ? "Update failed" : "Creation failed",
        text: msg,
        confirmButtonText: "OK",
      });
    }
  });

  const roleIdToLabel = useMemo(
    () => new Map(rolesOptions.map((o) => [o.id, o.label] as const)),
    [rolesOptions]
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset({ email: "", roleIds: [], remark: "" });
      }}
    >
      <SheetTrigger asChild>
        <Button>{isEdit ? "Edit member" : "Create member"}</Button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-md w-full overflow-auto">
        <SheetTitle>{isEdit ? "Edit Member" : "Create Member"}</SheetTitle>
        <SheetDescription className="mt-1">
          {isEdit
            ? "Update the member’s email, roles, or remark."
            : "Add a single member by email and assign roles."}
        </SheetDescription>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate className="mt-5 grid gap-5">
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
              <p className="h-5 text-sm leading-5 text-destructive">
                {errors.email?.message ?? "\u00A0"}
              </p>
            </div>

            {/* Roles (multi-select) */}
            <div className="grid gap-2">
              <Label>Roles</Label>
              <Controller
                name="roleIds"
                control={control}
                render={({ field }) => {
                  const selected = new Set(field.value ?? []);
                  const selectedLabels = (field.value ?? [])
                    .map((id) => roleIdToLabel.get(id))
                    .filter(Boolean) as string[];

                  return (
                    <>
                      <Popover open={rolesOpen} onOpenChange={setRolesOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="justify-between w-full"
                            disabled={rolesOptions.length === 0}
                          >
                            {selectedLabels.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {selectedLabels.map((lbl) => (
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
                                  return (
                                    <CommandItem
                                      key={opt.id}
                                      value={opt.label}
                                      onSelect={() => {
                                        const next = new Set(field.value ?? []);
                                        if (checked) next.delete(opt.id);
                                        else next.add(opt.id);
                                        field.onChange(Array.from(next));
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Checkbox
                                        checked={checked}
                                        className="mr-2"
                                        onCheckedChange={() => {
                                          const next = new Set(
                                            field.value ?? []
                                          );
                                          if (checked) next.delete(opt.id);
                                          else next.add(opt.id);
                                          field.onChange(Array.from(next));
                                        }}
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

                      <p className="h-5 text-sm leading-5 text-destructive">
                        {errors.roleIds?.message ?? "\u00A0"}
                      </p>
                    </>
                  );
                }}
              />
            </div>

            {/* Remark (optional) */}
            <div className="grid gap-2">
              <Label htmlFor="remark">Remark (optional)</Label>
              <Input
                id="remark"
                placeholder="e.g. Invited by Alice"
                {...register("remark")}
              />
              <p className="h-5 text-sm leading-5 text-destructive">
                {errors.remark?.message ?? "\u00A0"}
              </p>
            </div>

            <div className="flex justify-center">
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
            </div>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
