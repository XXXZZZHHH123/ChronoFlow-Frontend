import { describe, expect, it } from "vitest";
import type { Role } from "@/lib/validation/schema";
import {
  ALL_PERMISSION_ID,
  buildRoleOptions,
  getAllRoleKeys,
  getRoleKeysByIds,
} from "../role";

const sampleRoles: Role[] = [
  {
    id: "1",
    name: "Administrator",
    key: "ADMIN",
    permissions: null,
    isDefault: false,
  },
  {
    id: "2",
    name: "Member",
    key: "MEMBER",
    permissions: null,
    isDefault: true,
  },
] as Role[];

describe("services/role buildRoleOptions", () => {
  it("maps roles to label options using role key", () => {
    expect(buildRoleOptions(sampleRoles)).toEqual([
      { id: "1", label: "ADMIN" },
      { id: "2", label: "MEMBER" },
    ]);
  });
});

describe("services/role getAllRoleKeys", () => {
  it("returns array of all role keys", () => {
    expect(getAllRoleKeys(sampleRoles)).toEqual(["ADMIN", "MEMBER"]);
  });
});

describe("services/role getRoleKeysByIds", () => {
  it("resolves IDs to labels using options", () => {
    const options = buildRoleOptions(sampleRoles);
    expect(getRoleKeysByIds(["1", "2"], options)).toEqual(["ADMIN", "MEMBER"]);
  });

  it("deduplicates values and ignores unknown ids", () => {
    const options = buildRoleOptions(sampleRoles);
    expect(getRoleKeysByIds(["1", "1", "missing"], options)).toEqual(["ADMIN"]);
  });

  it("returns empty array when no ids provided", () => {
    expect(getRoleKeysByIds()).toEqual([]);
  });
});

describe("services/role constants", () => {
  it("exposes all permission identifier", () => {
    expect(ALL_PERMISSION_ID).toBe("1971465366969307147");
  });
});
