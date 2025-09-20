import { useEffect, useRef } from "react";
import { refresh } from "@/api/authApi";

type Options = {
  /** How often to attempt a session refresh (ms). Default: 10 minutes */
  intervalMs?: number;
  /** Whether to attempt a refresh once on mount (to auto-hydrate user from cookie). Default: true */
  runOnInit?: boolean;
  /** Minimum gap between refresh calls (ms) to avoid spamming. Default: 5 seconds */
  minIntervalMs?: number;
};

export function useSessionKeepAlive(options?: Options) {
  const intervalMs = options?.intervalMs ?? 10 * 60 * 1000; // 10 min
  const runOnInit = options?.runOnInit ?? true;
  const minIntervalMs = options?.minIntervalMs ?? 5_000;

  const inflightRef = useRef<Promise<boolean> | null>(null);
  const lastRefreshAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const refreshThrottled = async () => {
    const now = Date.now();
    if (now - lastRefreshAtRef.current < minIntervalMs) return false;

    if (!inflightRef.current) {
      inflightRef.current = refresh()
        .catch(() => false)
        .finally(() => {
          inflightRef.current = null;
          lastRefreshAtRef.current = Date.now();
        });
    }
    return inflightRef.current;
  };

  useEffect(() => {
    if (runOnInit) {
      void refreshThrottled();
    }

    const id = window.setInterval(() => {
      void refreshThrottled();
    }, Math.max(1_000, intervalMs));

    timerRef.current = id;

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, runOnInit, minIntervalMs]);
}
