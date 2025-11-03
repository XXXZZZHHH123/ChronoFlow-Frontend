import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RoleConfig, RoleAssign } from "@/lib/validation/schema";

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
  assignRole,
  createRole,
  deleteRole,
  getSystemRoles,
  updateRole,
} from "../roleApi";

beforeEach(() => {
  httpGet.mockReset();
  httpPost.mockReset();
  httpPatch.mockReset();
  httpDelete.mockReset();
});

const okResponse = (data: unknown = true) => ({ data: { code: 0, data } });

describe("roleApi getSystemRoles", () => {
  it("parses role response", async () => {
    const raw = [
      {
        id: "r1",
        name: "Admin",
        isDefault: false,
        key: "admin",
        permissions: null,
      },
    ];
    httpGet.mockResolvedValueOnce(okResponse(raw));

    const result = await getSystemRoles();

    expect(httpGet).toHaveBeenCalledWith("/system/roles");
    expect(result[0].name).toBe("Admin");
  });
});

describe("roleApi createRole", () => {
  it("creates role and returns payload", async () => {
    const config: RoleConfig = {
      name: "Manager",
      key: "manager",
      permissions: ["perm-1"],
    };

    httpPost.mockResolvedValueOnce(okResponse({ id: "role-1" }));

    const result = await createRole(config);

    expect(httpPost).toHaveBeenCalledWith("/system/roles", config);
    expect(result).toEqual({ id: "role-1" });
  });
});

describe("roleApi updateRole", () => {
  it("updates target role", async () => {
    const config: RoleConfig = {
      name: "Support",
      key: "support",
      permissions: null,
    };

    httpPatch.mockResolvedValueOnce(okResponse({ updated: true }));

    const result = await updateRole("role-2", config);

    expect(httpPatch).toHaveBeenCalledWith("/system/roles/role-2", config);
    expect(result).toEqual({ updated: true });
  });
});

describe("roleApi deleteRole", () => {
  it("deletes role by id", async () => {
    httpDelete.mockResolvedValueOnce(okResponse(true));

    const result = await deleteRole("role-10");

    expect(httpDelete).toHaveBeenCalledWith("/system/roles/role-10");
    expect(result).toBe(true);
  });
});

describe("roleApi assignRole", () => {
  it("posts assign payload", async () => {
    const payload: RoleAssign = {
      userId: "user-1",
      roles: ["role-1", "role-2"],
    };

    httpPost.mockResolvedValueOnce(okResponse({ assigned: true }));

    const result = await assignRole(payload);

    expect(httpPost).toHaveBeenCalledWith("/system/roles/assign", payload);
    expect(result).toEqual({ assigned: true });
  });
});
