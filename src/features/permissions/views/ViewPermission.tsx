import { ArrowLeft, FilePenLine, RotateCcw, Trash2 } from "lucide-react";

import { Activity } from "react";
import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { ConfirmDialog } from "@components/dialogs/ConfirmDialog";
import { CreatedAt } from "@components/CreatedAt";
import { Link } from "react-router";
import { Loader } from "@components/Loader";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@core/auth/components/Protected";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { useState } from "react";

import { PermissionsService } from "@permissions/services/permissions.service";
import { queryClient } from "@core/lib/query-client";
import { useAuthStore } from "@auth/stores/auth.store";
import { usePermission } from "@permissions/hooks/usePermission";

export default function ViewPermission() {
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const [openRemoveHardDialog, setOpenRemoveHardDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);
  const hasPermissions = usePermission(
    ["permissions-delete", "permissions-delete-hard", "permissions-restore", "permissions-update"],
    "some",
  );
  const navigate = useNavigate();
  const refreshAdmin = useAuthStore((state) => state.refreshAdmin);
  const { id } = useParams();

  const { data: permission, isLoading: isLoadingPermission } = useQuery({
    queryKey: ["permissions", id],
    queryFn: () => PermissionsService.findOne(id!),
    select: (response) => response?.data,
    enabled: !!id,
  });

  const { mutate: removePermission, isPending: isRemoving } = useMutation({
    mutationKey: ["permissions", "soft-remove", id],
    mutationFn: (id: string) => PermissionsService.softRemove(id),
    onSuccess: async (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["permissions", id] });
      await refreshAdmin();
    },
    onSettled: () => {
      setOpenRemoveDialog(false);
    },
  });

  const { mutate: restorePermission, isPending: isRestoring } = useMutation({
    mutationKey: ["permissions", "restore", id],
    mutationFn: (id: string) => PermissionsService.restore(id),
    onSuccess: async (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["permissions", id] });
      await refreshAdmin();
    },
    onSettled: () => {
      setOpenRestoreDialog(false);
    },
  });

  const { mutate: hardRemovePermission, isPending: isRemovingHard } = useMutation({
    mutationKey: ["permissions", "remove", id],
    mutationFn: (id: string) => PermissionsService.remove(id),
    onSuccess: async (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["permissions", id] });
      await refreshAdmin();
      navigate(-1);
    },
    onSettled: () => {
      setOpenRemoveHardDialog(false);
    },
  });

  return (
    <>
      <section className="flex flex-col gap-6">
        <PageHeader title="Detalles del permiso" />
        <Card className="relative w-full max-w-180 p-10 text-center">
          {isLoadingPermission ? (
            <div className="flex min-w-80 justify-center">
              <Loader size={20} text="Cargando permiso" />
            </div>
          ) : (
            <>
              <Button className="absolute top-5 right-5" variant="ghost" size="icon-lg" asChild>
                <Link to="/permissions">
                  <ArrowLeft className="size-5 cursor-pointer" />
                </Link>
              </Button>
              <CardHeader>
                <CardTitle className="text-xl">{permission?.name}</CardTitle>
                <CardDescription className="text-base">{permission?.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6 px-0">
                <ul className="space-y-2 text-start">
                  <li className="flex gap-5">
                    <span className="font-semibold">Nombre:</span>
                    <span>{permission?.name}</span>
                  </li>
                  <li className="flex gap-5">
                    <span className="font-semibold">Categoría:</span>
                    <span>{permission?.category}</span>
                  </li>
                  <li className="flex gap-5">
                    <span className="font-semibold">Acción:</span>
                    <span>{permission?.actionKey}</span>
                  </li>
                  <li className="flex gap-5">
                    <span className="font-semibold">Descripción:</span>
                    <span>{permission?.description}</span>
                  </li>
                </ul>
                <CreatedAt>{`Creado el ${permission && new Date(permission.createdAt.split("T")[0]).toLocaleDateString()}`}</CreatedAt>
              </CardContent>
              <Activity mode={hasPermissions ? "visible" : "hidden"}>
                <CardFooter className="justify-end gap-3 px-0">
                  {permission?.deletedAt && permission?.deletedAt !== null ? (
                    <div className="flex w-full items-center justify-between">
                      <Badge size="small" variant="red">
                        Eliminado
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="hover:text-restore"
                            onClick={() => setOpenRestoreDialog(true)}
                            size="icon-sm"
                            variant="outline"
                          >
                            <RotateCcw />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Restaurar</TooltipContent>
                      </Tooltip>
                    </div>
                  ) : (
                    <>
                      <Protected requiredPermission="permissions-update">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button className="hover:text-edit" size="icon-sm" variant="outline" asChild>
                              <Link to={`/permissions/edit/${id}`}>
                                <FilePenLine />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                      </Protected>
                      <Protected requiredPermission="permissions-delete">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="hover:text-delete"
                              onClick={() => setOpenRemoveDialog(true)}
                              size="icon-sm"
                              variant="outline"
                            >
                              <Trash2 />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar</TooltipContent>
                        </Tooltip>
                      </Protected>
                      <Protected requiredPermission="permissions-delete-hard">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="hover:text-delete gap-0"
                              onClick={() => setOpenRemoveHardDialog(true)}
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
                </CardFooter>
              </Activity>
            </>
          )}
        </Card>
      </section>
      <ConfirmDialog
        title="Eliminar permiso"
        description="¿Seguro que querés eliminar este permiso?"
        callback={() => permission && removePermission(permission.id)}
        loader={isRemoving}
        open={openRemoveDialog}
        setOpen={setOpenRemoveDialog}
        variant="destructive"
      >
        <ul>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Nombre:</span>
            {permission?.name}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Categoría:</span>
            {permission?.category}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Acción:</span>
            {permission?.actionKey}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Descripción:</span>
            {permission?.description}
          </li>
        </ul>
      </ConfirmDialog>
      <ConfirmDialog
        title="Restaurar permiso"
        description="¿Seguro que querés restaurar este permiso?"
        callback={() => permission && restorePermission(permission.id)}
        loader={isRestoring}
        open={openRestoreDialog}
        setOpen={setOpenRestoreDialog}
        variant="warning"
      >
        <ul>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Nombre:</span>
            {permission?.name}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Categoría:</span>
            {permission?.category}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Acción:</span>
            {permission?.actionKey}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Descripción:</span>
            {permission?.description}
          </li>
        </ul>
      </ConfirmDialog>
      <ConfirmDialog
        title="Eliminar permiso"
        description="¿Seguro que querés eliminar este permiso?"
        alertMessage="El permiso será eliminado de la base de datos. Esta acción es irreversible."
        callback={() => permission && hardRemovePermission(permission.id)}
        loader={isRemovingHard}
        open={openRemoveHardDialog}
        setOpen={setOpenRemoveHardDialog}
        showAlert
        variant="destructive"
      >
        <ul>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Nombre:</span>
            {permission?.name}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Categoría:</span>
            {permission?.category}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Acción:</span>
            {permission?.actionKey}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Descripción:</span>
            {permission?.description}
          </li>
        </ul>
      </ConfirmDialog>
    </>
  );
}
