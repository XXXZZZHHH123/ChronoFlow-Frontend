export type EventStatusCode = 0 | 1 | 2 | null | undefined;

export function getEventStatusText(status: EventStatusCode): string {
  switch (status) {
    case 0:
      return "Not started";
    case 1:
      return "Active";
    case 2:
      return "Completed";
    default:
      return "Unknown";
  }
}

export function eventStatusFilterOptions() {
  return [
    { label: "Not started", value: "0" },
    { label: "Active", value: "1" },
    { label: "Completed", value: "2" },
  ];
}

export function getEventStatusStyles(status: EventStatusCode) {
  switch (status) {
    case 0: // Not started
      return {
        badge: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
        dot: "bg-zinc-500",
      };
    case 1: // Ongoing
      return {
        badge: "bg-violet-100 text-violet-700 ring-violet-500/20",
        dot: "bg-violet-500",
      };
    case 2: // Completed
      return {
        badge: "bg-emerald-100 text-emerald-700 ring-emerald-500/20",
        dot: "bg-emerald-500",
      };
    default: // Unknown
      return {
        badge: "bg-amber-100 text-amber-700 ring-amber-500/20",
        dot: "bg-amber-500",
      };
  }
}
