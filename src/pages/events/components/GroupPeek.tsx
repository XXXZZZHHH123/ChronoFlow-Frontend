import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

type Group = { id: string; name: string | null };

export function GroupPeek({
  groups,
  className = "",
  pillClassName = "",
  maxPreview = 8,
}: {
  groups: Group[] | undefined | null;
  className?: string;
  pillClassName?: string;
  maxPreview?: number;
}) {
  const list = Array.isArray(groups) ? groups : [];

  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-5";
  const grey = "bg-muted text-muted-foreground italic";
  const green =
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
  const purple =
    "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300";

  if (list.length === 0) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <span className={`${base} ${grey} ${pillClassName}`}>No Group</span>
      </div>
    );
  }

  const firstName = (list[0]?.name ?? "").trim() || "Unnamed";
  const rest = list.slice(1);
  const restCount = rest.length;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {/* first group name — green */}
      <span className={`${base} ${green} ${pillClassName}`}>{firstName}</span>

      {/* "+N" — purple with hover list */}
      {restCount > 0 && (
        <HoverCard openDelay={80} closeDelay={80}>
          <HoverCardTrigger asChild>
            <span
              className={`${base} ${purple} ${pillClassName} cursor-help`}
              aria-label={`${restCount} more group${restCount > 1 ? "s" : ""}`}
            >
              +{restCount}
            </span>
          </HoverCardTrigger>
          <HoverCardContent side="top" align="start" className="w-56 p-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              {restCount} more group{restCount > 1 ? "s" : ""}
            </div>
            <ul className="space-y-1.5">
              {rest.slice(0, maxPreview).map((g) => (
                <li key={g.id} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  <span>{(g.name ?? "").trim() || "Unnamed"}</span>
                </li>
              ))}
            </ul>
            {restCount > maxPreview && (
              <div className="mt-2 text-xs text-muted-foreground">
                +{restCount - maxPreview} more
              </div>
            )}
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
}
