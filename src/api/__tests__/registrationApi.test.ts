import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  MemberCompleteRegistration,
  MemberLookup,
  OrganizerRegistration,
} from "@/lib/validation/schema";

const httpMock = vi.hoisted(() => ({
  post: vi.fn(),
})) as {
  post: ReturnType<typeof vi.fn>;
};

vi.mock("@/lib/http", () => ({
  http: httpMock,
}));

const httpPost = httpMock.post;

import {
  getTenantMemberInfo,
  registerMember,
  registerOrganizer,
} from "../registrationApi";

beforeEach(() => {
  httpPost.mockReset();
});

const okResponse = (data: unknown = true) => ({ data: { code: 0, data } });

describe("registrationApi registerOrganizer", () => {
  it("maps payload fields correctly", async () => {
    const input: OrganizerRegistration = {
      name: "Org Name",
      username: "organizer",
      user_password: "password123",
      user_email: "organizer@example.com",
      user_mobile: "88887777",
      organisation_name: "Org Inc",
      organisation_address: "123 Street",
    };

    httpPost.mockResolvedValueOnce(okResponse(true));

    const result = await registerOrganizer(input);

    expect(httpPost).toHaveBeenCalledWith("/system/reg/organizer", {
      name: "Org Name",
      username: "organizer",
      userPassword: "password123",
      userEmail: "organizer@example.com",
      mobile: "88887777",
      organizationName: "Org Inc",
      organizationAddress: "123 Street",
    });
    expect(result).toBe(true);
  });
});

describe("registrationApi registerMember", () => {
  it("maps member registration payload", async () => {
    const input: MemberCompleteRegistration = {
      user_id: "u-1",
      user_name: "member1",
      user_password: "password123",
      user_mobile: "99998888",
    };

    httpPost.mockResolvedValueOnce(okResponse(true));

    const result = await registerMember(input);

    expect(httpPost).toHaveBeenCalledWith("/system/reg/member", {
      userId: "u-1",
      username: "member1",
      password: "password123",
      phone: "99998888",
    });
    expect(result).toBe(true);
  });
});

describe("registrationApi getTenantMemberInfo", () => {
  it("parses and transforms response fields", async () => {
    const input: MemberLookup = {
      organisation_id: "org-1",
      user_id: "user-2",
    };

    httpPost.mockResolvedValueOnce(
      okResponse({
        organizationName: "Org Inc",
        email: "member@example.com",
      })
    );

    const result = await getTenantMemberInfo(input);

    expect(httpPost).toHaveBeenCalledWith("/system/reg/search", {
      organizationId: "org-1",
      userId: "user-2",
    });
    expect(result).toEqual({
      organization_name: "Org Inc",
      email: "member@example.com",
    });
  });
});
