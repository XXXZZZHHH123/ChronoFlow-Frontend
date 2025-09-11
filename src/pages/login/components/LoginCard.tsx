import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { login } from "@/api/authApi";
import { loginUserSchema, type LoginUser } from "@/lib/validation/schema";
import { useEffect, useState } from "react";

type LoginCardProps = {
  onRegistrationSelection: () => void;
  onForgotPassword: () => void;
};

export function LoginCard({
  onRegistrationSelection,
  onForgotPassword,
}: LoginCardProps) {
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: localStorage.getItem("cf.remember") === "1",
    },
  });

  useEffect(() => {
    const remembered = localStorage.getItem("cf.remember") === "1";
    setValue("remember", remembered, {
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [setValue]);

  const onSubmit = handleSubmit(async ({ username, password, remember }) => {
    try {
      await login({ username: username.trim(), password, remember });

      if (remember) localStorage.setItem("cf.remember", "1");
      else localStorage.removeItem("cf.remember");
      navigate("/");
    } catch (err: any) {
      const msg =
        err?.message ?? "Login failed. Please check your credentials.";
      await Swal.fire({
        icon: "error",
        title: "Login failed",
        text: msg,
        confirmButtonText: "OK",
      });
    }
  });

  const remember = watch("remember");

  return (
    <Card
      className={cn(
        "w-full max-w-md rounded-2xl border border-black/5 bg-background/85 shadow-xl backdrop-blur-md"
      )}
    >
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-4xl font-bold tracking-tight">
          Sign in
        </CardTitle>
        <CardDescription>
          Access your workspace to manage tasks, shifts, and timelines.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          {/* Username */}
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                className="pl-9"
                aria-invalid={!!errors.username}
                {...register("username")}
              />
            </div>
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </button>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                className="pl-9 pr-10"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
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
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(v) => {
                const val = v === true;
                setValue("remember", val, { shouldDirty: true });
              }}
            />
            <span className="text-muted-foreground">Remember me</span>
          </label>

          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Login"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onRegistrationSelection}
            className="font-medium underline underline-offset-4"
          >
            Register
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}
