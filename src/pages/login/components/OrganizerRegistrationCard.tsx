import { useForm, type DefaultValues } from "react-hook-form";
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
import {
  organizerRegistrationSchema,
  type OrganizerRegistration,
} from "@/lib/validation/schema";
import { registerOrganizer } from "@/api/registrationApi";

type OrganizerRegistrationFormProps = {
  onBack: () => void;
};

const defaultValues: DefaultValues<OrganizerRegistration> = {
  name: "",
  user_name: "",
  user_password: "",
  user_email: "",
  user_mobile: "",
  organisation_name: "",
  organisation_address: "",
};

export function OrganizerRegistrationCard({
  onBack,
}: OrganizerRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrganizerRegistration>({
    resolver: zodResolver(organizerRegistrationSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerOrganizer(values);

      await Swal.fire({
        icon: "success",
        title: "Registration successful",
        text: "Organizer & organisation have been created.",
        confirmButtonText: "OK",
      });
      reset();
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
        <CardTitle className="text-2xl">Organizer Registration</CardTitle>
        <div className="mt-1 flex items-center justify-between">
          <CardDescription className="text-left">
            Create your organizer account and organisation details.
          </CardDescription>
          <button
            type="button"
            onClick={onBack}
            className="text-sm underline underline-offset-4"
          >
            Back to sign in
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={onSubmit}
          noValidate
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {/* Name */}
          <div className="grid gap-2 md:col-span-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            <p className="h-5 text-sm leading-5 text-destructive">
              {errors.name?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Username */}
          <div className="grid gap-2 md:col-span-1">
            <Label htmlFor="user_name">Username</Label>
            <Input
              id="user_name"
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
              {...register("user_password")}
              aria-invalid={!!errors.user_password}
            />
            <p className="h-5 text-sm leading-5 text-destructive">
              {errors.user_password?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Email */}
          <div className="grid gap-2 md:col-span-1">
            <Label htmlFor="user_email">Email</Label>
            <Input
              id="user_email"
              type="email"
              autoComplete="email"
              {...register("user_email")}
              aria-invalid={!!errors.user_email}
            />
            <p className="h-5 text-sm leading-5 text-destructive">
              {errors.user_email?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Mobile */}
          <div className="grid gap-2 md:col-span-1">
            <Label htmlFor="user_mobile">Mobile</Label>
            <Input
              id="user_mobile"
              {...register("user_mobile")}
              aria-invalid={!!errors.user_mobile}
            />
            <p className="h-5 text-sm leading-5 text-destructive">
              {errors.user_mobile?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Organisation name (required) */}
          <div className="grid gap-2 md:col-span-1">
            <Label htmlFor="organisation_name">Organisation name</Label>
            <Input
              id="organisation_name"
              {...register("organisation_name")}
              aria-invalid={!!errors.organisation_name}
            />
            <p className="h-5 text-sm leading-5 text-destructive">
              {errors.organisation_name?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Organisation address (optional, full width) */}
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="organisation_address">Organisation address</Label>
            <Input
              id="organisation_address"
              placeholder="(optional)"
              {...register("organisation_address")}
              aria-invalid={!!errors.organisation_address}
            />
            <p className="h-5 text-sm leading-5 text-destructive">
              {errors.organisation_address?.message ?? "\u00A0"}
            </p>
          </div>

          {/* spacer to balance grid */}
          <div className="md:col-span-1" />

          <div className="md:col-span-2 flex justify-center">
            <Button
              type="submit"
              className="h-11 w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create organizer & organisation"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
