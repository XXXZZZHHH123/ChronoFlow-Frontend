import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MemberDashboardMember } from "@/lib/validation/schema";

const STATUS_META: Record<number, { label: string; badgeClassName: string }> = {
  0: { label: "Active", badgeClassName: "border-emerald-200 text-emerald-600" },
  1: { label: "Inactive", badgeClassName: "border-amber-200 text-amber-700" },
  2: { label: "Suspended", badgeClassName: "border-rose-200 text-rose-600" },
};

function getInitials(name: string) {
  const cleaned = name.trim();
  if (!cleaned) return "CM";
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDate(date?: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

type SiteHeaderProps = {
  member: MemberDashboardMember | null;
};

export function SiteHeader({ member }: SiteHeaderProps) {
  const displayName = member?.name?.trim() || member?.username || "Member";
  const joinedOn = formatDate(member?.createTime ?? null);
  const status = member ? STATUS_META[member.status] ?? null : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Member Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Track your assigned work, upcoming deadlines, and the groups you support.
        </p>
      </div>

      {member ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">You&apos;re signed in as</span>
              <span className="text-base font-medium text-foreground">{displayName}</span>
              <span className="text-sm text-muted-foreground">{member.email}</span>
              {member.phone ? (
                <span className="text-sm text-muted-foreground">{member.phone}</span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            {status ? (
              <Badge variant="outline" className={cn("px-3 py-1", status.badgeClassName)}>
                {status.label}
              </Badge>
            ) : null}
            {joinedOn ? (
              <span className="text-sm text-muted-foreground">Joined {joinedOn}</span>
            ) : null}
            {member.updateTime ? (
              <span className="text-xs text-muted-foreground">
                Last updated {formatDate(member.updateTime)}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
