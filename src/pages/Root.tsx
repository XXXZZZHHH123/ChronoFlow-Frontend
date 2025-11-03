import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function RootPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-6">
      {/* Logo / Heading */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Welcome to <span className="text-primary">ChronoFlow</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Your one-stop solution for lightweight, collaborative project and
          event management — designed for teams who value clarity,
          accountability, and flow.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-3 pt-2">
        <Button asChild size="lg">
          <Link to="/events">View Events</Link>
        </Button>
      </div>

      {/* Footer hint */}
      <p className="text-xs text-muted-foreground pt-6">
        ChronoFlow © {new Date().getFullYear()} — crafted for organized
        execution.
      </p>
    </main>
  );
}
