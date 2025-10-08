import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore";

vi.mock("@/api/authApi", () => ({
  refresh: vi.fn(),
}));

import { refresh } from "@/api/authApi";
import { http } from "../http";

const originalStore = useAuthStore.getState();
const originalClear = originalStore.clear;
const originalSetAuth = originalStore.setAuth;

const getRejectedInterceptor = () => {
  const handlers =
    (http.interceptors.response as unknown as { handlers: unknown[] }).handlers;
  if (!handlers || handlers.length === 0) {
    throw new Error("Response interceptor not registered");
  }
  const handler = handlers[handlers.length - 1] as {
    rejected: (error: AxiosError & { config: any }) => Promise<unknown>;
  };
  return handler.rejected;
};

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: { id: "u", name: "n", email: "e", role: "r" },
    clear: originalClear,
    setAuth: originalSetAuth,
  });
});

describe("http response interceptor", () => {
  it("bubbles errors that are not 401", async () => {
    const rejected = getRejectedInterceptor();
    const error = {
      response: { status: 500 },
      config: {},
    } as AxiosError;

    await expect(rejected(error)).rejects.toBe(error);
  });

  it("clears store and rejects when login path fails with 401", async () => {
    const rejected = getRejectedInterceptor();
    const clearSpy = vi.fn(() => useAuthStore.setState({ user: null }));
    useAuthStore.setState({ clear: clearSpy });
    const refreshMock = vi.mocked(refresh);

    const error = {
      response: { status: 401 },
      config: { url: "/system/auth/login", _retry: false },
    } as unknown as AxiosError & { config: { url: string; _retry?: boolean } };

    await expect(rejected(error)).rejects.toBe(error);

    expect(clearSpy).toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("does not retry when _retry flag is already set", async () => {
    const rejected = getRejectedInterceptor();
    const refreshMock = vi.mocked(refresh);

    const error = {
      response: { status: 401 },
      config: { url: "/secure/data", _retry: true },
    } as unknown as AxiosError & { config: { url: string; _retry?: boolean } };

    await expect(rejected(error)).rejects.toBe(error);
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("refreshes and retries request once on 401", async () => {
    const rejected = getRejectedInterceptor();
    const refreshMock = vi.mocked(refresh);
    refreshMock.mockResolvedValueOnce(true);

    const adapterMock = vi.fn().mockImplementation(async (config: unknown) => ({
      data: { ok: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }));
    const originalAdapter = http.defaults.adapter;
    http.defaults.adapter = adapterMock as typeof http.defaults.adapter;

    const error = {
      response: { status: 401 },
      config: { url: "/secure/data", _retry: false },
    } as unknown as AxiosError & {
      config: { url: string; _retry?: boolean };
    };

    try {
      const result = await rejected(error);

      expect(refreshMock).toHaveBeenCalledTimes(1);
      expect(adapterMock).toHaveBeenCalledTimes(1);
      expect(error.config._retry).toBe(true);
      expect(result).toMatchObject({
        data: { ok: true },
        status: 200,
        statusText: "OK",
      });
    } finally {
      http.defaults.adapter = originalAdapter;
    }
  });

  it("clears auth when refresh fails", async () => {
    const rejected = getRejectedInterceptor();
    const refreshMock = vi.mocked(refresh);
    refreshMock.mockResolvedValueOnce(false);

    const clearSpy = vi.fn(() => useAuthStore.setState({ user: null }));
    useAuthStore.setState({ clear: clearSpy });

    const error = {
      response: { status: 401 },
      config: { url: "/secure/data", _retry: false },
    } as unknown as AxiosError & {
      config: { url: string; _retry?: boolean };
    };

    await expect(rejected(error)).rejects.toBe(error);
    expect(clearSpy).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
  });
});

afterAll(() => {
  useAuthStore.setState({
    user: originalStore.user,
    clear: originalClear,
    setAuth: originalSetAuth,
  });
});
