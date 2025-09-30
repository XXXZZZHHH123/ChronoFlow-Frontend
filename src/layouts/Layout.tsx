import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebarToggle } from "@/hooks/system/useSideBarToggle";
import { Sidebar } from "@/components/side-bar/side-bar";
import { Navbar } from "@/components/nav-bar/bar";

export default function AppLayout() {
  const { isOpen, setIsOpen } = useSidebarToggle();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            // keep below modals (which are z-50), above backdrop
            "fixed inset-y-0 left-0 z-40 bg-card shadow-lg lg:relative lg:shadow-none",

            // mobile: slide in/out
            "w-64 -translate-x-full transition-transform duration-300 ease-in-out",
            isOpen && "translate-x-0",

            // desktop: no translate; collapsible width
            "lg:translate-x-0 lg:overflow-visible",
            "lg:transition-[width] lg:duration-300 lg:ease-in-out",
            isOpen ? "lg:w-60" : "lg:w-[90px]"
          )}
          aria-hidden={!isOpen ? true : undefined}
          aria-label="Sidebar"
        >
          <Sidebar />
        </aside>

        {/* Backdrop (mobile only). Below sidebar so it won't block taps on the sidebar */}
        <div
          className={cn(
            "fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 lg:hidden",
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          )}
          onClick={setIsOpen}
          aria-hidden="true"
        />

        {/* Main */}
        <div className="relative z-0 flex min-w-0 grow flex-col">
          <Navbar brand="Current user organisation name" />
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
