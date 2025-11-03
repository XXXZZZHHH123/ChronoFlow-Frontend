import { CheckCircle2, ListChecks, Hourglass } from "lucide-react";

type Props = {
  total: number;
  completed: number;
  remaining: number;
  className?: string;
  dense?: boolean;
};

export default function TaskSummaryBox({
  total,
  completed,
  remaining,
  className = "",
  dense = true,
}: Props) {
  const pad = dense ? "px-2 py-1" : "px-3 py-1.5";
  const text = dense ? "text-xs" : "text-sm";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border bg-card ${pad} ${className}`}
    >
      <Pill
        icon={<ListChecks className="h-3.5 w-3.5" />}
        label="Total"
        value={total}
        className={`${text} text-foreground`}
      />
      <Pill
        icon={
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
        }
        label="Completed"
        value={completed}
        className={`${text} text-green-700 dark:text-green-300`}
      />
      <Pill
        icon={
          <Hourglass className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        }
        label="Remaining"
        value={remaining}
        className={`${text} text-amber-700 dark:text-amber-300`}
      />
    </div>
  );
}

function Pill({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded bg-muted px-2 py-0.5">
      {icon}
      <span className={`font-medium ${className}`}>
        {label}: {value}
      </span>
    </div>
  );
}
