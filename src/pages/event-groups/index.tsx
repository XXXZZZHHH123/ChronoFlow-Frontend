import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { DataTableLoading } from "@/components/data-table/data-table-skeleton";
import { useGroups } from "@/hooks/groups/useGroups";
import { GroupColumns } from "./components/get-groups-table/columns";
import GroupsTable from "./components/get-groups-table/data-table";
import GroupMembersDialog from "./components/GroupMembersDialog";
import type { Group } from "@/lib/validation/schema";

export default function SpecificEventGroupPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);

  const {
    groups,
    loading: groupsLoading,
    error: groupsError,
    onRefresh: onGroupsRefresh,
  } = useGroups(id ?? null, true);

  const handleManageMembers = (group: Group) => {
    setSelectedGroup(group);
    setMembersDialogOpen(true);
  };

  const handleMembersDialogClose = () => {
    setMembersDialogOpen(false);
    // Delay clearing to avoid flickering
    setTimeout(() => setSelectedGroup(null), 300);
  };

  const columns = useMemo(
    () => GroupColumns(onGroupsRefresh, handleManageMembers),
    [onGroupsRefresh]
  );

  if (!id) {
    return (
      <Card className="rounded-lg border-none">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            No event selected. Please select an event first.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-lg border-none">
        <CardContent className="p-4 sm:p-6">
          {groupsLoading ? (
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                <DataTableLoading columnCount={8} />
              </div>
            </div>
          ) : groupsError ? (
            <div className="py-6 text-center text-red-500">{groupsError}</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                <GroupsTable
                  columns={columns}
                  data={groups}
                  onRefresh={onGroupsRefresh}
                  eventId={id}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <GroupMembersDialog
        group={selectedGroup}
        open={membersDialogOpen}
        onOpenChange={handleMembersDialogClose}
        onRefresh={onGroupsRefresh}
      />
    </>
  );
}
