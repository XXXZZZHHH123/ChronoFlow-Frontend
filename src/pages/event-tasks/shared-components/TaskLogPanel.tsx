import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, File as FileIcon, RefreshCw } from "lucide-react";
import { getEventTaskLogs } from "@/api/eventTasksApi";
import type { TaskLog } from "@/lib/validation/schema";
import { formatDT, formatFileBytes, getActionMeta } from "@/services/eventTask";

type TaskLogModalProps = {
  eventId: string | number;
  taskId: string | number;
  triggerLabel?: string;
  trigger?: React.ReactNode;
};

export default function TaskLogModal({
  eventId,
  taskId,
  triggerLabel = "View Task Log",
  trigger,
}: TaskLogModalProps) {
  const [open, setOpen] = React.useState(false);
  const [logs, setLogs] = React.useState<TaskLog[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEventTaskLogs(eventId, taskId);
      setLogs([...data].sort((a, b) => (a.createTime < b.createTime ? 1 : -1)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load task log.");
    } finally {
      setLoading(false);
    }
  }, [eventId, taskId]);

  React.useEffect(() => {
    if (open) fetchLogs();
  }, [open, fetchLogs]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="secondary">
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Task Activity</DialogTitle>
          <DialogDescription>
            History of actions and file attachments.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[75dvh] overflow-y-auto px-6 pb-6">
          <Card className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Activity Log</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchLogs}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw
                  className={cn("h-4 w-4", loading && "animate-spin")}
                />
                Refresh
              </Button>
            </div>

            {loading && (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-16 rounded-md bg-muted animate-pulse" />
                        <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
                      </div>
                      <div className="h-4 w-28 rounded-md bg-muted animate-pulse" />
                    </div>
                    <div className="h-16 w-full rounded-md bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && logs.length === 0 && (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}

            <ol className="space-y-4">
              {logs.map((log) => {
                const meta = getActionMeta(log.action);
                const who =
                  log.sourceUser?.name ?? log.sourceUser?.email ?? "Unknown";
                const target =
                  log.targetUser?.name ?? log.targetUser?.email ?? null;
                const when = formatDT(log.createTime);

                return (
                  <li key={log.id} className="rounded-md border p-3 sm:p-4">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("font-medium", meta.theme)}>
                          {meta.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {when}
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">by</span>{" "}
                        <span className="font-medium">{who}</span>
                        {target && (
                          <>
                            {" "}
                            <ArrowRight className="inline h-3.5 w-3.5 align-middle mx-1 text-muted-foreground" />
                            <span className="font-medium">{target}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {log.remark && (
                      <div className="mt-3 rounded-md bg-muted/40 px-3 py-2 text-sm border border-muted text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Remark:
                        </span>{" "}
                        {log.remark}
                      </div>
                    )}

                    {/* Attachments — horizontal scroll, 2 cards visible */}
                    {log.fileResults && log.fileResults.length > 0 && (
                      <div className="mt-3 overflow-x-auto">
                        <div className="flex gap-3 snap-x snap-mandatory">
                          {log.fileResults.map((f, idx) => {
                            const isImage = /^image\//i.test(f.contentType);
                            const label = f.name ?? f.objectName;
                            const sizeNum =
                              typeof f.size === "number"
                                ? f.size
                                : Number.parseInt(String(f.size), 10);
                            const sizeText = Number.isFinite(sizeNum)
                              ? formatFileBytes(sizeNum)
                              : `${f.size} bytes`;

                            return (
                              <a
                                key={`${f.objectName}-${idx}`}
                                href={f.signedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="snap-start basis-1/2 shrink-0 min-w-0
                                           rounded-md border p-2 hover:bg-muted/50 transition
                                           flex items-center gap-3"
                              >
                                <div className="h-10 w-10 flex items-center justify-center rounded bg-muted/40 overflow-hidden">
                                  {isImage ? (
                                    <img
                                      src={f.signedUrl}
                                      alt={label}
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-medium hover:underline">
                                    {label}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {sizeText}
                                  </div>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
