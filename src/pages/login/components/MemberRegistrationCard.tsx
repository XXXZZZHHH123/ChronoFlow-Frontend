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

type Prefill = {
  user_id: string;
} & MemberPrefill;

type MemberRegistrationCardProps = {
  onBack: () => void;
  fromInviteLink?: boolean;
  prefill: Prefill;
};

export function MemberRegistrationCard({
  onBack,
  prefill,
  fromInviteLink,
}: MemberRegistrationCardProps) {
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
    } catch (err: any) {
      const msg = err?.message ?? "Registration failed. Please try again.";
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
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {/* Read-only invite info */}
          <div className="grid gap-2 md:col-span-1">
            <Label>Organization Name</Label>
            <Input
              value={prefill.organisation_name}
              readOnly
              className="h-10 bg-muted cursor-default"
            />
            <p className="h-5 text-sm leading-5">&nbsp;</p>
          </div>

          <div className="grid gap-2 md:col-span-1">
            <Label>Email</Label>
            <Input
              value={prefill.email}
              readOnly
              className="h-10 bg-muted cursor-default"
            />
            <p className="h-5 text-sm leading-5">&nbsp;</p>
          </div>

          {/* Hidden IDs for submission */}
          <input type="hidden" {...register("user_id")} />

          {/* Username */}
          <div className="grid gap-2 md:col-span-1">
            <Label htmlFor="user_name">Username</Label>
            <Input
              id="user_name"
              className="h-10"
              {...register("user_name")}
              aria-invalid={!!errors.user_name}
            />
            <p className="h-5 text-sm leading-5 text-destructive">
              {errors.user_name?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Password */}
          <div className="grid gap-2 md:col-span-1">
            <Label htmlFor="user_password">Password</Label>
            <Input
              id="user_password"
              type="password"
              autoComplete="new-password"
              className="h-10"
              {...register("user_password")}
              aria-invalid={!!errors.user_password}
            />
            <p className="h-5 text-sm leading-5 text-destructive">
              {errors.user_password?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Mobile */}
          <div className="grid gap-2 md:col-span-1">
            <Label htmlFor="user_mobile">Mobile</Label>
            <Input
              id="user_mobile"
              className="h-10"
              {...register("user_mobile")}
              aria-invalid={!!errors.user_mobile}
            />
            <p className="h-5 text-sm leading-5 text-destructive">
              {errors.user_mobile?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Empty cell to keep grid balanced on md+ */}
          <div className="md:col-span-1" />

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
