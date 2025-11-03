import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";

const eventApiMocks = vi.hoisted(() => ({
  getEvents: vi.fn(),
})) as {
  getEvents: ReturnType<typeof vi.fn>;
};

vi.mock("@/api/eventApi", () => eventApiMocks);

import { useOrgEvents } from "../useOrgEvents";

const getEvents = eventApiMocks.getEvents;

const originalState = useAuthStore.getState();

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: null,
    setAuth: originalState.setAuth,
    clear: originalState.clear,
  });
});

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("useOrgEvents", () => {
  it("returns empty data when user is not logged in", () => {
    const queryClient = new QueryClient();
    const { result } = renderHook(() => useOrgEvents(true), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.events).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("fetches events when user exists and autoFetch enabled", async () => {
    const queryClient = new QueryClient();
    const wrapper = createWrapper(queryClient);

    useAuthStore.setState({
      user: {
        id: "user-1",
        name: "User One",
        email: "user@example.com",
        role: "organizer",
      },
    });

    getEvents.mockResolvedValueOnce([
      {
        id: "event-1",
        name: "Event 1",
        description: null,
        location: "HQ",
        status: 0,
        startTime: new Date(),
        endTime: null,
        remark: null,
        joiningParticipants: 0,
        groups: [],
        taskStatus: { total: 0, remaining: 0, completed: 0 },
      },
    ]);

    const { result } = renderHook(() => useOrgEvents(true), {
      wrapper,
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.error).toBeNull();
    expect(getEvents).toHaveBeenCalledTimes(1);
  });

  it("invalidates query when onRefresh is called and user present", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);

    useAuthStore.setState({
      user: {
        id: "user-2",
        name: "User Two",
        email: "user2@example.com",
        role: "organizer",
      },
    });

    const { result } = renderHook(() => useOrgEvents(), {
      wrapper,
    });

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["events", "user-2"],
    });
  });
});

afterAll(() => {
  useAuthStore.setState(originalState);
});
