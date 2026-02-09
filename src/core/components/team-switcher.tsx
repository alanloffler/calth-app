import { Link } from "react-router";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@components/ui/sidebar";

import type { ElementType } from "react";

interface IProps {
  teams: {
    logo: ElementType;
    name: string;
    plan: string;
    version: string;
  };
}

export function TeamSwitcher({ teams }: IProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link to="/dashboard">
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mx-auto hover:cursor-pointer"
          >
            <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <teams.logo className="size-4 text-white" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{teams.name}</span>
              <div className="flex gap-2">
                <span className="truncate text-xs">{teams.version}</span>
                <span>-</span>
                <span className="truncate text-xs">{teams.plan}</span>
              </div>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
