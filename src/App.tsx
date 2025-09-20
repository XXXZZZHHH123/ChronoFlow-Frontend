import { RouterProvider } from "react-router-dom";
import router from "./router/route";
import { useEffect, useState } from "react";
import { refresh } from "./api/authApi";
import { useSessionKeepAlive } from "@/hooks/system/useSessionKeepAlive";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Hydrate user from cookie on app start
        await refresh();
      } catch {
        // ignore; user just isn't logged in
      }
      setReady(true);
    })();
  }, []);

  if (!ready) return null; // or a spinner/skeleton
  return <>{children}</>;
}

export default function App() {
  // Periodic session keep-alive; bootstrap already did the first refresh.
  useSessionKeepAlive({ intervalMs: 10 * 60 * 1000, runOnInit: true });

  return (
    <AuthBootstrap>
      <RouterProvider router={router} />
    </AuthBootstrap>
  );
}
