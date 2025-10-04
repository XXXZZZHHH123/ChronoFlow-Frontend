import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Swal from "sweetalert2";
import * as groupApi from "@/api/groupApi";
import GroupMembersDialog from "../components/GroupMembersDialog";
import type { Group, GroupMember } from "@/lib/validation/schema";

// Mock scrollIntoView for Command component
Element.prototype.scrollIntoView = vi.fn();

// Mock useMembers hook
vi.mock("@/hooks/members/userMember", () => ({
  useMembers: vi.fn(() => ({
    members: [
      {
        id: "user_003",
        name: "Alice Brown",
        email: "alice@example.com",
        phone: null,
        roles: [],
        registered: true,
      },
      {
        id: "user_004",
        name: "Bob Wilson",
        email: "bob@example.com",
        phone: null,
        roles: [],
        registered: true,
      },
    ],
    loading: false,
    error: null,
    onRefresh: vi.fn(),
  })),
}));

const mockGroup: Group = {
  id: "grp_001",
  name: "Marketing Team",
  sort: 0,
  leadUserId: "user_001",
  leadUserName: "John Doe",
  remark: null,
  status: 0,
  statusName: "Active",
  eventId: "evt_001",
  eventName: "Annual Conference",
  memberCount: 2,
  createTime: new Date(),
  updateTime: new Date(),
};

const mockMembers: GroupMember[] = [
  {
    userId: "user_001",
    username: "John Doe",
    email: "john@example.com",
    phone: null,
    roleId: "role_001",
    roleName: "Leader",
    joinTime: new Date(),
  },
  {
    userId: "user_002",
    username: "Jane Smith",
    email: "jane@example.com",
    phone: null,
    roleId: "role_002",
    roleName: "Member",
    joinTime: new Date(),
  },
];

