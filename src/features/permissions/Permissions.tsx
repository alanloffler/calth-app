import { Ban, FilePenLine, FileText, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { ConfirmDialog } from "@components/ConfirmDialog";
import { DataTable } from "@components/data-table/DataTable";
import { Link } from "react-router";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@auth/components/Protected";
import { SortableHeader } from "@components/data-table/SortableHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";

import type { IPermission } from "@permissions/interfaces/permission.interface";
import { PermissionsService } from "@permissions/services/permissions.service";
import { useAuthStore } from "@auth/stores/auth.store";
import { useTryCatch } from "@core/hooks/useTryCatch";

export default function Permissions() {
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const [openRemoveHardDialog, setOpenRemoveHardDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<IPermission[] | undefined>(undefined);
  const [selectedPermission, setSelectedPermission] = useState<IPermission | undefined>(undefined);
  const refreshAdmin = useAuthStore((state) => state.refreshAdmin);
  const { isLoading: isLoadingPermissions, tryCatch: tryCatchPermissions } = useTryCatch();
  const { isLoading: isRemoving, tryCatch: tryCatchRemove } = useTryCatch();
  const { isLoading: isRemovingHard, tryCatch: tryCatchRemoveHard } = useTryCatch();
  const { isLoading: isRestoring, tryCatch: tryCatchRestore } = useTryCatch();

  const fetchPermissions = useCallback(async () => {
    const [response, error] = await tryCatchPermissions(PermissionsService.findAll());

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      setPermissions(response.data);
    }
  }, [tryCatchPermissions]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  async function removePermission(id: string): Promise<void> {
    const [response, error] = await tryCatchRemove(PermissionsService.softRemove(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      await refreshAdmin();
      fetchPermissions();
    }
  }

  async function restorePermission(id: string): Promise<void> {
    const [response, error] = await tryCatchRestore(PermissionsService.restore(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      await refreshAdmin();
      fetchPermissions();
    }
  }

  async function hardRemovePermission(id: string): Promise<void> {
    const [response, error] = await tryCatchRemoveHard(PermissionsService.remove(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      await refreshAdmin();
      fetchPermissions();
    }
  }

  const columns: ColumnDef<IPermission>[] = [
    {
      accessorKey: "id",
      header: () => <div className="text-center">ID</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge size="small" variant="id">
            {row.original.id.slice(0, 5)}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => <SortableHeader column={column}>Categoría</SortableHeader>,
    },
    {
      accessorKey: "actionKey",
      header: ({ column }) => <SortableHeader column={column}>Acción</SortableHeader>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column}>Nombre</SortableHeader>,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span>{row.original.name}</span>
          {row.original.deletedAt && <Ban className="h-4 w-4 text-rose-500" />}
        </div>
      ),
    },
    {
      id: "actions",
      minSize: 168,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="hover:text-view" size="icon-sm" variant="outline" asChild>
                <Link to={`/permissions/view/${row.original.id}`}>
                  <FileText />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver detalles</TooltipContent>
          </Tooltip>
          {row.original.deletedAt ? (
            <Protected requiredPermission="permissions-restore">
              <Button
                className="hover:text-restore"
                onClick={() => {
                  setSelectedPermission(row.original);
                  setOpenRestoreDialog(true);
                }}
                size="icon-sm"
                variant="outline"
              >
                <RotateCcw />
              </Button>
            </Protected>
          ) : (
            <>
              <Protected requiredPermission="permissions-update">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="hover:text-edit" size="icon-sm" variant="outline" asChild>
                      <Link to={`/permissions/edit/${row.original.id}`}>
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
                      onClick={() => {
                        setSelectedPermission(row.original);
                        setOpenRemoveDialog(true);
                      }}
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
                      onClick={() => {
                        setSelectedPermission(row.original);
                        setOpenRemoveHardDialog(true);
                      }}
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
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader title="Permisos" subtitle="Gestioná los permisos para los roles del sistema">
          <Protected requiredPermission="permissions-create">
            <Button variant="default" size="lg" asChild>
              <Link to="/permissions/create">
                <Plus />
                Crear permiso
              </Link>
            </Button>
          </Protected>
        </PageHeader>
        <DataTable
          columns={columns}
          data={permissions}
          defaultPageSize={10}
          defaultSorting={[{ id: "actionKey", desc: false }]}
          loading={isLoadingPermissions}
        />
      </div>
      <ConfirmDialog
        title="Eliminar permiso"
        description="¿Seguro que querés eliminar este permiso?"
        callback={() => selectedPermission && removePermission(selectedPermission.id)}
        loader={isRemoving}
        open={openRemoveDialog}
        setOpen={setOpenRemoveDialog}
        variant="destructive"
      >
        <ul>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Nombre:</span>
            {selectedPermission?.name}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Categoría:</span>
            {selectedPermission?.category}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Acción:</span>
            {selectedPermission?.actionKey}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Descripción:</span>
            {selectedPermission?.description}
          </li>
        </ul>
      </ConfirmDialog>
      <ConfirmDialog
        title="Restaurar permiso"
        description="¿Seguro que querés restaurar este permiso?"
        callback={() => selectedPermission && restorePermission(selectedPermission.id)}
        loader={isRestoring}
        open={openRestoreDialog}
        setOpen={setOpenRestoreDialog}
        variant="warning"
      >
        <ul>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Nombre:</span>
            {selectedPermission?.name}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Categoría:</span>
            {selectedPermission?.category}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Acción:</span>
            {selectedPermission?.actionKey}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Descripción:</span>
            {selectedPermission?.description}
          </li>
        </ul>
      </ConfirmDialog>
      <ConfirmDialog
        title="Eliminar permiso"
        description="¿Seguro que querés eliminar este permiso?"
        alertMessage="El permiso será eliminado de la base de datos. Esta acción es irreversible."
        callback={() => selectedPermission && hardRemovePermission(selectedPermission.id)}
        loader={isRemovingHard}
        open={openRemoveHardDialog}
        setOpen={setOpenRemoveHardDialog}
        showAlert
        variant="destructive"
      >
        <ul>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Nombre:</span>
            {selectedPermission?.name}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Categoría:</span>
            {selectedPermission?.category}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Acción:</span>
            {selectedPermission?.actionKey}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Descripción:</span>
            {selectedPermission?.description}
          </li>
        </ul>
      </ConfirmDialog>
    </>
  );
}
