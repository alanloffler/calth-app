import { Check, FilePenLine, RotateCcw, Trash2 } from "lucide-react";

import { Activity } from "react";
import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { ConfirmDialog } from "@components/ConfirmDialog";
import { CreatedAt } from "@components/CreatedAt";
import { Link } from "react-router";
import { Loader } from "@components/Loader";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@core/auth/components/Protected";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";

import type { IRole, IRolePermissions } from "@roles/interfaces/role.interface";
import { ERoles } from "@auth/enums/role.enum";
import { EUserRole } from "@roles/enums/user-role.enum";
import { RolesService } from "@roles/services/roles.service";
import { useAuthStore } from "@auth/stores/auth.store";
import { usePermission } from "@permissions/hooks/usePermission";
import { useTryCatch } from "@core/hooks/useTryCatch";

export default function ViewRole() {
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const [openRemoveHardDialog, setOpenRemoveHardDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);
  const [role, setRole] = useState<IRole | undefined>(undefined);
  const admin = useAuthStore((state) => state.admin);
  const usersInRole = useMemo(() => [...(role?.users ?? []), ...(role?.admins ?? [])], [role?.users, role?.admins]);
  const hasPermissions = usePermission(["roles-delete", "roles-delete-hard", "roles-restore", "roles-update"], "some");
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoading: isLoadingRole, tryCatch: tryCatchRole } = useTryCatch();
  const { isLoading: isRemoving, tryCatch: tryCatchRemove } = useTryCatch();
  const { isLoading: isRemovingHard, tryCatch: tryCatchRemoveHard } = useTryCatch();
  const { isLoading: isRestoring, tryCatch: tryCatchRestore } = useTryCatch();

  const findOneRole = useCallback(
    async function (id: string) {
      const isSuperAdmin = admin?.role.value === ERoles.super;
      const serviceByRole = isSuperAdmin ? RolesService.findOneSoftRemoved(id) : RolesService.findOne(id);
      const [response, responseError] = await tryCatchRole(serviceByRole);

      if (responseError) {
        toast.error(responseError.message);
        return;
      }

      if (response && response.statusCode === 200) {
        setRole(response.data);
      }
    },
    [admin?.role.value, tryCatchRole],
  );

  useEffect(() => {
    findOneRole(id!);
  }, [id, findOneRole]);

  const groupByCategory = (rolePermissions: IRolePermissions[]) => {
    if (!rolePermissions) return {};

    const grouped: Record<string, typeof rolePermissions> = {};

    rolePermissions.forEach((rp) => {
      const category = rp.permission?.category;
      if (category) {
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(rp);
      }
    });

    return grouped;
  };

  async function removeRole(id: string): Promise<void> {
    const [response, error] = await tryCatchRemove(RolesService.softRemove(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      navigate(-1);
    }
  }

  async function removeHardRole(id: string): Promise<void> {
    const [response, error] = await tryCatchRemoveHard(RolesService.remove(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      navigate(-1);
    }
  }

  async function restoreRole(id: string): Promise<void> {
    const [response, error] = await tryCatchRestore(RolesService.restore(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      findOneRole(id);
    }
  }

  function translate(content: string) {
    const dictionary: Record<string, string> = {
      admin: "Administradores",
      business: "Negocio",
      calendar: "Agenda",
      events: "Eventos",
      medical_history: "Historias médicas",
      patient: "Pacientes",
      permissions: "Permisos",
      professional: "Profesionales",
      roles: "Roles",
      settings: "Configuraciones",
    };

    return dictionary[content] || content;
  }

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Detalles del rol" />
      <Card className="w-full p-6 text-center md:p-10 lg:w-[80%] xl:w-[60%]">
        {isLoadingRole ? (
          <div className="flex min-w-80 justify-center">
            <Loader size={20} text="Cargando rol" />
          </div>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-xl">{role?.name}</CardTitle>
              <CardDescription className="text-base">{role?.value}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 px-0">
              <ul className="flex flex-col gap-2 text-start">
                <li className="flex gap-5">
                  <span className="font-semibold">Nombre</span>
                  <span>{role?.name}</span>
                </li>
                <li className="flex gap-5">
                  <span className="font-semibold">Valor</span>
                  <span>{role?.value}</span>
                </li>
                <li className="flex gap-5">
                  <span className="font-semibold">Descripción</span>
                  <span>{role?.description}</span>
                </li>
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <span className="font-semibold">Permisos:</span>
                    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                      {role?.rolePermissions && role.rolePermissions.length > 0 ? (
                        Object.entries(groupByCategory(role?.rolePermissions))
                          .sort(([a], [b]) => translate(a).localeCompare(translate(b)))
                          .map(([category, permissions]) => (
                            <div className="flex flex-col gap-3" key={`category-block-${category}`}>
                              <div className="dark:text-foreground flex text-xs font-semibold text-neutral-600 uppercase">
                                {translate(category)}
                              </div>
                              <ul className="flex flex-col gap-2 pl-4">
                                {permissions.map((rp, idx) => (
                                  <li
                                    key={`permission-${idx}`}
                                    className="dark:text-foreground flex items-center gap-2 text-sm font-medium text-neutral-600"
                                  >
                                    <span className="bg-primary/20 rounded-full p-1">
                                      <Check className="text-primary h-2.5 w-2.5" />
                                    </span>
                                    {rp.permission?.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))
                      ) : (
                        <span>Sin permisos</span>
                      )}
                    </ul>
                  </div>
                  <div className="dark:bg-background flex flex-col items-start rounded-lg border bg-neutral-50 p-3">
                    <span className="font-semibold">Usando este rol:</span>
                    {usersInRole.length > 0 ? (
                      <ul className="flex flex-col gap-2 pt-2 pl-4">
                        {usersInRole.map((item, idx) => (
                          <li className="flex items-center gap-3 text-sm" key={`admins-${item.id}`}>
                            <Badge className="min-w-[29px] text-xs" size="small" variant="ic">
                              {idx + 1}
                            </Badge>
                            <Button className="text-foreground h-fit p-0 font-normal" variant="link" asChild>
                              <Link to={`/users/view/${item.id}`} state={{ role: item.role }}>
                                {item.firstName} {item.lastName}
                              </Link>
                            </Button>
                            <span className="text-muted-foreground">{item.userName}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>Sin usuarios</span>
                    )}
                  </div>
                </div>
              </ul>
              <CreatedAt>{`Rol creado el ${role && format(role.createdAt, "dd/MM/yyyy", { locale: es })}`}</CreatedAt>
            </CardContent>
            <Activity mode={hasPermissions ? "visible" : "hidden"}>
              <CardFooter className="justify-end gap-3 px-0">
                {role?.deletedAt !== null ? (
                  <div className="flex w-full items-center justify-between">
                    <Badge size="small" variant="red">
                      Eliminado
                    </Badge>
                    <Protected requiredPermission="roles-restore">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="hover:text-restore"
                            onClick={() => id && setOpenRestoreDialog(true)}
                            size="icon-sm"
                            variant="outline"
                          >
                            <RotateCcw />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Restaurar</TooltipContent>
                      </Tooltip>
                    </Protected>
                  </div>
                ) : (
                  <>
                    {(admin?.role.value === EUserRole.super ||
                      (admin?.role.value === EUserRole.admin && role?.value !== EUserRole.admin)) && (
                      <Protected requiredPermission="roles-update">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button className="hover:text-edit" size="icon-sm" variant="outline" asChild>
                              <Link to={`/roles/edit/${id}`}>
                                <FilePenLine />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                      </Protected>
                    )}
                    {role?.value !== EUserRole.super && role?.value !== EUserRole.admin && (
                      <>
                        <Protected requiredPermission="roles-delete">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                className="hover:text-delete"
                                onClick={() => id && setOpenRemoveDialog(true)}
                                size="icon-sm"
                                variant="outline"
                              >
                                <Trash2 />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
                          </Tooltip>
                        </Protected>
                        <Protected requiredPermission="roles-delete-hard">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                className="hover:text-delete gap-0"
                                onClick={() => id && setOpenRemoveHardDialog(true)}
                                size="icon-sm"
                                variant="outline"
                              >
                                <Trash2 />
                                <span>!</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar permanente</TooltipContent>
                          </Tooltip>
                        </Protected>
                      </>
                    )}
                  </>
                )}
              </CardFooter>
            </Activity>
            {role && (
              <>
                <ConfirmDialog
                  title="Eliminar rol"
                  description="¿Seguro que querés eliminar el rol?"
                  callback={() => removeRole(role.id)}
                  loader={isRemoving}
                  open={openRemoveDialog}
                  setOpen={setOpenRemoveDialog}
                  variant="destructive"
                >
                  <ul>
                    <li className="flex items-center gap-2">
                      <span className="font-semibold">Nombre:</span>
                      <span>{role.name}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-semibold">Valor:</span>
                      <span>{role.value}</span>
                    </li>
                  </ul>
                </ConfirmDialog>
                <ConfirmDialog
                  title="Restaurar rol"
                  description="¿Seguro que querés restaurar el rol?"
                  callback={() => restoreRole(role.id)}
                  loader={isRestoring}
                  open={openRestoreDialog}
                  setOpen={setOpenRestoreDialog}
                  variant="warning"
                >
                  <ul>
                    <li className="flex items-center gap-2">
                      <span className="font-semibold">Nombre:</span>
                      <span>{role.name}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-semibold">Valor:</span>
                      <span>{role.value}</span>
                    </li>
                  </ul>
                </ConfirmDialog>
                <ConfirmDialog
                  title="Eliminar rol"
                  description="¿Seguro que querés eliminar el rol?"
                  alertMessage="El rol será eliminado de la base de datos. Esta acción es irreversible."
                  callback={() => removeHardRole(role.id)}
                  loader={isRemovingHard}
                  open={openRemoveHardDialog}
                  setOpen={setOpenRemoveHardDialog}
                  showAlert
                  variant="destructive"
                >
                  <ul>
                    <li className="flex items-center gap-2">
                      <span className="font-semibold">Nombre:</span>
                      <span>{role.name}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-semibold">Valor:</span>
                      <span>{role.value}</span>
                    </li>
                  </ul>
                </ConfirmDialog>
              </>
            )}
          </>
        )}
      </Card>
    </section>
  );
}
