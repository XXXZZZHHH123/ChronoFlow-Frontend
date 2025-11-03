import { Link, useMatch } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { UserNav } from "./user-nav";
import BackButton from "../navigation/back-button";
import type { OrgEvent } from "@/lib/validation/schema";
import { getEventById } from "@/api/eventApi";

type NavbarProps = {
  brand?: React.ReactNode;
};

export function Navbar({ brand }: NavbarProps) {
  const match = useMatch("/event/:id/*");
  const onEventRoute = !!match;
  const eventId = match?.params.id;

  const [evt, setEvt] = useState<OrgEvent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!eventId) {
      setEvt(null);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const data = await getEventById(eventId);
        if (!cancelled) setEvt(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const brandNode = onEventRoute ? (
    <BackButton to="/events" label="Back to all events page" />
  ) : (
    brand ?? (
      <Link to="/" className="text-lg font-semibold tracking-tight">
        MyApp
      </Link>
    )
  );

  const centerNode = useMemo(() => {
    if (!onEventRoute) return null;

    const fmt = (d?: Date | null) =>
      d
        ? new Date(d).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "—";

    return (
      <div className="hidden sm:flex min-w-0 flex-col items-center text-center px-4">
        {loading ? (
          // simple skeleton
          <div className="h-5 w-56 rounded bg-muted animate-pulse" />
        ) : evt ? (
          <>
            <div className="max-w-[42ch] truncate font-medium">{evt.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {fmt(evt.startTime)} {evt.endTime ? "– " + fmt(evt.endTime) : ""}
            </div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground">Event</div>
        )}
      </div>
    );
  }, [onEventRoute, loading, evt]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-6 sm:px-8">
        {/* Left: Brand / Back */}
        {brandNode}

        {/* Center: Event info when on event page */}
        {centerNode}

        {/* Right: User */}
        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
