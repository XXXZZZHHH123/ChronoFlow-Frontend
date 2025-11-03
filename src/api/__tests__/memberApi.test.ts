import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MemberConfig } from "@/lib/validation/schema";

const httpMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
})) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

vi.mock("@/lib/http", () => ({
  http: httpMock,
}));

const httpGet = httpMock.get;
const httpPost = httpMock.post;
const httpPatch = httpMock.patch;
const httpDelete = httpMock.delete;

import {
  createMember,
  deleteMember,
  getMembers,
  updateMember,
  uploadMembersExcel,
} from "../memberApi";

beforeEach(() => {
  httpGet.mockReset();
  httpPost.mockReset();
  httpPatch.mockReset();
  httpDelete.mockReset();
});

const okResponse = (data: unknown = true) => ({ data: { code: 0, data } });

describe("memberApi getMembers", () => {
  it("returns parsed member list", async () => {
    const rawMembers = [
      {
        id: "m1",
        name: null,
        email: "member@example.com",
        phone: null,
        roles: ["member"],
        registered: true,
      },
    ];

    httpGet.mockResolvedValueOnce(okResponse(rawMembers));

    const result = await getMembers();

    expect(httpGet).toHaveBeenCalledWith("/organizer/users");
    expect(result[0].email).toBe("member@example.com");
  });
});

describe("memberApi uploadMembersExcel", () => {
  it("posts form data with file attachment", async () => {
    const file = new File(["demo"], "members.xlsx");
    httpPost.mockResolvedValueOnce(okResponse({ uploaded: 1 }));

    const result = await uploadMembersExcel(file);

    expect(httpPost).toHaveBeenCalledWith(
      "/organizer/users/bulk-upsert",
      expect.any(FormData),
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    const formData = httpPost.mock.calls[0][1] as FormData;
    const appendedFile = formData.get("file");
    expect(appendedFile).toBeInstanceOf(File);
    expect((appendedFile as File).name).toBe(file.name);
    expect(result).toEqual({ uploaded: 1 });
  });
});

describe("memberApi createMember", () => {
  it("creates member with normalized payload", async () => {
    const config: MemberConfig = {
      email: "new@example.com",
      roleIds: ["role-1"],
      remark: undefined,
    };

    httpPost.mockResolvedValueOnce(okResponse({ id: "member-1" }));

    const response = await createMember(config);

    expect(httpPost).toHaveBeenCalledWith(
      "/organizer/create/user",
      {
        email: "new@example.com",
        roleIds: ["role-1"],
      }
    );
    expect(response).toEqual({ id: "member-1" });
  });
});

describe("memberApi updateMember", () => {
  it("patches member with remark", async () => {
    const config: MemberConfig = {
      email: "update@example.com",
      roleIds: ["role-2"],
      remark: "Important",
    };

    httpPatch.mockResolvedValueOnce(okResponse({ updated: true }));

    const result = await updateMember("member-9", config);

    expect(httpPatch).toHaveBeenCalledWith(
      "/organizer/update/user/member-9",
      {
        email: "update@example.com",
        roleIds: ["role-2"],
        remark: "Important",
      }
    );
    expect(result).toEqual({ updated: true });
  });
});

describe("memberApi deleteMember", () => {
  it("removes member by id", async () => {
    httpDelete.mockResolvedValueOnce(okResponse(true));

    const result = await deleteMember("member-5");

    expect(httpDelete).toHaveBeenCalledWith("/organizer/delete/user/member-5");
    expect(result).toBe(true);
  });
});
