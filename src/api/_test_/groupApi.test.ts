import { describe, it, expect, vi, beforeEach } from "vitest";
import * as groupApi from "../groupApi";
import { http } from "@/lib/http";

vi.mock("@/lib/http");

describe("groupApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getGroupsByEvent", () => {
    it("fetches groups for an event", async () => {
      const mockData = {
        code: 0,
        data: [
          {
            id: "grp_001",
            name: "Team A",
            eventId: "evt_001",
          },
        ],
      };

      vi.mocked(http.get).mockResolvedValue({ data: mockData });

      const result = await groupApi.getGroupsByEvent("evt_001");

      expect(http.get).toHaveBeenCalledWith(
        "/system/group/list?eventId=evt_001"
      );
      expect(result).toEqual(mockData.data);
    });

    it("throws error when API returns error code", async () => {
      vi.mocked(http.get).mockResolvedValue({
        data: { code: 1, msg: "Failed to fetch groups" },
      });

      await expect(groupApi.getGroupsByEvent("evt_001")).rejects.toThrow(
        "Failed to fetch groups"
      );
    });
  });

  describe("createGroup", () => {
    it("creates a new group", async () => {
      const input = {
        name: "New Group",
        eventId: "evt_001",
        leadUserId: "user_001",
        remark: null,
        sort: 0,
      };

      vi.mocked(http.post).mockResolvedValue({
        data: { code: 0, data: { id: "grp_new" } },
      });

      const result = await groupApi.createGroup(input);

      expect(http.post).toHaveBeenCalledWith("/system/group/create", {
        name: "New Group",
        eventId: "evt_001",
        leadUserId: "user_001",
        remark: null,
        sort: 0,
      });

      expect(result).toEqual({ id: "grp_new" });
    });
  });

  describe("updateGroup", () => {
    it("updates an existing group", async () => {
      const input = {
        name: "Updated Group",
        leadUserId: "user_002",
        remark: "New remark",
        sort: 5,
        status: 0,
      };

      vi.mocked(http.put).mockResolvedValue({
        data: { code: 0, data: {} },
      });

      await groupApi.updateGroup("grp_001", input);

      expect(http.put).toHaveBeenCalledWith("/system/group/update", {
        id: "grp_001",
        name: "Updated Group",
        leadUserId: "user_002",
        remark: "New remark",
        sort: 5,
        status: 0,
      });
    });
  });

  describe("deleteGroup", () => {
    it("deletes a group", async () => {
      vi.mocked(http.delete).mockResolvedValue({
        data: { code: 0, data: {} },
      });

      await groupApi.deleteGroup("grp_001");

      expect(http.delete).toHaveBeenCalledWith("/system/group/delete/grp_001");
    });
  });

  // 新增：getGroupMembers 测试
  describe("getGroupMembers", () => {
    it("fetches members of a group", async () => {
      const mockData = {
        code: 0,
        data: [
          {
            id: "member_001",
            userId: "user_001",
            groupId: "grp_001",
            userName: "John Doe",
          },
          {
            id: "member_002",
            userId: "user_002",
            groupId: "grp_001",
            userName: "Jane Smith",
          },
        ],
      };

      vi.mocked(http.get).mockResolvedValue({ data: mockData });

      const result = await groupApi.getGroupMembers("grp_001");

      expect(http.get).toHaveBeenCalledWith("/system/group/grp_001/members");
      expect(result).toEqual(mockData.data);
    });

    it("throws error when API returns error code", async () => {
      vi.mocked(http.get).mockResolvedValue({
        data: { code: 1, msg: "Failed to fetch members" },
      });

      await expect(groupApi.getGroupMembers("grp_001")).rejects.toThrow(
        "Failed to fetch members"
      );
    });
  });

  // 新增：addMemberToGroup 测试
  describe("addMemberToGroup", () => {
    it("adds a single member to a group", async () => {
      vi.mocked(http.post).mockResolvedValue({
        data: { code: 0, data: { success: true } },
      });

      const result = await groupApi.addMemberToGroup("grp_001", "user_001");

      expect(http.post).toHaveBeenCalledWith(
        "/system/group/grp_001/members/user_001"
      );
      expect(result).toEqual({ success: true });
    });

    it("throws error when API returns error code", async () => {
      vi.mocked(http.post).mockResolvedValue({
        data: { code: 1, msg: "Member already exists" },
      });

      await expect(
        groupApi.addMemberToGroup("grp_001", "user_001")
      ).rejects.toThrow("Member already exists");
    });
  });

  // 新增：removeMemberFromGroup 测试
  describe("removeMemberFromGroup", () => {
    it("removes a single member from a group", async () => {
      vi.mocked(http.delete).mockResolvedValue({
        data: { code: 0, data: { success: true } },
      });

      const result = await groupApi.removeMemberFromGroup(
        "grp_001",
        "user_001"
      );

      expect(http.delete).toHaveBeenCalledWith(
        "/system/group/grp_001/members/user_001"
      );
      expect(result).toEqual({ success: true });
    });

    it("throws error when API returns error code", async () => {
      vi.mocked(http.delete).mockResolvedValue({
        data: { code: 1, msg: "Member not found" },
      });

      await expect(
        groupApi.removeMemberFromGroup("grp_001", "user_001")
      ).rejects.toThrow("Member not found");
    });
  });

  describe("addMembersToGroup", () => {
    it("adds multiple members to a group", async () => {
      vi.mocked(http.post).mockResolvedValue({
        data: { code: 0, data: {} },
      });

      await groupApi.addMembersToGroup("grp_001", ["user_001", "user_002"]);

      expect(http.post).toHaveBeenCalledWith(
        "/system/group/grp_001/members/batch",
        {
          userIds: ["user_001", "user_002"],
        }
      );
    });
  });

  describe("removeMembersFromGroup", () => {
    it("removes multiple members from a group", async () => {
      vi.mocked(http.delete).mockResolvedValue({
        data: { code: 0, data: {} },
      });

      await groupApi.removeMembersFromGroup("grp_001", [
        "user_001",
        "user_002",
      ]);

      expect(http.delete).toHaveBeenCalledWith(
        "/system/group/grp_001/members/batch",
        {
          data: ["user_001", "user_002"],
        }
      );
    });
  });
});
