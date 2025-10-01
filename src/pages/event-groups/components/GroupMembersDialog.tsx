import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Loader2, Trash2, UserPlus, Crown } from "lucide-react";
import type { Group, GroupMember } from "@/lib/validation/schema";
import {
  getGroupMembers,
  addMembersToGroup,
  removeMembersFromGroup,
} from "@/api/groupApi";
import { useMembers } from "@/hooks/members/userMember";
import Swal from "sweetalert2";

type Props = {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
};

export default function GroupMembersDialog({
  group,
  open,
  onOpenChange,
  onRefresh,
}: Props) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [internalOpen, setInternalOpen] = useState(open);

  const { members: allMembers } = useMembers(open);

  // 同步外部 open 状态到内部
  useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setMembers([]);
      setSelectedUsers(new Set());
      setIsAdding(false);
      return;
    }
  }, [open]);

  // Fetch members when dialog opens with a group
  useEffect(() => {
    if (!open || !group) return;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const data = await getGroupMembers(group.id);
        setMembers(data);
      } catch (err) {
        console.error("Failed to load members:", err);
        await Swal.fire({
          icon: "error",
          title: "Failed to load members",
          text: err instanceof Error ? err.message : "Please try again.",
          heightAuto: false,
          customClass: {
            popup: "rounded-lg border shadow-lg",
            title: "text-lg font-semibold",
            htmlContainer: "text-sm text-muted-foreground",
            confirmButton:
              "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium",
          },
          buttonsStyling: false,
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchMembers();
  }, [open, group]);

  const memberUserIds = new Set(members.map((m) => m.userId));
  const availableUsers = allMembers.filter((u) => !memberUserIds.has(u.id));

  // Sort members to show leader first
  const sortedMembers = [...members].sort((a, b) => {
    const aIsLeader = group?.leadUserId === a.userId;
    const bIsLeader = group?.leadUserId === b.userId;
    if (aIsLeader) return -1;
    if (bIsLeader) return 1;
    return 0;
  });

  const handleAddMembers = async () => {
    if (!group || selectedUsers.size === 0) return;

    try {
      await addMembersToGroup(group.id, Array.from(selectedUsers));

      // Close dialog first
      onOpenChange(false);

      // Show success message
      await Swal.fire({
        icon: "success",
        title: "Members added",
        text: `${selectedUsers.size} member(s) added successfully.`,
        heightAuto: false,
        customClass: {
          popup: "rounded-lg border shadow-lg",
          title: "text-lg font-semibold",
          htmlContainer: "text-sm text-muted-foreground",
          confirmButton:
            "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium",
        },
        buttonsStyling: false,
      });

      // Call parent refresh
      onRefresh();
    } catch (err: unknown) {
      onOpenChange(false);
      await Swal.fire({
        icon: "error",
        title: "Failed to add members",
        text: err instanceof Error ? err.message : "Please try again.",
        heightAuto: false,
        customClass: {
          popup: "rounded-lg border shadow-lg",
          title: "text-lg font-semibold",
          htmlContainer: "text-sm text-muted-foreground",
          confirmButton:
            "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium",
        },
        buttonsStyling: false,
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!group) return;

    // 暂时隐藏主 Dialog
    setInternalOpen(false);

    // 等待 Dialog 完全关闭
    await new Promise((resolve) => setTimeout(resolve, 150));

    const result = await Swal.fire({
      title: "Remove member?",
      text: "This will remove the user from this group.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
      heightAuto: false,
      customClass: {
        popup: "rounded-lg border shadow-lg",
        title: "text-lg font-semibold",
        htmlContainer: "text-sm text-muted-foreground",
        confirmButton:
          "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium",
        cancelButton:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium",
        actions: "gap-2",
      },
      buttonsStyling: false,
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      // 用户取消，恢复显示主 Dialog
      setInternalOpen(true);
      return;
    }

    try {
      await removeMembersFromGroup(group.id, [userId]);

      // 不恢复主 Dialog，直接关闭
      onOpenChange(false);

      // Show success message
      await Swal.fire({
        icon: "success",
        title: "Member removed",
        text: "The member has been removed from the group.",
        heightAuto: false,
        customClass: {
          popup: "rounded-lg border shadow-lg",
          title: "text-lg font-semibold",
          htmlContainer: "text-sm text-muted-foreground",
          confirmButton:
            "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium",
        },
        buttonsStyling: false,
      });

      // Call parent refresh
      onRefresh();
    } catch (err: unknown) {
      onOpenChange(false);
      await Swal.fire({
        icon: "error",
        title: "Failed to remove member",
        text: err instanceof Error ? err.message : "Please try again.",
        heightAuto: false,
        customClass: {
          popup: "rounded-lg border shadow-lg",
          title: "text-lg font-semibold",
          htmlContainer: "text-sm text-muted-foreground",
          confirmButton:
            "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium",
        },
        buttonsStyling: false,
      });
    }
  };

  return (
    <Dialog open={internalOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Members - {group?.name}</DialogTitle>
          <DialogDescription>
            Add or remove members from this group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">
                Current Members ({members.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No members in this group yet
              </div>
            ) : (
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-2">
                  {sortedMembers.map((member) => {
                    const isLeader = group?.leadUserId === member.userId;
                    return (
                      <div
                        key={member.userId}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {isLeader && (
                            <Crown className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {member.username}
                              {isLeader && (
                                <span className="text-xs text-yellow-600 font-semibold">
                                  (Leader)
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          </div>
                        </div>
                        {!isLeader && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMember(member.userId)}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Add Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Add Members</h3>
              {isAdding && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAdding(false);
                    setSelectedUsers(new Set());
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            {!isAdding ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsAdding(true)}
                disabled={membersLoading || availableUsers.length === 0}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {membersLoading
                  ? "Loading..."
                  : availableUsers.length === 0
                  ? "No available members"
                  : "Add Members"}
              </Button>
            ) : (
              <div className="space-y-2">
                <Command className="border rounded-md">
                  <CommandInput placeholder="Search members..." />
                  <CommandList>
                    <CommandEmpty>No members found.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-[200px]">
                        {availableUsers.map((user) => {
                          const isSelected = selectedUsers.has(user.id);
                          return (
                            <CommandItem
                              key={user.id}
                              onSelect={() => {
                                const newSet = new Set(selectedUsers);
                                if (isSelected) {
                                  newSet.delete(user.id);
                                } else {
                                  newSet.add(user.id);
                                }
                                setSelectedUsers(newSet);
                              }}
                            >
                              <Checkbox checked={isSelected} className="mr-2" />
                              <div className="flex-1">
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </ScrollArea>
                    </CommandGroup>
                  </CommandList>
                </Command>

                {selectedUsers.size > 0 && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">
                      {selectedUsers.size} member(s) selected
                    </span>
                    <Button size="sm" onClick={handleAddMembers}>
                      Add Selected
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
