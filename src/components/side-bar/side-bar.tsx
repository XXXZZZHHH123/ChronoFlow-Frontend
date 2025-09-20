import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/side-bar/menu";
import { cn } from "@/lib/utils";
import { useSidebarToggle } from "@/hooks/system/useSideBarToggle";
import { SidebarToggle } from "./side-bar-toggle";

export function Sidebar() {
  const isOpen = useSidebarToggle((s) => s.isOpen);
  const setIsOpen = useSidebarToggle((s) => s.setIsOpen);

  return (
    <div className="relative h-screen w-full">
      <div className="absolute -right-4 top-2 z-[80] pointer-events-auto">
        <SidebarToggle isOpen={isOpen} onToggle={setIsOpen} />
      </div>
      <div className="flex h-full flex-col overflow-y-auto border-r px-3 py-4">
        <Button
          className={cn(
            "h-auto pb-4 transition-transform duration-300",
            isOpen ? "translate-x-0" : "translate-x-1"
          )}
          variant="link"
          asChild
        >
          <Link to="/">
            <h1
              className={cn(
                "text-lg font-bold whitespace-nowrap transition-[transform,opacity] duration-300",
                isOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-96 opacity-0"
              )}
            />
          </Link>
        </Button>
        <Menu isOpen={isOpen} />
      </div>
    </div>
  );
}
