import { BadgeCheck, Ellipsis, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Link } from "react-router";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@components/ui/sidebar";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { AuthService } from "@auth/services/auth.service";
import { useAuthStore } from "@auth/stores/auth.store";

export function NavUser() {
  const navigate = useNavigate();
  const { admin, clearAdmin } = useAuthStore();
  const { isMobile } = useSidebar();

  const { mutate: logout } = useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: () => AuthService.logout(),
    onSuccess: (response) => {
      if (response.statusCode === 200) {
        toast.success(response.message);
      }
    },
    onSettled: () => {
      clearAdmin();
      navigate("/");
    },
  });

  if (!admin) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              key={admin.updatedAt}
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mx-auto"
            >
              <div className="flex flex-1 items-center gap-2 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="flex size-6 items-center justify-center rounded-full bg-gray-400 p-1 text-sm font-semibold text-white">
                  {admin?.role?.name.charAt(0)}
                </span>
                <div className="grid">
                  <span className="truncate font-medium">{admin?.userName}</span>
                  <span className="truncate text-xs">{admin?.role?.name}</span>
                </div>
              </div>
              <Ellipsis className="ml-auto size-4 group-data-[collapsible=icon]:mx-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <Link to="/account">
                <DropdownMenuItem>
                  <BadgeCheck />
                  Mi cuenta
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut />
              Salir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
