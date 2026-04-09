import { ChevronRight, type LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Link } from "react-router";
import { Protected } from "@auth/components/Protected";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@components/ui/sidebar";

import type { ComponentType, SVGProps } from "react";

import type { TPermission } from "@permissions/interfaces/permission.type";
import { cn } from "@core/lib/utils";
import { useActiveRoute } from "@core/hooks/useActiveRoute";
import { useAuthStore } from "@auth/stores/auth.store";
import { useSettingsStore } from "@settings/stores/settings.store";

interface IProps {
  items: {
    icon?: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
    isActive?: boolean;
    items?: IItem[];
    permission: TPermission;
    role?: string | string[];
    title: string;
    url: string;
  }[];
}

interface IItem {
  icon?: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
  permission: TPermission;
  title: string;
  url: string;
}

export function NavMain({ items }: IProps) {
  const admin = useAuthStore((state) => state.admin);
  const { appSettings } = useSettingsStore();
  const { isActive, isParentActive } = useActiveRoute();
  const { state } = useSidebar();

  const showMenuIcons = appSettings.find((s) => s.key === "showMenuIcons")?.value === "true";
  const showMenuTooltips = appSettings.find((s) => s.key === "showTooltips")?.value === "true";

  const hasRoleAccess = (itemRole?: string | string[]) => {
    if (!itemRole) return true;
    if (admin?.role) {
      if (typeof itemRole === "string") return admin.role.value === itemRole;
      if (Array.isArray(itemRole)) return itemRole.includes(admin.role.value);
    }

    return false;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Aplicación</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          hasRoleAccess(item.role) && item.items ? (
            state === "collapsed" ? (
              // Menu with subitems
              <SidebarMenuItem key={item.title}>
                <Protected requiredPermission={item.permission}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        tooltip={showMenuTooltips ? item.title : undefined}
                        className={cn(
                          "group-data-[collapsible=icon]:mx-auto",
                          isParentActive(item.items) && "bg-sidebar-accent text-sidebar-accent-foreground",
                        )}
                      >
                        {item.icon && <item.icon />}
                        <span className="group-data-[collapsible=icon]:sr-only">{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[collapsible=icon]:sr-only" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="min-w-48">
                      {item.items.map((subItem) => (
                        <Protected requiredPermission={subItem.permission} key={subItem.title}>
                          <DropdownMenuItem
                            asChild
                            className={cn(
                              "text-sm",
                              isActive(subItem.url) && "bg-sidebar-accent text-sidebar-accent-foreground",
                            )}
                          >
                            <Link to={subItem.url}>
                              {showMenuIcons && subItem.icon && <subItem.icon />}
                              {subItem.title}
                            </Link>
                          </DropdownMenuItem>
                        </Protected>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Protected>
              </SidebarMenuItem>
            ) : (
              <Collapsible
                asChild
                className="group/collapsible"
                defaultOpen={isParentActive(item.items) || item.isActive}
                key={item.title}
              >
                <SidebarMenuItem>
                  <Protected requiredPermission={item.permission}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={cn("group-data-[collapsible=icon]:justify-center")}
                        tooltip={showMenuTooltips ? item.title : undefined}
                      >
                        {/* This show active main collapsible item in open mode (use in cn) */}
                        {/* isParentActive(item.items) && "bg-sidebar-accent text-sidebar-accent-foreground", */}
                        {showMenuIcons && item.icon && <item.icon />}
                        <span className="group-data-[collapsible=icon]:sr-only">{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[collapsible=icon]:sr-only group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </Protected>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <Protected requiredPermission={subItem.permission} key={subItem.title}>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                              <Link to={subItem.url}>
                                {showMenuIcons && subItem.icon && <subItem.icon />}
                                <span className={isActive(subItem.url) ? "font-medium" : ""}>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </Protected>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          ) : hasRoleAccess(item.role) ? (
            <Protected key={item.title} requiredPermission={item.permission}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="group-data-[collapsible=icon]:mx-auto"
                  isActive={isActive(item.url)}
                  tooltip={showMenuTooltips ? item.title : undefined}
                >
                  <Link to={item.url} className="group-data-[collapsible=icon]:justify-center">
                    {state === "collapsed" ? item.icon && <item.icon /> : showMenuIcons && item.icon && <item.icon />}
                    <span className="group-data-[collapsible=icon]:sr-only">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Protected>
          ) : null,
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
