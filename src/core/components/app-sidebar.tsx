import {
  Briefcase,
  Calendar,
  GalleryVerticalEnd,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  Package,
  Plus,
  Settings,
  Shield,
  ShieldPlus,
  Store,
  User2,
  Users2,
} from "lucide-react";
import { KeyRoundPlus } from "@components/icons/KeyRoundPlus";
import { Patients } from "@components/icons/Patients";

import { NavActions } from "@components/nav-actions";
import { NavMain } from "@components/nav-main";
import { NavUser } from "@components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@components/ui/sidebar";
import { TeamSwitcher } from "@components/team-switcher";

import { useEffect, useRef, useState } from "react";
import { useSidebar } from "@components/ui/sidebar";

import type { TPermission } from "@permissions/interfaces/permission.type";
import { cn } from "@lib/utils";
import { useAuthStore } from "@auth/stores/auth.store";

const data = {
  teams: {
    name: "Calth",
    logo: GalleryVerticalEnd,
    version: "v 0.0.1",
    plan: "Free",
  },
  navMain: [
    {
      title: "Agenda",
      url: "/calendar",
      icon: Calendar,
      permission: "calendar-view" as TPermission,
    },
    {
      title: "Usuarios",
      url: "#",
      icon: Users2,
      items: [
        {
          title: "Administradores",
          url: "/users/role/admin",
          icon: User2,
          permission: "admin-view" as TPermission,
        },
        {
          title: "Pacientes",
          url: "/users/role/patient",
          icon: Patients,
          permission: "patient-view" as TPermission,
        },
        {
          title: "Profesionales",
          url: "/users/role/professional",
          icon: Briefcase,
          permission: "professional-view" as TPermission,
        },
      ],
      permission: "*" as TPermission,
      role: ["superadmin", "admin"],
    },
    {
      title: "Pacientes",
      url: "/users/role/patient",
      icon: Patients,
      permission: "patient-view" as TPermission,
      role: "professional",
    },
    {
      title: "Roles",
      url: "/roles",
      icon: Shield,
      permission: "roles-view" as TPermission,
    },
    {
      title: "Permisos",
      url: "/permissions",
      icon: KeyRound,
      permission: "permissions-view" as TPermission,
    },
    // TODO: set permission
    {
      title: "Tu negocio",
      url: "/business",
      icon: Store,
      permission: "*" as TPermission,
    },
    {
      title: "Configuraciones",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Tu negocio",
          url: "/settings/business",
          icon: Store,
          permission: "*" as TPermission,
        },
        {
          title: "Aplicación",
          url: "/settings/app",
          icon: Package,
          permission: "*" as TPermission,
        },
        {
          title: "Notificaciones",
          url: "/settings/notifications",
          icon: Megaphone,
          permission: "*" as TPermission,
        },
        {
          title: "Tablero",
          url: "/settings/dashboard",
          icon: LayoutDashboard,
          permission: "*" as TPermission,
        },
      ],
      permission: "settings-view" as TPermission,
    },
  ],
  navActions: [
    {
      name: "Crear paciente",
      url: "/users/create",
      icon: Plus,
      permission: "patient-create" as TPermission,
      state: { role: "patient" },
    },
    {
      name: "Crear profesional",
      url: "/users/create",
      icon: Plus,
      permission: "professional-create" as TPermission,
      state: { role: "professional" },
    },
    {
      name: "Crear rol",
      url: "/roles/create",
      icon: ShieldPlus,
      permission: "roles-create" as TPermission,
    },
    {
      name: "Crear permiso",
      url: "/permissions/create",
      icon: KeyRoundPlus,
      permission: "permissions-create" as TPermission,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const adminPermissions = useAuthStore(
    (state) =>
      state.admin?.role?.rolePermissions
        ?.filter((rp) => rp.permission !== null)
        ?.map((rp) => rp.permission?.actionKey)
        ?.sort()
        .join(",") || "",
  );

  const contentRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const { openMobile } = useSidebar();

  useEffect(() => {
    const checkScroll = () => {
      if (contentRef.current) {
        const hasVerticalScroll = contentRef.current.scrollHeight > contentRef.current.clientHeight;
        setHasScroll(hasVerticalScroll);
      }
    };

    checkScroll();

    const timeoutId1 = setTimeout(checkScroll, 100);

    window.addEventListener("resize", checkScroll);

    const resizeObserver = new ResizeObserver(checkScroll);
    const element = contentRef.current;
    if (element) {
      resizeObserver.observe(element);
    }

    return () => {
      clearTimeout(timeoutId1);
      window.removeEventListener("resize", checkScroll);
      resizeObserver.disconnect();
    };
  }, [adminPermissions, openMobile]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent
        ref={contentRef}
        className={cn(
          hasScroll && "shadow-[inset_0_6px_6px_-6px_rgba(0,0,0,0.1),inset_0_-6px_6px_-6px_rgba(0,0,0,0.1)]",
        )}
        key={adminPermissions}
      >
        <NavMain items={data.navMain} />
        <NavActions items={data.navActions} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
