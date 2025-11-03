import { Ellipsis, LogOut } from "lucide-react";
import { getMenuList } from "@/lib/menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import defaultGroup from "@/assets/default_group.png";
import { logout } from "@/api/authApi";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { CollapseMenuButton } from "./collapse-menu-button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useMemo } from "react";

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const menuList = useMemo(
    () => getMenuList(pathname, { hasUser: !!user }),
    [pathname, user]
  );

  async function handleLogoutClick() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="h-full w-full">
        <div className="w-full px-4 py-3">
          <div className="w-full h-20 rounded-md bg-muted/40 grid place-items-center">
            <img
              src={defaultGroup}
              alt="Default Group "
              width={100}
              height={100}
              className="object-contain border rounded"
            />
          </div>
        </div>
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-180px)] lg:min-h-[calc(100vh-32px-40px-180px)] items-start space-y-1 px-2">
          {menuList.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "pt-2" : "")} key={index}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="w-full flex justify-center items-center">
                        <Ellipsis className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2"></p>
              )}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus }, index) =>
                  submenus.length === 0 ? (
                    <div className="w-full" key={index}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={active ? "secondary" : "ghost"}
                              className="w-full justify-start h-10 mb-1"
                              asChild
                            >
                              <Link to={href}>
                                <span
                                  className={cn(isOpen === false ? "" : "mr-4")}
                                >
                                  <Icon size={18} />
                                </span>
                                <p
                                  className={cn(
                                    "max-w-[200px] truncate",
                                    isOpen === false
                                      ? "-translate-x-96 opacity-0"
                                      : "translate-x-0 opacity-100"
                                  )}
                                >
                                  {label}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === false && (
                            <TooltipContent side="right">
                              {label}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="w-full" key={index}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={active}
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  )
              )}
            </li>
          ))}

          <div className="w-full">
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    className="w-full justify-start h-10 mb-1"
                    onClick={handleLogoutClick}
                    asChild
                  >
                    <div className="bg-white hover:bg-zinc-100 cursor-pointer">
                      <span
                        className={cn(
                          "text-black",
                          isOpen === false ? "" : "mr-4"
                        )}
                      >
                        <LogOut size={18} />
                      </span>
                      <p
                        className={cn(
                          "max-w-[200px] truncate text-black",
                          isOpen === false
                            ? "-translate-x-96 opacity-0"
                            : "translate-x-0 opacity-100"
                        )}
                      >
                        Sign Out
                      </p>
                    </div>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">Sign Out</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </ul>
      </nav>
    </ScrollArea>
  );
}
