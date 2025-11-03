import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGroups } from "../useGroups";
import * as groupApi from "@/api/groupApi";
import type { Group } from "@/lib/validation/schema";

const mockGroups: Group[] = [
  {
    id: "grp_001",
    name: "Marketing Team",
    sort: 0,
    leadUserId: "user_001",
    leadUserName: "John Doe",
    remark: null,
    status: 0,
    statusName: "Active",
    eventId: "evt_001",
    eventName: "Annual Conference",
    memberCount: 5,
    createTime: new Date(),
    updateTime: new Date(),
  },
];

describe("useGroups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when no eventId provided", () => {
    const { result } = renderHook(() => useGroups(null, false));

    expect(result.current.groups).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("fetches groups when autoFetch is true", async () => {
    const getSpy = vi
      .spyOn(groupApi, "getGroupsByEvent")
      .mockResolvedValue(mockGroups);

    const { result } = renderHook(() => useGroups("evt_001", true));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getSpy).toHaveBeenCalledWith("evt_001");
    expect(result.current.groups).toEqual(mockGroups);
    expect(result.current.error).toBeNull();
  });

  it("does not fetch when autoFetch is false", () => {
    const getSpy = vi.spyOn(groupApi, "getGroupsByEvent");

    renderHook(() => useGroups("evt_001", false));

    expect(getSpy).not.toHaveBeenCalled();
  });

  it("handles API errors", async () => {
    const error = new Error("Failed to load groups");
    vi.spyOn(groupApi, "getGroupsByEvent").mockRejectedValue(error);

    const { result } = renderHook(() => useGroups("evt_001", true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load groups");
    expect(result.current.groups).toEqual([]);
  });

  it("refreshes groups when onRefresh is called", async () => {
    const getSpy = vi
      .spyOn(groupApi, "getGroupsByEvent")
      .mockResolvedValue(mockGroups);

    const { result } = renderHook(() => useGroups("evt_001", true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    getSpy.mockClear();

    await result.current.onRefresh();

    expect(getSpy).toHaveBeenCalledWith("evt_001");
  });

  it("updates when eventId changes", async () => {
    const getSpy = vi
      .spyOn(groupApi, "getGroupsByEvent")
      .mockResolvedValue(mockGroups);

    const { result, rerender } = renderHook(
      ({ eventId }) => useGroups(eventId, true),
      { initialProps: { eventId: "evt_001" } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getSpy).toHaveBeenCalledWith("evt_001");

    getSpy.mockClear();

    rerender({ eventId: "evt_002" });

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith("evt_002");
    });
  });
});
