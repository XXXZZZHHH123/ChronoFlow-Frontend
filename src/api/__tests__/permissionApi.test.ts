import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PermissionConfig } from "@/lib/validation/schema";

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
  createPermission,
  deletePermission,
  getPermissions,
  updatePermission,
} from "../permissionApi";

beforeEach(() => {
  httpGet.mockReset();
  httpPost.mockReset();
  httpPatch.mockReset();
  httpDelete.mockReset();
});

const okResponse = (data: unknown = true) => ({ data: { code: 0, data } });

describe("permissionApi getPermissions", () => {
  it("parses permissions list", async () => {
    const raw = [
      { id: "p1", name: "View", key: "view", description: "View items" },
    ];
    httpGet.mockResolvedValueOnce(okResponse(raw));

    const result = await getPermissions();

    expect(httpGet).toHaveBeenCalledWith("/system/permissions");
    expect(result[0].name).toBe("View");
  });
});

describe("permissionApi createPermission", () => {
  it("creates permission", async () => {
    const config: PermissionConfig = {
      name: "Edit",
      key: "edit",
      description: "Edit items",
    };
    httpPost.mockResolvedValueOnce(okResponse({ id: "p2" }));

    const result = await createPermission(config);

    expect(httpPost).toHaveBeenCalledWith("/system/permissions", config);
    expect(result).toEqual({ id: "p2" });
  });
});

describe("permissionApi updatePermission", () => {
  it("updates permission", async () => {
    const config: PermissionConfig = {
      name: "Delete",
      key: "delete",
      description: undefined,
    };
    httpPatch.mockResolvedValueOnce(okResponse({ updated: true }));

    const result = await updatePermission("perm-1", config);

    expect(httpPatch).toHaveBeenCalledWith(
      "/system/permissions/perm-1",
      config
    );
    expect(result).toEqual({ updated: true });
  });
});

describe("permissionApi deletePermission", () => {
  it("deletes permission", async () => {
    httpDelete.mockResolvedValueOnce(okResponse(true));

    const result = await deletePermission("perm-9");

    expect(httpDelete).toHaveBeenCalledWith("/system/permissions/perm-9");
    expect(result).toBe(true);
  });
});
