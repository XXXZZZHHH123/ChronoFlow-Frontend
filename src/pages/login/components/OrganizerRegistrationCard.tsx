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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";

type OrganizerRegistrationFormProps = {
  onBack: () => void;
};

const defaultValues: DefaultValues<OrganizerRegistration> = {
  name: "",
  username: "",
  user_password: "",
  user_email: "",
  user_mobile: "",
  organisation_name: "",
  organisation_address: "",
};

const ErrorText = ({ msg }: { msg?: string }) => (
  <p className="mt-2 min-h-[25px] text-sm leading-5 text-destructive">
    {msg ?? "\u00A0"}
  </p>
);

function RequiredLabel(props: React.ComponentProps<typeof Label>) {
  const { children, className, ...rest } = props;
  return (
    <Label
      className={`mb-2 flex items-center gap-1 ${className ?? ""}`}
      {...rest}
    >
      <span>{children}</span>
      <span aria-hidden className="text-destructive">
        *
      </span>
    </Label>
  );
}

export function OrganizerRegistrationCard({
  onBack,
}: OrganizerRegistrationFormProps) {
  const [showPwd, setShowPwd] = useState(false);
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
          className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2"
        >
          {/* Name (required) */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="What is Name?">
                      <Info className="h-4 w-4 text-yellow-600 -mt-2.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    This is your display name.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <RequiredLabel htmlFor="name">Name</RequiredLabel>
            </div>
            <Input
              id="name"
              aria-required
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            <ErrorText msg={errors.name?.message} />
          </div>

          {/* Username (required) */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="What is Username?">
                      <Info className="h-4 w-4 text-yellow-600 -mt-2.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    This will be your unique user ID for logging in.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <RequiredLabel htmlFor="username">Username</RequiredLabel>
            </div>
            <Input
              id="username"
              aria-required
              placeholder="At least 6 characters"
              {...register("username")}
              aria-invalid={!!errors.username}
            />
            <ErrorText msg={errors.username?.message} />
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

          {/* Email (required) */}
          <div className="flex flex-col">
            <RequiredLabel htmlFor="user_email">Email</RequiredLabel>
            <Input
              id="user_email"
              type="email"
              autoComplete="email"
              aria-required
              placeholder="name@example.com"
              {...register("user_email")}
              aria-invalid={!!errors.user_email}
            />
            <ErrorText msg={errors.user_email?.message} />
          </div>

          {/* Mobile (required) */}
          <div className="flex flex-col">
            <RequiredLabel htmlFor="user_mobile">Mobile</RequiredLabel>
            <Input
              id="user_mobile"
              aria-required
              placeholder="Singapore mobile no"
              {...register("user_mobile")}
              aria-invalid={!!errors.user_mobile}
            />
            <ErrorText msg={errors.user_mobile?.message} />
          </div>

          {/* Organisation name (required) */}
          <div className="flex flex-col">
            <RequiredLabel htmlFor="organisation_name">
              Organisation name
            </RequiredLabel>
            <Input
              id="organisation_name"
              aria-required
              {...register("organisation_name")}
              aria-invalid={!!errors.organisation_name}
            />
            <ErrorText msg={errors.organisation_name?.message} />
          </div>

          {/* Organisation address (optional, full width) */}

          <div className="flex flex-col md:col-span-2">
            <Label htmlFor="organisation_address" className="mb-2">
              Organisation address
            </Label>
            <Input
              id="organisation_address"
              placeholder="(optional)"
              {...register("organisation_address")}
              aria-invalid={!!errors.organisation_address}
            />
            <ErrorText msg={errors.organisation_address?.message} />

            {/* Required fields note here */}
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="text-destructive">*</span> Required fields
            </p>
          </div>

          {/* Required note + Submit */}
          <div className="md:col-span-2 flex flex-col items-center gap-2 mt-1">
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
