import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import Swal from "sweetalert2";
import {
  memberLookupSchema,
  type MemberLookup,
  type MemberPrefill,
} from "@/lib/validation/schema";

type MemberLookupCardProps = {
  onBack: () => void;
  onSearch: (v: MemberLookup) => Promise<MemberPrefill | null>;
};

export function MemberLookupCard({ onBack, onSearch }: MemberLookupCardProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberLookup>({
    resolver: zodResolver(memberLookupSchema),
    defaultValues: { organisation_id: "", user_id: "" },
  });

  const submit = handleSubmit(async (values) => {
    await onSearch(values);
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Find your invitation</CardTitle>
        <CardDescription>
          Enter your Organisation ID and User ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="organisation_id">Organisation ID</Label>
            <Input
              id="organisation_id"
              {...register("organisation_id")}
              aria-invalid={!!errors.organisation_id}
            />
            <p className="h-5 text-sm text-destructive">
              {errors.organisation_id?.message ?? "\u00A0"}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="user_id">User ID</Label>
            <Input
              id="user_id"
              {...register("user_id")}
              aria-invalid={!!errors.user_id}
            />
            <p className="h-5 text-sm text-destructive">
              {errors.user_id?.message ?? "\u00A0"}
            </p>
          </div>

          <Button type="submit" className="h-11" disabled={isSubmitting}>
            {isSubmitting ? "Looking up…" : "Look up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm underline underline-offset-4"
        >
          Back to sign in
        </button>
      </CardFooter>
    </Card>
  );
}
