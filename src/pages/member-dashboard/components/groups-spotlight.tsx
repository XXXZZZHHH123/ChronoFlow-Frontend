import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MemberDashboardGroup } from "@/lib/validation/schema";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const GROUP_STATUS_META: Record<
  number,
  { label: string; className: string; dot: string }
> = {
  0: {
    label: "Active",
    className: "border-emerald-200 text-emerald-600",
    dot: "bg-emerald-500",
  },
  1: {
    label: "Inactive",
    className: "border-amber-200 text-amber-600",
    dot: "bg-amber-500",
  },
};

type GroupsSpotlightProps = {
  groups: MemberDashboardGroup[];
  leaderNameLookup?: Record<string, string>;
};

export function GroupsSpotlight({ groups, leaderNameLookup }: GroupsSpotlightProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Group Participation</CardTitle>
        <p className="text-sm text-muted-foreground">
          See which teams you&apos;re embedded in and the events they support.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You&apos;re not assigned to any groups yet. Once organisers add you to a team,
            it will show up here.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((group) => {
              const event = group.event;
              const start = event.startTime ? DATE_FORMATTER.format(event.startTime) : null;
              const end = event.endTime ? DATE_FORMATTER.format(event.endTime) : null;
              const statusBadge = GROUP_STATUS_META[group.status] ?? null;
              const leadName = group.leadUserName?.trim() || null;
              const derivedName =
                (group.leadUserId ? leaderNameLookup?.[group.leadUserId] : null) ?? null;
              const leadDisplay = leadName ?? derivedName ?? group.leadUserId ?? "Not set";

              return (
                <div
                  key={group.id}
                  className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card/70 p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-base font-semibold text-foreground">{group.name}</h3>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="truncate">Leader:&nbsp;</span>
                        <span className="font-medium text-foreground">{leadDisplay}</span>
                      </p>
                    </div>
                    {statusBadge ? (
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusBadge.className}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                    <div className="flex flex-col gap-3 text-sm">
                      <div className="flex flex-wrap items-baseline gap-2 text-foreground">
                        <span className="font-semibold">Event:</span>
                        <span>{event.name}</span>
                      </div>
                      {event.location ? (
                        <div className="flex flex-wrap items-baseline gap-2 text-muted-foreground">
                          <span className="font-semibold text-foreground">Location:</span>
                          <span>{event.location}</span>
                        </div>
                      ) : null}
                      <div className="grid gap-2 text-muted-foreground sm:grid-cols-2">
                        {start ? (
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-foreground">Starts:</span>
                            <span className="text-foreground">{start}</span>
                          </div>
                        ) : null}
                        {end ? (
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-foreground">Ends:</span>
                            <span className="text-foreground">{end}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}