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

import { AuthService } from "@auth/services/auth.service";
import { tryCatch } from "@core/utils/try-catch";
import { useAuthStore } from "@auth/stores/auth.store";
import { useNavigate } from "react-router";

export function NavUser() {
  const { admin, clearAdmin } = useAuthStore();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  async function signOut() {
    const [response, error] = await tryCatch(AuthService.signOut());

    if (error) {
      toast.error(error.message);
      clearAdmin();
      navigate("/");

      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      clearAdmin();
      navigate("/");
    }
  }

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
            <DropdownMenuItem onClick={signOut}>
              <LogOut />
              Salir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
