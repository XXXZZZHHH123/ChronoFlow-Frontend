import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { OrgEvent } from "@/lib/validation/schema";
import { DateTimeView } from "../DateTimeView";
import TaskSummaryBox from "../TaskSummaryBox";
import { GroupPeek } from "../GroupPeek";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { deleteEvent } from "@/api/eventApi";
import EventConfigFormModal from "../EventConfigForm";
import {
  getEventStatusStyles,
  getEventStatusText,
  type EventStatusCode,
} from "@/services/event";
import { cn } from "@/lib/utils";
import { GoToEventButton } from "../GoToEventButton";

export function StatusBadge({ status }: { status: EventStatusCode }) {
  const label = getEventStatusText(status);
  const { badge } = getEventStatusStyles(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        badge
      )}
    >
      {label}
    </span>
  );
}

function ActionCell({
  ev,
  onRefresh,
}: {
  ev: OrgEvent;
  onRefresh: () => void | Promise<void>;
}) {
  const onDelete = async () => {
    const result = await Swal.fire({
      title: "Delete event?",
      html: `This will remove <b>${ev.name}</b>.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;

    try {
      await deleteEvent(ev.id);
      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "The event has been deleted.",
        confirmButtonText: "OK",
      });
      await onRefresh?.();
    } catch (err: unknown) {
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text:
          err instanceof Error
            ? err.message
            : "Unable to delete the event. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div
      className="w-full flex items-center justify-center gap-2
                    [&>*]:h-9 [&>*]:px-3"
    >
      {" "}
      <GoToEventButton id={ev.id} />
      <Button size="sm" variant="destructive" onClick={onDelete}>
        Delete
      </Button>
      <EventConfigFormModal event={ev} onRefresh={onRefresh} />
    </div>
  );
}

export const OrgEventColumns = (
  onRefresh: () => Promise<void> | void
): ColumnDef<OrgEvent>[] => [
  {
    id: "actions",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Action" />
      </div>
    ),
    cell: ({ row }) => <ActionCell ev={row.original} onRefresh={onRefresh} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Status" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusBadge status={row.getValue("status")} />
      </div>
    ),
    filterFn: (row, id, value) => String(row.getValue(id)) === String(value),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Name" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Location" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.getValue("location") ?? ""}
      </div>
    ),
  },
  {
    accessorKey: "startTime",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Start Time" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DateTimeView dt={row.getValue("startTime") as Date} />
      </div>
    ),
  },
  {
    accessorKey: "endTime",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="End Time" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DateTimeView dt={row.getValue("endTime") as Date} />
      </div>
    ),
  },
  {
    accessorKey: "groups",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Groups" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <GroupPeek groups={row.getValue("groups") as OrgEvent["groups"]} />
      </div>
    ),
  },
  {
    accessorKey: "joiningParticipants",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Participants" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.getValue("joiningParticipants")}
      </div>
    ),
  },
  {
    accessorKey: "taskStatus",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Tasks" />
      </div>
    ),
    cell: ({ row }) => {
      const t = row.getValue("taskStatus") as OrgEvent["taskStatus"];
      return (
        <div className="flex justify-center">
          <TaskSummaryBox
            total={t.total}
            completed={t.completed}
            remaining={t.remaining}
            dense
          />
        </div>
      );
    },
  },
];
