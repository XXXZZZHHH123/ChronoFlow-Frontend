import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PointerEventsCheckLevel } from "@testing-library/user-event";
import Swal from "sweetalert2";
import * as groupApi from "@/api/groupApi";
import GroupConfigFormModal from "../components/GroupConfigForm";
import type { Group, GroupMember } from "@/lib/validation/schema";

// Mock scrollIntoView for Select component
Element.prototype.scrollIntoView = vi.fn();

// Mock useMembers hook
vi.mock("@/hooks/members/userMember", () => ({
  useMembers: vi.fn(() => ({
    members: [
      {
        id: "user_001",
        name: "John Doe",
        email: "john@example.com",
        phone: null,
        roles: [],
        registered: true,
      },
      {
        id: "user_002",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: null,
        roles: [],
        registered: true,
      },
      {
        id: "user_003",
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
  remark: "Main marketing group",
  status: 0,
  statusName: "Active",
  eventId: "evt_001",
  eventName: "Annual Conference",
  memberCount: 5,
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
];

function renderForm(
  props?: Partial<React.ComponentProps<typeof GroupConfigFormModal>>
) {
  const onRefresh = props?.onRefresh ?? vi.fn();
  const eventId = props?.eventId ?? "evt_001";

  return {
    ...render(
      <GroupConfigFormModal
        onRefresh={onRefresh}
        eventId={eventId}
        {...props}
      />
    ),
    onRefresh,
  };
}

describe("GroupConfigFormModal", () => {
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
    vi.restoreAllMocks();
  });

  it("renders create button and opens dialog", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    renderForm();

    const createButton = screen.getByRole("button", {
      name: /^create group$/i,
    });
    expect(createButton).toBeInTheDocument();

    await user.click(createButton);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /create group/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    renderForm();

    await user.click(screen.getByRole("button", { name: /create group/i }));

    const dialog = await screen.findByRole("dialog");
    const submitButton = within(dialog).getByRole("button", {
      name: /create group/i,
    });
    await user.click(submitButton);

    // 应该显示名称必填或 leadUser 必填的验证错误
    await waitFor(() => {
      const nameError = screen.queryByText(/group name is required/i);
      const leadUserError = screen.queryByText(/lead user is required/i);
      expect(nameError || leadUserError).toBeTruthy();
    });
  });

  // 新增测试：成功创建新组（覆盖 131-134 行）
  it("creates a new group successfully", async () => {
    const createSpy = vi.spyOn(groupApi, "createGroup").mockResolvedValue({});
    const onRefresh = vi.fn();

    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    renderForm({ onRefresh });

    // 打开对话框
    await user.click(screen.getByRole("button", { name: /^create group$/i }));
    await screen.findByRole("dialog");

    // 填写表单
    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, "New Marketing Group");

    // 选择 lead user
    const leadUserSelect = screen.getByRole("combobox");
    await user.click(leadUserSelect);

    // 使用 getAllByRole 获取所有 options，然后选择第一个
    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(0);
    });

    const johnOption = screen
      .getAllByRole("option")
      .find((opt) => opt.textContent?.includes("John Doe"));
    if (johnOption) {
      await user.click(johnOption);
    }

    // 填写 sort
    const sortInput = screen.getByLabelText(/sort order/i);
    await user.clear(sortInput);
    await user.type(sortInput, "5");

    // 提交表单
    const dialog = screen.getByRole("dialog");
    const submitButton = within(dialog).getByRole("button", {
      name: /^create group$/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Marketing Group",
          eventId: "evt_001",
          leadUserId: "user_001",
          sort: 5,
        })
      );
    });

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "success",
        title: "Group created",
      })
    );

    expect(onRefresh).toHaveBeenCalled();
  });

  // 新增测试：创建组失败（覆盖错误处理）
  it("handles creation error gracefully", async () => {
    const error = new Error("Failed to create group");
    vi.spyOn(groupApi, "createGroup").mockRejectedValue(error);

    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    renderForm();

    await user.click(screen.getByRole("button", { name: /^create group$/i }));
    await screen.findByRole("dialog");

    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, "New Group");

    const leadUserSelect = screen.getByRole("combobox");
    await user.click(leadUserSelect);

    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(0);
    });

    const johnOption = screen
      .getAllByRole("option")
      .find((opt) => opt.textContent?.includes("John Doe"));
    if (johnOption) {
      await user.click(johnOption);
    }

    const dialog = screen.getByRole("dialog");
    const submitButton = within(dialog).getByRole("button", {
      name: /^create group$/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Creation failed",
          text: "Failed to create group",
        })
      );
    });
  });

  it("updates an existing group", async () => {
    const updateSpy = vi.spyOn(groupApi, "updateGroup").mockResolvedValue({});
    const onRefresh = vi.fn();

    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    renderForm({ group: mockGroup, onRefresh });

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const nameInput = await screen.findByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Group");

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        mockGroup.id,
        expect.objectContaining({
          name: "Updated Group",
        })
      );
    });

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "success",
        title: "Group updated",
      })
    );

    expect(onRefresh).toHaveBeenCalled();
  });

  // 新增测试：更改 leadUserId 且新 leader 不是成员（覆盖 119-126 行）
  it("adds new leader to group when changing leadUserId to non-member", async () => {
    vi.spyOn(groupApi, "updateGroup").mockResolvedValue({});
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue(mockMembers); // Only user_001
    const addMembersSpy = vi
      .spyOn(groupApi, "addMembersToGroup")
      .mockResolvedValue({});
    const onRefresh = vi.fn();

    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    renderForm({ group: mockGroup, onRefresh });

    await user.click(screen.getByRole("button", { name: /edit/i }));
    await screen.findByRole("dialog");

    // 更改 lead user 到 user_002 (not in current members)
    const leadUserSelect = screen.getByRole("combobox");
    await user.click(leadUserSelect);

    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(0);
    });

    const janeOption = screen
      .getAllByRole("option")
      .find((opt) => opt.textContent?.includes("Jane Smith"));
    if (janeOption) {
      await user.click(janeOption);
    }

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(groupApi.getGroupMembers).toHaveBeenCalledWith(mockGroup.id);
      expect(addMembersSpy).toHaveBeenCalledWith(mockGroup.id, ["user_002"]);
    });

    expect(onRefresh).toHaveBeenCalled();
  });

  // 新增测试：更改 leadUserId 但新 leader 已经是成员
  it("does not add new leader if already a member", async () => {
    const membersWithJane: GroupMember[] = [
      ...mockMembers,
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

    vi.spyOn(groupApi, "updateGroup").mockResolvedValue({});
    vi.spyOn(groupApi, "getGroupMembers").mockResolvedValue(membersWithJane);
    const addMembersSpy = vi.spyOn(groupApi, "addMembersToGroup");
    const onRefresh = vi.fn();

    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    renderForm({ group: mockGroup, onRefresh });

    await user.click(screen.getByRole("button", { name: /edit/i }));
    await screen.findByRole("dialog");

    // 更改 lead user 到 user_002 (already in members)
    const leadUserSelect = screen.getByRole("combobox");
    await user.click(leadUserSelect);

    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(0);
    });

    const janeOption = screen
      .getAllByRole("option")
      .find((opt) => opt.textContent?.includes("Jane Smith"));
    if (janeOption) {
      await user.click(janeOption);
    }

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(groupApi.getGroupMembers).toHaveBeenCalledWith(mockGroup.id);
    });

    // Should NOT call addMembersToGroup since user_002 is already a member
    expect(addMembersSpy).not.toHaveBeenCalled();
    expect(onRefresh).toHaveBeenCalled();
  });

  it("handles API errors gracefully", async () => {
    const error = new Error("Network error");
    vi.spyOn(groupApi, "updateGroup").mockRejectedValue(error);

    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    renderForm({ group: mockGroup });

    await user.click(screen.getByRole("button", { name: /edit/i }));

    await screen.findByRole("dialog");

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Test Group");

    const dialog = screen.getByRole("dialog");
    const submitButton = within(dialog).getByRole("button", {
      name: /save changes/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Update failed",
          text: "Network error",
        })
      );
    });
  });

  it("validates sort order is non-negative", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    renderForm();

    await user.click(screen.getByRole("button", { name: /create group/i }));

    const sortInput = await screen.findByLabelText(/sort order/i);

    await user.clear(sortInput);
    await user.type(sortInput, "-5");

    // HTML5 number input with min="0" and custom onChange will convert to 5
    expect(sortInput).toHaveValue(5);
  });

  // 新增测试：关闭对话框时重置表单（覆盖 215 行）
  it("resets form when dialog is closed", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    renderForm();

    // 打开对话框
    await user.click(screen.getByRole("button", { name: /^create group$/i }));
    await screen.findByRole("dialog");

    // 填写一些数据
    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, "Test Group");

    expect(nameInput).toHaveValue("Test Group");

    // 关闭对话框（点击 ESC 或外部）
    await user.keyboard("{Escape}");

    // 等待对话框关闭
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // 重新打开对话框
    await user.click(screen.getByRole("button", { name: /^create group$/i }));
    await screen.findByRole("dialog");

    // 表单应该被重置
    const nameInputAfterReopen = screen.getByLabelText(/name/i);
    expect(nameInputAfterReopen).toHaveValue("");
  });

  // 新增测试：使用自定义触发器标签
  it("renders with custom trigger label", () => {
    renderForm({ triggerLabel: "Add New Group" });

    expect(
      screen.getByRole("button", { name: "Add New Group" })
    ).toBeInTheDocument();
  });
});
