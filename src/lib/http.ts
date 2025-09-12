import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth-store";
import { refresh } from "@/api/authApi";

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

export const http = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true,
});

http.defaults.xsrfCookieName = "XSRF-TOKEN";
http.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

const isLoginPath = (url?: string) => {
  if (!url) return false;
  const p = url.startsWith("http") ? new URL(url).pathname : url;
  return /^\/system\/auth\/login(\/|$)/.test(p);
};

http.interceptors.request.use((config) => {
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const response = error.response;
    const config = (error.config || {}) as RetriableConfig;

    if (!response || response.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    if (isLoginPath(config.url)) {
      useAuthStore.getState().clear();
      return Promise.reject(error);
    }

    config._retry = true;

    const ok = await refresh();

    if (!ok) {
      useAuthStore.getState().clear();
      return Promise.reject(error);
    }
    return http(config);
  }
);
