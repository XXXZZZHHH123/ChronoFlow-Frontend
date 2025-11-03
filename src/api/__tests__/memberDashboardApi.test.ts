import { beforeEach, describe, expect, it, vi } from "vitest";

const httpMock = vi.hoisted(() => ({
  get: vi.fn(),
})) as {
  get: ReturnType<typeof vi.fn>;
};

vi.mock("@/lib/http", () => ({
  http: httpMock,
}));

const httpGet = httpMock.get;

import { getMemberDashboard } from "../memberDashBoardApi";

beforeEach(() => {
  httpGet.mockReset();
});

describe("memberDashBoardApi getMemberDashboard", () => {
  it("fetches dashboard data and parses schema", async () => {
    const responseBody = {
      member: {
        id: "m-1",
        username: "member1",
        name: "Member One",
        email: "member1@example.com",
        phone: null,
        status: 1,
        createTime: "2024-01-01T00:00:00Z",
        updateTime: "2024-02-01T00:00:00Z",
      },
      groups: [
        {
          id: "g-1",
          name: "Group One",
          sort: 1,
          leadUserId: null,
          leadUserName: null,
          remark: null,
          status: 0,
          event: {
            id: "e-1",
            name: "Event One",
            description: null,
          organizerId: null,
          location: "HQ",
          status: 0,
          startTime: "2024-03-01T10:00:00Z",
          endTime: "2024-03-01T12:00:00Z",
          remark: null,
          joiningParticipants: 5,
          groups: [],
            taskStatus: { total: 5, remaining: 2, completed: 3 },
          },
        },
      ],
      tasks: [
        {
          id: "t-1",
          name: "Prepare slides",
          description: null,
          status: 0,
          startTime: "2024-03-01T10:00:00Z",
          endTime: null,
          remark: null,
          createTime: "2024-02-20T08:00:00Z",
          updateTime: "2024-02-21T08:00:00Z",
          assignedUser: null,
          event: {
            id: "e-1",
            name: "Event One",
            description: null,
            organizerId: null,
            location: "HQ",
            status: 0,
            startTime: "2024-03-01T10:00:00Z",
            endTime: "2024-03-01T12:00:00Z",
            remark: null,
            joiningParticipants: 5,
            groups: [],
            taskStatus: { total: 5, remaining: 2, completed: 3 },
          },
        },
      ],
    };

    httpGet.mockResolvedValueOnce({
      data: { code: 0, data: responseBody },
    });

    const result = await getMemberDashboard();

    expect(httpGet).toHaveBeenCalledWith("/system/task/dashboard");
    expect(result.member.id).toBe("m-1");
    expect(result.groups).toHaveLength(1);
    expect(result.tasks[0].createTime).toBeInstanceOf(Date);
  });
});
