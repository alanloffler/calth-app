import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import { Link } from "react-router";

import { matchRoutes, useLocation } from "react-router";
import { useEffect, useMemo, useState } from "react";

type BreadcrumbUrl = string | null | ((ctx: BreadcrumbContext) => string | null);

interface BreadcrumbRoute {
  path: string;
  paths: BreadcrumbPath[];
}

interface BreadcrumbPath {
  label: string | ((ctx: BreadcrumbContext) => string);
  url: BreadcrumbUrl;
}

interface BreadcrumbContext {
  params: Record<string, string>;
  state: any;
}

interface ResolvedCrumb {
  label: string;
  url: string | null;
  isLast: boolean;
}

const BREADCRUMB_ROUTES: BreadcrumbRoute[] = [
  {
    path: "/business",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Tu negocio", url: null },
    ],
  },
  {
    path: "/dashboard",
    paths: [{ label: "Inicio", url: null }],
  },
  {
    path: "/calendar",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Agenda", url: null },
    ],
  },
  {
    path: "/events",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Turnos", url: null },
    ],
  },
  {
    path: "/users/create",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Usuarios", url: null },
      { label: "Crear", url: null },
    ],
  },
  {
    path: "/users/role/admin",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Administradores", url: null },
    ],
  },
  {
    path: "/users/role/patient",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Pacientes", url: null },
    ],
  },
  {
    path: "/users/role/professional",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Profesionales", url: null },
    ],
  },
  {
    path: "/users/view/:id",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      {
        label: (ctx) => ctx.state?.role?.name ?? "Rol",
        url: (ctx) => (ctx.state?.role?.value ? `/users/role/${ctx.state.role.value}` : null),
      },
      { label: "Ver", url: null },
    ],
  },
  {
    path: "/roles",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Roles", url: null },
    ],
  },
  {
    path: "/roles/create",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Roles", url: "/roles" },
      { label: "Crear", url: null },
    ],
  },
  {
    path: "/roles/view/:id",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Roles", url: "/roles" },
      { label: "Ver", url: null },
    ],
  },
  {
    path: "/roles/edit/:id",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Roles", url: "/roles" },
      { label: "Editar", url: null },
    ],
  },
  {
    path: "/permissions",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Permisos", url: null },
    ],
  },
  {
    path: "/permissions/create",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Permisos", url: "/permissions" },
      { label: "Crear", url: null },
    ],
  },
  {
    path: "/permissions/view/:id",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Permisos", url: "/permissions" },
      { label: "Ver", url: null },
    ],
  },
  {
    path: "/permissions/edit/:id",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Permisos", url: "/permissions" },
      { label: "Editar", url: null },
    ],
  },
  {
    path: "/settings/app",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Configuraciones", url: null },
      { label: "Aplicación", url: null },
    ],
  },
  {
    path: "/settings/business",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Configuraciones", url: null },
      { label: "Tu negocio", url: null },
    ],
  },
  {
    path: "/settings/notifications",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Configuraciones", url: null },
      { label: "Notificaciones", url: null },
    ],
  },
  {
    path: "/settings/dashboard",
    paths: [
      { label: "Inicio", url: "/dashboard" },
      { label: "Configuraciones", url: null },
      { label: "Tablero", url: null },
    ],
  },
  {
    path: "*",
    paths: [{ label: "Inicio", url: "/dashboard" }],
  },
];

function resolveUrl(url: BreadcrumbUrl, ctx: BreadcrumbContext): string | null {
  if (!url) return null;

  const resolved = typeof url === "function" ? url(ctx) : url;

  if (!resolved) return null;

  return Object.entries(ctx.params).reduce((acc, [key, value]) => acc.replace(`:${key}`, value), resolved);
}

function resolveLabel(label: BreadcrumbPath["label"], ctx: BreadcrumbContext): string {
  return typeof label === "function" ? label(ctx) : label;
}

export function HeaderBreadcrumb() {
  const location = useLocation();
  const [crumbs, setCrumbs] = useState<ResolvedCrumb[]>([]);

  const matched = useMemo(() => matchRoutes(BREADCRUMB_ROUTES, location), [location]);

  useEffect(() => {
    if (!matched?.length) {
      setCrumbs([]);
      return;
    }

    const match = matched[0];
    const route = match.route as BreadcrumbRoute;

    const ctx: BreadcrumbContext = {
      params: match.params as Record<string, string>,
      state: location.state,
    };

    const resolved = route.paths.map((p, index) => ({
      label: resolveLabel(p.label, ctx),
      url: resolveUrl(p.url, ctx),
      isLast: index === route.paths.length - 1,
    }));

    setCrumbs(resolved);
  }, [matched, location.state]);

  if (!crumbs.length) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <div key={index} className="contents">
            <BreadcrumbItem>
              {crumb.url ? (
                <BreadcrumbLink asChild>
                  <Link to={crumb.url}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {!crumb.isLast && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
