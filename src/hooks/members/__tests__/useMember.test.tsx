import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

vi.mock("@/api/memberApi", () => ({ getMembers: vi.fn() }));
vi.mock("@/stores/authStore", () => ({ useAuthStore: vi.fn() }));

import { getMembers } from "@/api/memberApi";
import { useAuthStore } from "@/stores/authStore";
import { useMembers } from "../useMember";

const mockedGetMembers = vi.mocked(getMembers);
const mockedUseAuthStore = vi.mocked(useAuthStore);

const makeWrapper = (client: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
});

afterEach(() => {
  queryClient.clear();
  vi.clearAllMocks();
});

describe("useMembers", () => {
  it("does not fetch when no user and autoFetch=false (default)", async () => {
    mockedUseAuthStore.mockReturnValue({ user: null });

    const { result } = renderHook(() => useMembers(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(mockedGetMembers).not.toHaveBeenCalled();
    expect(result.current.members).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("exposes error when getMembers rejects", async () => {
    mockedUseAuthStore.mockReturnValue({ user: { id: "u2" } });
    mockedGetMembers.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useMembers(true), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toMatch(/boom/);
    });

    expect(result.current.members).toEqual([]);
  });

  it("onRefresh invalidates the correct query key for the logged-in user", async () => {
    mockedUseAuthStore.mockReturnValue({ user: { id: "u3" } });

    const spy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useMembers(false), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.onRefresh();

    expect(spy).toHaveBeenCalledWith({ queryKey: ["members", "u3"] });
  });
});
