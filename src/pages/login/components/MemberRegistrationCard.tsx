import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Swal from "sweetalert2";
import { registerMember } from "@/api/registrationApi";
import {
  memberCompleteRegistrationSchema,
  type MemberCompleteRegistration,
  type MemberPrefill,
} from "@/lib/validation/schema";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Prefill = { user_id: string } & MemberPrefill;

type MemberRegistrationCardProps = {
  onBack: () => void;
  fromInviteLink?: boolean;
  prefill: Prefill;
};

const ErrorText = ({ msg }: { msg?: string }) => (
  <p className="mt-2 min-h-[28px] text-sm leading-5 text-destructive">
    {msg ?? "\u00A0"}
  </p>
);

function RequiredLabel(props: React.ComponentProps<typeof Label>) {
  const { children, className, ...rest } = props;
  return (
    <Label
      className={`mb-2 inline-flex items-center gap-1 ${className ?? ""}`}
      {...rest}
    >
      <span>{children}</span>
      <span aria-hidden className="text-destructive">
        *
      </span>
    </Label>
  );
}

export function MemberRegistrationCard({
  onBack,
  prefill,
  fromInviteLink,
}: MemberRegistrationCardProps) {
  const [showPwd, setShowPwd] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MemberCompleteRegistration>({
    resolver: zodResolver(memberCompleteRegistrationSchema),
    defaultValues: {
      user_id: prefill.user_id,
      user_name: "",
      user_password: "",
      user_mobile: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerMember(values);
      await Swal.fire({
        icon: "success",
        title: "Registration complete",
        text: "Your member account has been created.",
        confirmButtonText: "OK",
      });
      reset();
      onBack();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";

      await Swal.fire({
        icon: "error",
        title: "Registration failed",
        text: msg,
        confirmButtonText: "OK",
      });
    }
  });

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Member Registration</CardTitle>
        <div className="mt-1 flex items-center justify-between">
          <CardDescription className="text-left">
            Review your invite and set your credentials.
          </CardDescription>
          <button
            type="button"
            onClick={onBack}
            className="text-sm underline underline-offset-4"
          >
            {fromInviteLink ? "Go to sign in" : "Back to sign in"}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={onSubmit}
          noValidate
          className="grid grid-cols-1 gap-x-6 gap-y-7 md:grid-cols-2"
        >
          {/* Read-only invite info */}
          <div className="flex flex-col">
            <Label className="mb-2" htmlFor="org_name_ro">
              Organization Name
            </Label>
            <Input
              id="org_name_ro"
              value={prefill.organization_name}
              readOnly
              className="h-10 cursor-default bg-muted"
            />
          </div>

          <div className="flex flex-col">
            <Label className="mb-2" htmlFor="email_ro">
              Email
            </Label>
            <Input
              id="email_ro"
              value={prefill.email}
              readOnly
              className="h-10 cursor-default bg-muted"
            />
          </div>

          {/* Hidden ID */}
          <input type="hidden" {...register("user_id")} />

          {/* Username (required) */}
          <div className="flex flex-col">
            <RequiredLabel htmlFor="user_name">Username</RequiredLabel>
            <Input
              id="user_name"
              className="h-10"
              aria-required
              placeholder="At least 6 characters"
              {...register("user_name")}
              aria-invalid={!!errors.user_name}
            />
            <ErrorText msg={errors.user_name?.message} />
          </div>

          {/* Password (required) */}
          <div className="flex flex-col">
            <RequiredLabel htmlFor="user_password">Password</RequiredLabel>
            <div className="relative">
              <Input
                id="user_password"
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                aria-required
                placeholder="At least 8 characters"
                {...register("user_password")}
                aria-invalid={!!errors.user_password}
                className="pr-10"
              />
              <button
                type="button"
                aria-label={showPwd ? "Hide password" : "Show password"}
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
              >
                {showPwd ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <ErrorText msg={errors.user_password?.message} />
          </div>

          {/* Mobile (required) */}
          <div className="flex flex-col md:col-span-1">
            <RequiredLabel htmlFor="user_mobile">Mobile</RequiredLabel>
            <Input
              id="user_mobile"
              className="h-10"
              aria-required
              placeholder="Singapore mobile no"
              {...register("user_mobile")}
              aria-invalid={!!errors.user_mobile}
            />
            <ErrorText msg={errors.user_mobile?.message} />
          </div>

          {/* spacer to balance grid */}
          <div className="md:col-span-1" />

          {/* Required note */}
          <div className="md:col-span-2 -mt-4">
            <p className="text-sm text-muted-foreground">
              <span className="text-destructive">*</span> Required fields
            </p>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-center">
            <Button
              type="submit"
              className="h-11 w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create member account"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
