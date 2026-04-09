import { AppSidebar } from "@components/app-sidebar";
import { BackButton } from "@components/ui/BackButton";
import { CreateEventSheet } from "@calendar/components/sheets/CreateEventSheet";
import { HeaderBreadcrumb } from "@components/Breadcrumb";
import { ModeToggle } from "@components/ModeToggle";
import { Outlet } from "react-router";
import { Separator } from "@components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@components/ui/sidebar";
import { ViewEventSheet } from "@calendar/components/sheets/ViewEventSheet";

export function MainLayout() {
  return (
    <>
      <SidebarProvider className="h-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex h-full flex-col overflow-hidden">
          <header className="light:shadow-lg light:shadow-white z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b pr-3 pl-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <HeaderBreadcrumb />
            </div>
            <div className="flex items-center gap-3">
              <ModeToggle />
              <BackButton />
            </div>
          </header>
          <div className="flex flex-1 flex-col overflow-y-auto p-8">
            <Outlet />
            <CreateEventSheet />
            <ViewEventSheet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
