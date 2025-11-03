import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EventConfig } from "@/lib/validation/schema";

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
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from "../eventApi";

beforeEach(() => {
  httpGet.mockReset();
  httpPost.mockReset();
  httpPatch.mockReset();
  httpDelete.mockReset();
});

describe("eventApi getEvents", () => {
  it("returns parsed event list", async () => {
    const rawEvents = [
      {
        id: "e1",
        name: "Launch Day",
        description: null,
        location: "HQ",
        status: 0,
        startTime: "2024-05-01T09:00:00Z",
        endTime: "2024-05-01T17:00:00Z",
        remark: null,
        joiningParticipants: 10,
        groups: [],
        taskStatus: { total: 5, remaining: 1, completed: 4 },
      },
    ];

    httpGet.mockResolvedValueOnce({
      data: { code: 0, data: rawEvents },
    });

    const events = await getEvents();

    expect(httpGet).toHaveBeenCalledWith("/system/events");
    expect(events[0].startTime).toBeInstanceOf(Date);
    expect(events[0].name).toBe("Launch Day");
  });
});

describe("eventApi createEvent", () => {
  const baseConfig: EventConfig = {
    name: "Workshop",
    description: null,
    location: "Auditorium",
    startTime: new Date("2024-06-01T09:30:45.321Z"),
    endTime: new Date("2024-06-01T12:00:45.987Z"),
    remark: "Bring laptops",
  };

  it("posts formatted payload without milliseconds", async () => {
    httpPost.mockResolvedValueOnce({ data: { code: 0, data: { id: "evt" } } });

    const response = await createEvent(baseConfig);

    expect(httpPost).toHaveBeenCalledTimes(1);
    const [, payload] = httpPost.mock.calls[0];

    expect(payload).toMatchObject({
      name: "Workshop",
      startTime: "2024-06-01T09:30:45Z",
      endTime: "2024-06-01T12:00:45Z",
      remark: "Bring laptops",
    });
    expect(payload.description).toBeUndefined();
    expect(response).toEqual({ id: "evt" });
  });

  it("throws if required times are missing", async () => {
    const invalidConfig = {
      ...baseConfig,
      startTime: undefined,
    } as unknown as EventConfig;

    await expect(createEvent(invalidConfig)).rejects.toThrow(
      "Start time and end time are required"
    );
    expect(httpPost).not.toHaveBeenCalled();
  });
});

describe("eventApi updateEvent", () => {
  const config: EventConfig = {
    name: "Updated",
    description: "Details",
    location: "Hall",
    startTime: new Date("2024-07-01T10:00:00Z"),
    endTime: new Date("2024-07-01T12:00:00Z"),
    remark: null,
  };

  it("patches event payload", async () => {
    httpPatch.mockResolvedValueOnce({ data: { code: 0, data: { ok: true } } });

    const data = await updateEvent("event-1", config);

    expect(httpPatch).toHaveBeenCalledWith(
      "/system/events/event-1",
      expect.objectContaining({
        name: "Updated",
        startTime: "2024-07-01T10:00:00Z",
      })
    );
    expect(data).toEqual({ ok: true });
  });
});

describe("eventApi deleteEvent", () => {
  it("calls delete endpoint", async () => {
    httpDelete.mockResolvedValueOnce({ data: { code: 0, data: true } });

    const result = await deleteEvent("event-2");

    expect(httpDelete).toHaveBeenCalledWith("/system/events/event-2");
    expect(result).toBe(true);
  });
});
