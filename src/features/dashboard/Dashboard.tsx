import { KeyRound, LayoutDashboard, Package, Shield, ShieldPlus, UserRoundPlus, UsersRound } from "lucide-react";

import { ActionCard } from "@dashboard/components/ActionCard";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { ConfigButton } from "@dashboard/components/ConfigButton";
import { KeyRoundPlus } from "@components/icons/KeyRoundPlus";
import { LatestEvents } from "@dashboard/components/LatestEvents";
import { Link } from "react-router";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@auth/components/Protected";

import { useAuthStore } from "@auth/stores/auth.store";
import { usePermission } from "@permissions/hooks/usePermission";
import { useSettingsStore } from "@settings/stores/settings.store";

export default function Dashboard() {
  const showAdmin = usePermission(["admin-view", "admin-create"], "some");
  const showPermissions = usePermission(["permissions-view", "permissions-create"], "some");
  const showRoles = usePermission(["roles-view", "roles-create"], "some");
  const user = useAuthStore((state) => state.admin);
  const { dashboardSettings } = useSettingsStore();

  const showLinksAsCard = dashboardSettings.find((setting) => setting.key === "showLinksAsCard")?.value === "true";
  const showConfigButtons = dashboardSettings.find((setting) => setting.key === "showConfigButtons")?.value === "true";
  const showHelloMessage = dashboardSettings.find((setting) => setting.key === "showHelloMessage")?.value === "true";

  return (
    <div className="flex flex-col gap-10">
      {showHelloMessage && (
        <Card className="bg-accent mx-auto w-full gap-2 p-6 text-center lg:w-1/2">
          <h1 className="text-2xl font-semibold">
            Hola, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-lg font-medium">Bienvenido a tu panel de control</p>
        </Card>
      )}
      <PageHeader title="Panel de control" subtitle="Administra tu aplicación" />
      <div className="flex flex-col gap-8">
        <LatestEvents />
        {showAdmin && (
          <div className="grid grid-cols-4 items-center gap-8 lg:grid-cols-6 xl:grid-cols-8">
            <ActionCard
              asCard={showLinksAsCard}
              icon={UsersRound}
              permission={["admin-view", "patient-view", "professional-view"]}
              permissionMode="some"
              text="Usuarios"
            >
              <div className={showLinksAsCard ? "grid grid-cols-2 gap-3" : "flex flex-col gap-0"}>
                <Protected requiredPermission="admin-view">
                  <Button asChild size="xs" variant={showLinksAsCard ? "outline" : "link"}>
                    <Link to="/users/role/admin">Administradores</Link>
                  </Button>
                </Protected>
                <Protected requiredPermission="patient-view">
                  <Button asChild size="xs" variant={showLinksAsCard ? "outline" : "link"}>
                    <Link to="/users/role/patient">Pacientes</Link>
                  </Button>
                </Protected>
                <Protected requiredPermission="professional-view">
                  <Button asChild size="xs" variant={showLinksAsCard ? "outline" : "link"}>
                    <Link to="/users/role/professional">Profesionales</Link>
                  </Button>
                </Protected>
              </div>
            </ActionCard>
            <ActionCard
              asCard={showLinksAsCard}
              icon={UserRoundPlus}
              permission={["admin-create", "patient-create", "professional-create"]}
              permissionMode="some"
              text="Crear usuario"
              url="/users/create"
            />
          </div>
        )}
        {showRoles && (
          <div className="grid grid-cols-4 gap-8 lg:grid-cols-6 xl:grid-cols-8">
            <ActionCard asCard={showLinksAsCard} icon={Shield} permission="roles-view" text="Roles" url="/roles" />
            <ActionCard
              asCard={showLinksAsCard}
              icon={ShieldPlus}
              permission="roles-create"
              text="Crear rol"
              url="/roles/create"
            />
          </div>
        )}
        {showPermissions && (
          <div className="grid grid-cols-4 gap-8 lg:grid-cols-6 xl:grid-cols-8">
            <ActionCard
              asCard={showLinksAsCard}
              icon={KeyRound}
              permission="permissions-view"
              text="Permisos"
              url="/permissions"
            />
            <ActionCard
              asCard={showLinksAsCard}
              icon={KeyRoundPlus}
              permission="permissions-create"
              text="Crear permiso"
              url="/permissions/create"
            />
          </div>
        )}
        {showConfigButtons && (
          <div className="flex flex-col gap-3">
            <h1 className="font-semibold">Configuraciones</h1>
            <ul className="flex gap-3 pl-5">
              <li>
                <ConfigButton icon={Package} text="Aplicación" url="/settings/app" />
              </li>
              <li>
                <ConfigButton icon={LayoutDashboard} text="Notificaciones" url="/settings/notifications" />
              </li>
              <li>
                <ConfigButton icon={LayoutDashboard} text="Tablero" url="/settings/dashboard" />
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
