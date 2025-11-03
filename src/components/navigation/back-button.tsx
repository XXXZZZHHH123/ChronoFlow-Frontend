import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Props = {
  to: string;
  label?: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?:
    | "outline"
    | "ghost"
    | "secondary"
    | "default"
    | "destructive"
    | "link";
  icon?: LucideIcon;
};

export default function BackButton({
  to,
  label = "Back",
  className,
  size = "sm",
  variant = "outline",
  icon: Icon = ArrowLeft,
}: Props) {
  return (
    <Button
      asChild
      size={size}
      variant={variant}
      className={cn("gap-2", className)}
    >
      <Link to={to} aria-label={label}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    </Button>
  );
}
