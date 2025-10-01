// src/pages/event-groups/components/get-groups-table/columns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { Group } from "@/lib/validation/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Swal from "sweetalert2";
import { deleteGroup } from "@/api/groupApi";
import GroupConfigFormModal from "../GroupConfigForm";
import { Users, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

function StatusBadge({ status }: { status: number }) {
  const isActive = status === 0;
  return (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={isActive ? "bg-green-600 hover:bg-green-700" : ""}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function RemarkCell({ remark }: { remark: string | null }) {
  const [open, setOpen] = useState(false);

  if (!remark) {
    return <div>—</div>;
  }

  return (
    <>
      <div
        className="max-w-[200px] truncate cursor-pointer hover:text-primary transition-colors"
        onClick={() => setOpen(true)}
        title="Click to view full remark"
      >
        {remark}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Remark
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="whitespace-pre-wrap break-words p-4 bg-muted rounded-md">
              {remark}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ActionCell({
  group,
  onRefresh,
  onManageMembers,
}: {
  group: Group;
  onRefresh: () => void | Promise<void>;
  onManageMembers: (group: Group) => void;
}) {
  const isActive = group.status === 0;

  if (!isActive) {
    return <div className="text-muted-foreground">—</div>;
  }

  const onDelete = async () => {
    const result = await Swal.fire({
      title: "Delete group?",
      html: `This will remove <b>${group.name}</b> and all its members.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;

    try {
      await deleteGroup(group.id);
      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "The group has been deleted.",
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
            : "Unable to delete the group. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onManageMembers(group)}
      >
        <Users className="h-4 w-4 mr-1" />
        Members ({group.memberCount})
      </Button>
      <GroupConfigFormModal group={group} onRefresh={onRefresh} />
      <Button size="sm" variant="destructive" onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
}

export const GroupColumns = (
  onRefresh: () => Promise<void> | void,
  onManageMembers: (group: Group) => void
): ColumnDef<Group>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
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
    accessorKey: "leadUserName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Leader" />
    ),
    cell: ({ row }) => <div>{row.getValue("leadUserName") || "—"}</div>,
  },
  {
    accessorKey: "memberCount",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Members" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge variant="secondary">{row.getValue("memberCount")}</Badge>
      </div>
    ),
  },
  {
    accessorKey: "remark",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remark" />
    ),
    cell: ({ row }) => <RemarkCell remark={row.getValue("remark")} />,
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <ActionCell
        group={row.original}
        onRefresh={onRefresh}
        onManageMembers={onManageMembers}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
