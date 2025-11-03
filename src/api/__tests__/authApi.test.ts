import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LoginUser } from "@/lib/validation/schema";
import type { AuthCredentials } from "@/lib/auth-type";

const httpMock = vi.hoisted(() => ({
  post: vi.fn(),
})) as {
  post: ReturnType<typeof vi.fn>;
};

vi.mock("@/lib/http", () => ({
  http: httpMock,
}));

const httpPost = httpMock.post;

import { login, logout, refresh } from "../authApi";
import { useAuthStore } from "@/stores/authStore";

const originalClear = useAuthStore.getState().clear;

beforeEach(() => {
  httpPost.mockReset();
  useAuthStore.setState({ user: null, clear: originalClear });
});

afterEach(() => {
  useAuthStore.setState({ user: null, clear: originalClear });
});

describe("authApi login", () => {
  it("calls login endpoint and persists returned user", async () => {
    const credentials: LoginUser = {
      username: "demo",
      password: "secret",
      remember: false,
    };

    const user: AuthCredentials["user"] = {
      id: "123",
      name: "Demo User",
      email: "demo@example.com",
      role: "organizer",
    };

    httpPost.mockResolvedValueOnce({
      data: { code: 0, data: { user } satisfies AuthCredentials },
    });

    const result = await login(credentials);

    expect(httpPost).toHaveBeenCalledWith(
      "/system/auth/login",
      credentials
    );
    expect(result).toEqual({ user });
    expect(useAuthStore.getState().user).toEqual(user);
  });
});

describe("authApi logout", () => {
  it("clears auth state when request succeeds", async () => {
    useAuthStore.setState({
      user: {
        id: "123",
        name: "User",
        email: "user@example.com",
        role: "organizer",
      },
    });

    const clearSpy = vi.fn(() => originalClear());
    useAuthStore.setState({ clear: clearSpy });

    httpPost.mockResolvedValueOnce({ data: { code: 0 } });

    await logout();

    expect(httpPost).toHaveBeenCalledWith("/system/auth/logout", {});
    expect(clearSpy).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("still clears auth state if request fails", async () => {
    useAuthStore.setState({
      user: {
        id: "456",
        name: "Another",
        email: "another@example.com",
        role: "member",
      },
    });

    const clearSpy = vi.fn(() => originalClear());
    useAuthStore.setState({ clear: clearSpy });

    httpPost.mockRejectedValueOnce(new Error("network down"));

    await logout();

    expect(clearSpy).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe("authApi refresh", () => {
  const makeRefreshResponse = (user?: AuthCredentials["user"]) => ({
    data: {
      data: user ? { user } : {},
    },
  });

  it("refreshes session and stores returned user", async () => {
    const user: AuthCredentials["user"] = {
      id: "789",
      name: "Refresh User",
      email: "refresh@example.com",
      role: "member",
    };

    httpPost.mockResolvedValueOnce(makeRefreshResponse(user));

    const result = await refresh();

    expect(result).toBe(true);
    expect(httpPost).toHaveBeenCalledWith("/system/auth/refresh", {});
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it("clears auth state and returns false when refresh fails", async () => {
    useAuthStore.setState({
      user: {
        id: "111",
        name: "Existing",
        email: "existing@example.com",
        role: "member",
      },
    });

    const clearSpy = vi.fn(() => originalClear());
    useAuthStore.setState({ clear: clearSpy });

    httpPost.mockRejectedValueOnce(new Error("expired"));

    const result = await refresh();

    expect(result).toBe(false);
    expect(clearSpy).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("reuses in-flight refresh promise", async () => {
    const user: AuthCredentials["user"] = {
      id: "246",
      name: "Concurrent User",
      email: "concurrent@example.com",
      role: "member",
    };

    let resolveRefresh: (value: unknown) => void = () => {};
    const refreshPromise = new Promise((resolve) => {
      resolveRefresh = resolve;
    });

    httpPost.mockReturnValueOnce(refreshPromise).mockResolvedValueOnce(
      makeRefreshResponse(user)
    );

    const firstCall = refresh();
    const secondCall = refresh();

    expect(firstCall).toBe(secondCall);
    resolveRefresh(makeRefreshResponse(user));

    await firstCall;

    expect(httpPost).toHaveBeenCalledTimes(1);
    // Subsequent refresh should trigger a new request.
    await refresh();
    expect(httpPost).toHaveBeenCalledTimes(2);
  });
});
