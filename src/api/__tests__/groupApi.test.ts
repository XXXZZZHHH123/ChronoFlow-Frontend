import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CreateGroupConfig,
  GroupConfig,
} from "@/lib/validation/schema";

const httpMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
})) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

vi.mock("@/lib/http", () => ({
  http: httpMock,
}));

const httpGet = httpMock.get;
const httpPost = httpMock.post;
const httpPut = httpMock.put;
const httpDelete = httpMock.delete;

import {
  addMemberToGroup,
  addMembersToGroup,
  createGroup,
  deleteGroup,
  getGroupMembers,
  getGroupsByEvent,
  removeMemberFromGroup,
  removeMembersFromGroup,
  updateGroup,
} from "../groupApi";

beforeEach(() => {
  httpGet.mockReset();
  httpPost.mockReset();
  httpPut.mockReset();
  httpDelete.mockReset();
});

const okResponse = (data: unknown = true) => ({ data: { code: 0, data } });

describe("groupApi getGroupsByEvent", () => {
  it("fetches groups for the given event", async () => {
    const groups = [{ id: "g1", name: "Team" }];
    httpGet.mockResolvedValueOnce(okResponse(groups));

    const result = await getGroupsByEvent("event-55");

    expect(httpGet).toHaveBeenCalledWith("/system/group/list?eventId=event-55");
    expect(result).toEqual(groups);
  });
});

describe("groupApi createGroup", () => {
  it("posts normalized payload", async () => {
    const input: CreateGroupConfig = {
      name: "Ops",
      eventId: "event-1",
      leadUserId: "",
      remark: undefined,
      sort: 2,
    };

    httpPost.mockResolvedValueOnce(okResponse({ id: "g-ops" }));

    const result = await createGroup(input);

    expect(httpPost).toHaveBeenCalledWith("/system/group/create", {
      name: "Ops",
      eventId: "event-1",
      leadUserId: null,
      remark: null,
      sort: 2,
    });
    expect(result).toEqual({ id: "g-ops" });
  });
});

describe("groupApi updateGroup", () => {
  it("puts payload with optional fields", async () => {
    const input: GroupConfig = {
      name: "New Name",
      leadUserId: null,
      remark: undefined,
      sort: 3,
      status: 1,
    };

    httpPut.mockResolvedValueOnce(okResponse({ updated: true }));

    const result = await updateGroup("group-1", input);

    expect(httpPut).toHaveBeenCalledWith("/system/group/update", {
      id: "group-1",
      name: "New Name",
      leadUserId: null,
      remark: null,
      sort: 3,
      status: 1,
    });
    expect(result).toEqual({ updated: true });
  });
});

describe("groupApi deleteGroup", () => {
  it("calls delete endpoint", async () => {
    httpDelete.mockResolvedValueOnce(okResponse(true));

    const result = await deleteGroup("group-9");

    expect(httpDelete).toHaveBeenCalledWith("/system/group/delete/group-9");
    expect(result).toBe(true);
  });
});

describe("groupApi member operations", () => {
  it("gets group members", async () => {
    const members = [{ userId: "u1" }];
    httpGet.mockResolvedValueOnce(okResponse(members));

    const result = await getGroupMembers("group-10");

    expect(httpGet).toHaveBeenCalledWith("/system/group/group-10/members");
    expect(result).toEqual(members);
  });

  it("adds single member to group", async () => {
    httpPost.mockResolvedValueOnce(okResponse({ ok: true }));

    const result = await addMemberToGroup("group-10", "user-20");

    expect(httpPost).toHaveBeenCalledWith(
      "/system/group/group-10/members/user-20"
    );
    expect(result).toEqual({ ok: true });
  });

  it("removes single member from group", async () => {
    httpDelete.mockResolvedValueOnce(okResponse({ ok: true }));

    const result = await removeMemberFromGroup("group-10", "user-20");

    expect(httpDelete).toHaveBeenCalledWith(
      "/system/group/group-10/members/user-20"
    );
    expect(result).toEqual({ ok: true });
  });

  it("adds members batch to group", async () => {
    httpPost.mockResolvedValueOnce(okResponse({ added: 2 }));

    const result = await addMembersToGroup("group-10", ["user-1", "user-2"]);

    expect(httpPost).toHaveBeenCalledWith(
      "/system/group/group-10/members/batch",
      { userIds: ["user-1", "user-2"] }
    );
    expect(result).toEqual({ added: 2 });
  });

  it("removes members batch from group", async () => {
    httpDelete.mockResolvedValueOnce(okResponse({ removed: 2 }));

    const result = await removeMembersFromGroup("group-10", [
      "user-1",
      "user-2",
    ]);

    expect(httpDelete).toHaveBeenCalledWith(
      "/system/group/group-10/members/batch",
      { data: ["user-1", "user-2"] }
    );
    expect(result).toEqual({ removed: 2 });
  });
});
