import { LogOut, User, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { logout } from "@/api/authApi";

export function UserNav() {
  const { user } = useAuthStore();

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-4 bg-white border-2 hover:bg-zinc-100 p-2 outline-none rounded-md">
                <User size={30} />
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none mr-auto truncate max-w-[20vw]">
                    {user?.name ? user.name : ""}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground mr-auto truncate max-w-[20vw]">
                    [{user?.role}]
                  </p>
                </div>
                <ChevronDown size={20} />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:cursor-pointer" onClick={logout}>
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
