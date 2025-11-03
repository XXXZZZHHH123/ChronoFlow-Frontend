import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosError, AxiosRequestHeaders } from "axios";
import { useAuthStore } from "@/stores/authStore";

vi.mock("@/api/authApi", () => ({
  refresh: vi.fn(),
}));

import { refresh } from "@/api/authApi";
import { http } from "../http";

const originalStore = useAuthStore.getState();
const originalClear = originalStore.clear;
const originalSetAuth = originalStore.setAuth;

type RetriableAxiosConfig = {
  url?: string;
  _retry?: boolean;
  headers: AxiosRequestHeaders;
  [key: string]: unknown;
};

type RetriableAxiosError = AxiosError & {
  config: RetriableAxiosConfig;
};

const createRetriableError = (
  status: number,
  configOverrides: Partial<RetriableAxiosConfig> = {}
): RetriableAxiosError => {
  const config: RetriableAxiosConfig = {
    headers: {} as AxiosRequestHeaders,
    ...configOverrides,
  };

  return {
    response: { status } as AxiosError["response"],
    config,
  } as RetriableAxiosError;
};

const getRejectedInterceptor = () => {
  const handlers =
    (http.interceptors.response as unknown as { handlers: unknown[] }).handlers;
  if (!handlers || handlers.length === 0) {
    throw new Error("Response interceptor not registered");
  }
  const handler = handlers[handlers.length - 1] as {
    rejected: (error: RetriableAxiosError) => Promise<unknown>;
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
    const error = createRetriableError(500);

    await expect(rejected(error)).rejects.toBe(error);
  });

  it("clears store and rejects when login path fails with 401", async () => {
    const rejected = getRejectedInterceptor();
    const clearSpy = vi.fn(() => useAuthStore.setState({ user: null }));
    useAuthStore.setState({ clear: clearSpy });
    const refreshMock = vi.mocked(refresh);

    const error = createRetriableError(401, {
      url: "/system/auth/login",
      _retry: false,
    });

    await expect(rejected(error)).rejects.toBe(error);

    expect(clearSpy).toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("does not retry when _retry flag is already set", async () => {
    const rejected = getRejectedInterceptor();
    const refreshMock = vi.mocked(refresh);

    const error = createRetriableError(401, {
      url: "/secure/data",
      _retry: true,
    });

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

    const error = createRetriableError(401, {
      url: "/secure/data",
      _retry: false,
    });

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

    const error = createRetriableError(401, {
      url: "/secure/data",
      _retry: false,
    });

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