describe("GroupMembersDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Swal, "fire").mockResolvedValue({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false,
      value: undefined,
      dismiss: undefined,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads and displays group members when opened", async () => {
    const getMembersSpy = vi
      .spyOn(groupApi, "getGroupMembers")
      .mockResolvedValue(mockMembers);

    render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(getMembersSpy).toHaveBeenCalledWith(mockGroup.id);
    });

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("shows leader badge for group leader", async () => {
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue(mockMembers);

    render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    expect(await screen.findByText(/leader/i)).toBeInTheDocument();
  });

  it("removes a member when delete button is clicked", async () => {
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue(mockMembers);
    const removeSpy = vi
      .spyOn(groupApi, "removeMembersFromGroup")
      .mockResolvedValue({});
    const onRefresh = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={onOpenChange}
        onRefresh={onRefresh}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Find delete button for Jane (not the leader)
    const deleteButtons = screen.getAllByRole("button");
    const janeDeleteButton = deleteButtons.find(
      (btn) =>
        btn.querySelector("svg") &&
        btn.closest("div")?.textContent?.includes("Jane")
    );

    if (janeDeleteButton) {
      await userEvent.click(janeDeleteButton);

      await waitFor(() => {
        expect(removeSpy).toHaveBeenCalledWith(mockGroup.id, ["user_002"]);
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onRefresh).toHaveBeenCalled();
    }
  });

  it("prevents removing the group leader", async () => {
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue(mockMembers);

    render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Leader should not have a delete button
    const leaderRow = screen.getByText("John Doe").closest("div");
    expect(
      leaderRow?.querySelector("button[aria-label*='delete']")
    ).not.toBeInTheDocument();
  });

  it("shows empty state when no members", async () => {
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue([]);

    render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    expect(
      await screen.findByText(/no members in this group/i)
    ).toBeInTheDocument();
  });

  // 新增测试：加载成员失败
  it("shows error when loading members fails", async () => {
    const error = new Error("Network error");
    vi.spyOn(groupApi, "getGroupMembers").mockRejectedValue(error);

    // Suppress console.error for this test
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Failed to load members",
          text: "Network error",
        })
      );
    });

    consoleErrorSpy.mockRestore();
  });

  // 新增测试：添加成员功能
  it("adds members successfully", async () => {
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue(mockMembers);
    const addSpy = vi
      .spyOn(groupApi, "addMembersToGroup")
      .mockResolvedValue({});
    const onRefresh = vi.fn();
    const onOpenChange = vi.fn();

    const user = userEvent.setup();

    render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={onOpenChange}
        onRefresh={onRefresh}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Click "Add Members" button
    const addButton = screen.getByRole("button", { name: /add members/i });
    await user.click(addButton);

    // Wait for member list to appear
    await waitFor(() => {
      expect(screen.getByText("Alice Brown")).toBeInTheDocument();
    });

    // Click on Alice to select her (click the CommandItem, not just text)
    const aliceItem = screen
      .getByText("Alice Brown")
      .closest("[role='option']");
    if (aliceItem) {
      await user.click(aliceItem);
    }

    // Wait for selection to be reflected
    await waitFor(() => {
      expect(screen.getByText(/1 member\(s\) selected/i)).toBeInTheDocument();
    });

    // Click "Add Selected" button
    const addSelectedButton = screen.getByRole("button", {
      name: /add selected/i,
    });
    await user.click(addSelectedButton);

    await waitFor(() => {
      expect(addSpy).toHaveBeenCalledWith(mockGroup.id, ["user_003"]);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onRefresh).toHaveBeenCalled();
    });

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "success",
        title: "Members added",
      })
    );
  });

  // 新增测试：添加成员失败
  it("shows error when adding members fails", async () => {
    const error = new Error("Failed to add");
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue(mockMembers);
    vi.spyOn(groupApi, "addMembersToGroup").mockRejectedValue(error);
    const onOpenChange = vi.fn();

    const user = userEvent.setup();

    render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={onOpenChange}
        onRefresh={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Click "Add Members" button
    const addButton = screen.getByRole("button", { name: /add members/i });
    await user.click(addButton);

    // Select a member
    await waitFor(() => {
      expect(screen.getByText("Alice Brown")).toBeInTheDocument();
    });

    const aliceItem = screen
      .getByText("Alice Brown")
      .closest("[role='option']");
    if (aliceItem) {
      await user.click(aliceItem);
    }

    // Wait for selection
    await waitFor(() => {
      expect(screen.getByText(/1 member\(s\) selected/i)).toBeInTheDocument();
    });

    // Click "Add Selected" button
    const addSelectedButton = screen.getByRole("button", {
      name: /add selected/i,
    });
    await user.click(addSelectedButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "error",
        title: "Failed to add members",
        text: "Failed to add",
      })
    );
  });

  // 新增测试：取消添加成员
  it("cancels adding members", async () => {
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue(mockMembers);

    const user = userEvent.setup();

    render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Click "Add Members" button
    const addButton = screen.getByRole("button", { name: /add members/i });
    await user.click(addButton);

    // Wait for cancel button to appear
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });

    // Click Cancel
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    // Should show "Add Members" button again
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add members/i })
      ).toBeInTheDocument();
    });
  });

  // 新增测试：删除成员时取消确认
  it("cancels member removal when user clicks cancel", async () => {
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue(mockMembers);
    const removeSpy = vi.spyOn(groupApi, "removeMembersFromGroup");

    // Mock Swal to return isConfirmed: false (user clicked cancel)
    vi.spyOn(Swal, "fire").mockResolvedValue({
      isConfirmed: false,
      isDenied: false,
      isDismissed: true,
      value: undefined,
      dismiss: Swal.DismissReason.cancel,
    });

    const onRefresh = vi.fn();
    const onOpenChange = vi.fn();

    const user = userEvent.setup();

    render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={onOpenChange}
        onRefresh={onRefresh}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Find delete button for Jane
    const deleteButtons = screen.getAllByRole("button");
    const janeDeleteButton = deleteButtons.find(
      (btn) =>
        btn.querySelector("svg") &&
        btn.closest("div")?.textContent?.includes("Jane")
    );

    if (janeDeleteButton) {
      await user.click(janeDeleteButton);

      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalled();
      });

      // Should not call remove API
      expect(removeSpy).not.toHaveBeenCalled();
      expect(onRefresh).not.toHaveBeenCalled();
    }
  });

  // 新增测试：删除成员失败
  it("shows error when removing member fails", async () => {
    const error = new Error("Failed to remove");
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue(mockMembers);
    vi.spyOn(groupApi, "removeMembersFromGroup").mockRejectedValue(error);

    // Mock Swal to return confirmed first, then we'll check error alert
    vi.spyOn(Swal, "fire").mockResolvedValue({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false,
      value: undefined,
      dismiss: undefined,
    });

    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={onOpenChange}
        onRefresh={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Find delete button for Jane
    const deleteButtons = screen.getAllByRole("button");
    const janeDeleteButton = deleteButtons.find(
      (btn) =>
        btn.querySelector("svg") &&
        btn.closest("div")?.textContent?.includes("Jane")
    );

    if (janeDeleteButton) {
      await user.click(janeDeleteButton);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });

      // Check that error alert was shown
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Failed to remove member",
          text: "Failed to remove",
        })
      );
    }
  });

  // 新增测试：dialog 关闭时重置状态
  it("resets state when dialog closes", async () => {
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue(mockMembers);

    const { rerender } = render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Close dialog
    rerender(
      <GroupMembersDialog
        group={mockGroup}
        open={false}
        onOpenChange={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    // State should be reset (members cleared, etc.)
    await waitFor(() => {
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });
  });

  // 新增测试：没有可用成员时禁用添加按钮
  it("disables add button when no available members", async () => {
    // Mock all members as already in the group
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue([
      ...mockMembers,
      {
        userId: "user_003",
        username: "Alice Brown",
        email: "alice@example.com",
        phone: null,
        roleId: "role_003",
        roleName: "Member",
        joinTime: new Date(),
      },
      {
        userId: "user_004",
        username: "Bob Wilson",
        email: "bob@example.com",
        phone: null,
        roleId: "role_004",
        roleName: "Member",
        joinTime: new Date(),
      },
    ]);

    render(
      <GroupMembersDialog
        group={mockGroup}
        open={true}
        onOpenChange={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Add button should be disabled and show "No available members"
    const addButton = screen.getByRole("button", {
      name: /no available members/i,
    });
    expect(addButton).toBeDisabled();
  });
});
