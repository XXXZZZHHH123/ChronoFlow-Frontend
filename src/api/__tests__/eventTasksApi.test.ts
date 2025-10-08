import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EventTaskConfig } from "@/lib/validation/schema";

const httpMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
})) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

vi.mock("@/lib/http", () => ({
  http: httpMock,
}));

const httpGet = httpMock.get;
const httpPost = httpMock.post;
const httpPatch = httpMock.patch;

import {
  createEventTask,
  deleteEventTaskSample,
  getAssignableMembers,
  getEventTasks,
  updateEventTask,
  updateEventTaskSample,
} from "../eventTasksApi";

beforeEach(() => {
  httpGet.mockReset();
  httpPost.mockReset();
  httpPatch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const okResponse = (data: unknown = true) => ({ data: { code: 0, data } });

describe("eventTasksApi getEventTasks", () => {
  it("returns mock tasks for provided event", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const tasks = await getEventTasks("event-100");

    expect(logSpy).toHaveBeenCalledWith(
      "Fetching tasks for event ID:",
      "event-100"
    );
    expect(tasks).toHaveLength(3);
    expect(tasks[0].name).toBe("Speaker Coordination");
  });
});

describe("eventTasksApi createEventTask", () => {
  it("posts event task config", async () => {
    const config: EventTaskConfig = {
      id: undefined,
      name: "Arrange Venue",
      description: null,
      status: 1,
      startTime: null,
      endTime: null,
      assignedUserId: null,
    };

    httpPost.mockResolvedValueOnce(okResponse({ id: "task-1" }));

    const result = await createEventTask("event-1", config);

    expect(httpPost).toHaveBeenCalledWith(
      "/system/task/event-1",
      config
    );
    expect(result).toEqual({ id: "task-1" });
  });
});

describe("eventTasksApi updateEventTask", () => {
  it("patches event task config", async () => {
    const config: EventTaskConfig = {
      id: "task-2",
      name: "Update Agenda",
      description: "Outline",
      status: 2,
      startTime: "2024-01-01T10:00:00Z",
      endTime: null,
      assignedUserId: "user-1",
    };

    httpPatch.mockResolvedValueOnce(okResponse({ updated: true }));

    const result = await updateEventTask("event-2", "task-2", config);

    expect(httpPatch).toHaveBeenCalledWith(
      "/system/task/event-2/task-2",
      config
    );
    expect(result).toEqual({ updated: true });
  });
});

describe("eventTasksApi getAssignableMembers", () => {
  it("parses assignable members payload", async () => {
    const raw = [
      {
        id: "group-1",
        name: "Volunteers",
        members: [
          { id: "user-10", username: "user10" },
          { id: "user-11", username: "user11" },
        ],
      },
    ];

    httpGet.mockResolvedValueOnce(okResponse(raw));

    const result = await getAssignableMembers("event-3");

    expect(httpGet).toHaveBeenCalledWith(
      "/system/events/event-3/assignable-members"
    );
    expect(result[0].members[1].username).toBe("user11");
  });
});

describe("eventTasksApi sample helpers", () => {
  it("logs delete sample to console", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await deleteEventTaskSample();

    expect(logSpy).toHaveBeenCalledWith("deleted");
  });

  it("logs update sample to console", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await updateEventTaskSample();

    expect(logSpy).toHaveBeenCalledWith("updated");
  });
});
