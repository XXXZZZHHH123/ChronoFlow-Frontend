import { Calendar, Clock } from "lucide-react";

const dateFmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function DateTimeView({ dt }: { dt: Date }) {
  return (
    <div className="flex flex-col leading-tight">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="font-medium">{dateFmt.format(dt)}</span>
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        <span className="text-muted-foreground">{timeFmt.format(dt)}</span>
      </div>
    </div>
  );
}
