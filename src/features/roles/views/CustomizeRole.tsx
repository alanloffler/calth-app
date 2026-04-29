import { ArrowLeft, Info, RotateCcw } from "lucide-react";

import { Badge } from "@core/components/Badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Checkbox } from "@components/ui/checkbox";
import { Label } from "@components/ui/label";
import { Link } from "react-router";
import { Loader } from "@components/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import type { IEffectivePermission } from "@roles/interfaces/effective-permission.interface";
import { RoleOverridesService } from "@roles/services/role-overrides.service";
import { RolesService } from "@roles/services/roles.service";
import { cn } from "@core/lib/utils";
import { queryClient } from "@core/lib/query-client";

type GroupedPermissions = Record<string, IEffectivePermission[]>;

export default function CustomizeRole() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [intent, setIntent] = useState<Record<string, boolean>>({});
  const [original, setOriginal] = useState<Record<string, boolean>>({});

  const { data: role, isLoading: isLoadingRole } = useQuery({
    queryKey: ["roles", id],
    queryFn: () => RolesService.findOne(id!),
    select: (response) => response.data,
    enabled: !!id,
  });

  const {
    data: effective,
    isLoading: isLoadingEffective,
    isError: isErrorEffective,
  } = useQuery({
    queryKey: ["role-overrides", "effective", id],
    queryFn: () => RoleOverridesService.findEffective(id!),
    select: (response) => response.data,
    enabled: !!id,
  });

  useEffect(() => {
    if (!effective) return;
    const initial = effective.reduce<Record<string, boolean>>((acc, perm) => {
      acc[perm.id] = perm.isEffective;
      return acc;
    }, {});
    setIntent(initial);
    setOriginal(initial);
  }, [effective]);

  const grouped = useMemo<GroupedPermissions>(() => {
    if (!effective) return {};
    return effective.reduce<GroupedPermissions>((acc, perm) => {
      (acc[perm.category] ??= []).push(perm);
      return acc;
    }, {});
  }, [effective]);

  const dirtyPermissions = useMemo(() => {
    if (!effective) return [];
    return effective.filter((perm) => intent[perm.id] !== original[perm.id]);
  }, [effective, intent, original]);

  const isDirty = dirtyPermissions.length > 0;

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationKey: ["role-overrides", "save", id],
    mutationFn: async () => {
      await Promise.all(
        dirtyPermissions.map((perm) => {
          const desired = intent[perm.id];
          // Matches baseline → drop the override (no-op if there wasn't one).
          if (desired === perm.inBaseline) {
            return RoleOverridesService.removeOverride(id!, perm.id);
          }
          // Differs from baseline → write a grant or deny override.
          return RoleOverridesService.upsertOverride(id!, perm.id, desired ? "grant" : "deny");
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-overrides", "effective", id] });
      toast.success("Personalización guardada");
      navigate("/roles");
    },
    onError: () => {
      toast.error("Error al guardar la personalización");
    },
  });

  const { mutate: resetAll, isPending: isResetting } = useMutation({
    mutationKey: ["role-overrides", "reset", id],
    mutationFn: () => RoleOverridesService.resetAll(id!),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["role-overrides", "effective", id] });
      toast.success(response.message ?? "Personalizaciones eliminadas");
    },
    onError: () => {
      toast.error("Error al restaurar valores por defecto");
    },
  });

  const isLoading = isLoadingRole || isLoadingEffective;
  const overrideCount = effective?.filter((p) => p.overrideEffect !== null).length ?? 0;

  return (
    <div className="flex w-full flex-col lg:w-[80%] xl:w-[60%]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Personalizar permisos del rol</CardTitle>
              <CardDescription>{role?.name ? `Rol: ${role.name}` : "Cargando rol…"}</CardDescription>
            </div>
            {overrideCount > 0 && (
              <Badge variant="recurrent">
                {overrideCount} {overrideCount === 1 ? "personalización" : "personalizaciones"}
              </Badge>
            )}
          </div>

          <div className="bg-muted/50 mt-4 flex items-start gap-2 rounded-md border p-3 text-sm">
            <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-muted-foreground">
              Los cambios afectan únicamente a tu negocio. La definición global del rol no se modifica.
            </p>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          {isLoadingEffective ? (
            <span className="text-foreground! flex justify-center text-sm">
              <Loader size={18} text="Descargando permisos" />
            </span>
          ) : isErrorEffective ? (
            <span className="text-destructive text-center text-sm">Error cargando permisos</span>
          ) : effective ? (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
              {Object.entries(grouped).map(([category, perms]) => (
                <li className="flex flex-col gap-3" key={category}>
                  <h2 className="text-xxs font-medium uppercase">{category}</h2>
                  <ul className="flex flex-col gap-3 pl-4">
                    {perms.map((perm) => {
                      const checked = intent[perm.id] ?? perm.isEffective;
                      const isOverridden = perm.overrideEffect !== null;
                      const willOverride = checked !== perm.inBaseline;

                      return (
                        <li className="flex items-center gap-2" key={perm.id}>
                          <Checkbox
                            id={perm.actionKey}
                            checked={checked}
                            onCheckedChange={(value) => setIntent((prev) => ({ ...prev, [perm.id]: !!value }))}
                          />
                          <Label htmlFor={perm.actionKey} className="flex items-center gap-2">
                            {perm.name}
                            {(isOverridden || willOverride) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className={cn(
                                      "h-3 w-3 rounded-full",
                                      willOverride ? "bg-amber-500" : "bg-blue-500",
                                    )}
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="flex flex-col">
                                  <span>
                                    {willOverride
                                      ? "Cambio sin guardar"
                                      : `Personalizado (${perm.overrideEffect === "grant" ? "habilitado" : "deshabilitado"})`}
                                  </span>
                                  <span className="text-muted-foreground">
                                    Por defecto: {perm.inBaseline ? "habilitado" : "deshabilitado"}
                                  </span>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </Label>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-wrap justify-between gap-3 pt-4">
          <div className="flex items-center gap-3">
            {isLoading && <Loader className="text-sm" size={18} text="Cargando" />}
            <Button asChild variant="ghost" size="sm">
              <Link to="/roles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={overrideCount === 0 || isResetting || isSaving}
              onClick={() => resetAll()}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {isResetting ? <Loader text="Restaurando" /> : "Restaurar por defecto"}
            </Button>
          </div>
          <Button disabled={!isDirty || isSaving} onClick={() => save()} variant="default">
            {isSaving ? <Loader color="white" text="Guardando" /> : "Guardar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
