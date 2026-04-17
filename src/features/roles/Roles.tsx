import { Ban, FilePenLine, FileText, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { ConfirmDialog } from "@components/dialogs/ConfirmDialog";
import { DataTable } from "@components/data-table/DataTable";
import { Link } from "react-router";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@auth/components/Protected";
import { SortableHeader } from "@components/data-table/SortableHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { IRole } from "@roles/interfaces/role.interface";
import { ERoles } from "@auth/enums/role.enum";
import { EUserRole } from "@roles/enums/user-role.enum";
import { RolesService } from "@roles/services/roles.service";
import { RolesTableConfig } from "@core/config/table.config";
import { queryClient } from "@core/lib/query-client";
import { useAuthStore } from "@auth/stores/auth.store";

export default function Roles() {
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const [openRemoveHardDialog, setOpenRemoveHardDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<IRole | undefined>(undefined);
  const admin = useAuthStore((state) => state.admin);

  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles", "list"],
    queryFn: () => {
      const isSuperAdmin = admin?.role.value === ERoles.super;
      return isSuperAdmin ? RolesService.findAllSoftRemoved() : RolesService.findAll();
    },
    select: (response) => response.data,
  });

  const { mutate: removeRole, isPending: isRemoving } = useMutation({
    mutationKey: ["roles", "remove"],
    mutationFn: (id: string) => RolesService.softRemove(id),
    onSuccess: (response) => {
      if (response && response.statusCode === 200) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["roles", "list"] });
      }
    },
    onSettled: () => {
      setSelectedRole(undefined);
      setOpenRemoveDialog(false);
    },
  });

  const { mutate: restoreRole, isPending: isRestoring } = useMutation({
    mutationKey: ["roles", "restore"],
    mutationFn: (id: string) => RolesService.restore(id),
    onSuccess: (response) => {
      if (response && response.statusCode === 200) {
        queryClient.invalidateQueries({ queryKey: ["roles", "list"] });
        toast.success(response.message);
      }
    },
    onSettled: () => {
      setSelectedRole(undefined);
      setOpenRestoreDialog(false);
    },
  });

  const { mutate: removeHardRole, isPending: isRemovingHard } = useMutation({
    mutationKey: ["roles", "remove-hard"],
    mutationFn: (id: string) => RolesService.remove(id),
    onSuccess: (response) => {
      if (response && response.statusCode === 200) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["roles", "list"] });
      }
    },
    onSettled: () => {
      setSelectedRole(undefined);
      setOpenRemoveHardDialog(false);
    },
  });

  const columns: ColumnDef<IRole>[] = [
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
      accessorKey: "value",
      header: ({ column }) => <SortableHeader column={column}>Valor</SortableHeader>,
    },
    {
      id: "actions",
      minSize: 168,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="hover:text-view" size="icon-sm" variant="outline" asChild>
                <Link to={`/roles/view/${row.original.id}`}>
                  <FileText />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver detalles</TooltipContent>
          </Tooltip>
          {row.original.deletedAt ? (
            <Protected requiredPermission="roles-restore">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="hover:text-restore"
                    onClick={() => {
                      setSelectedRole(row.original);
                      setOpenRestoreDialog(true);
                    }}
                    size="icon-sm"
                    variant="outline"
                  >
                    <RotateCcw />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restaurar</TooltipContent>
              </Tooltip>
            </Protected>
          ) : (
            <>
              {(admin?.role.value === EUserRole.super ||
                (admin?.role.value === EUserRole.admin && row.original.value !== EUserRole.admin)) && (
                <Protected requiredPermission="roles-update">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button className="hover:text-edit" size="icon-sm" variant="outline" asChild>
                        <Link to={`/roles/edit/${row.original.id}`}>
                          <FilePenLine />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>
                </Protected>
              )}
              {row.original.value !== ERoles.super && row.original.value !== ERoles.admin && (
                <>
                  <Protected requiredPermission="roles-delete">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="hover:text-delete"
                          onClick={() => {
                            setSelectedRole(row.original);
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
                  <Protected requiredPermission="roles-delete-hard">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="hover:text-delete gap-0"
                          onClick={() => {
                            setSelectedRole(row.original);
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
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader title="Roles" subtitle="Gestioná los roles de los administradores del sistema">
          <Protected requiredPermission="roles-create">
            <Button variant="default" size="lg" asChild>
              <Link to="/roles/create">
                <Plus />
                Crear rol
              </Link>
            </Button>
          </Protected>
        </PageHeader>
        <DataTable
          columns={columns}
          data={roles}
          defaultPageSize={RolesTableConfig.limit}
          defaultSorting={[{ id: "name", desc: false }]}
          loading={isLoadingRoles}
          pageSizes={RolesTableConfig.pageSizes}
        />
      </div>
      {selectedRole && (
        <>
          <ConfirmDialog
            title="Eliminar rol"
            description="¿Seguro que querés eliminar el rol?"
            callback={() => removeRole(selectedRole.id)}
            loader={isRemoving}
            open={openRemoveDialog}
            setOpen={setOpenRemoveDialog}
            variant="destructive"
          >
            <ul>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Nombre:</span>
                <span>{selectedRole.name}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Valor:</span>
                <span>{selectedRole.value}</span>
              </li>
            </ul>
          </ConfirmDialog>
          <ConfirmDialog
            title="Restaurar rol"
            description="¿Seguro que querés restaurar el rol?"
            callback={() => restoreRole(selectedRole.id)}
            loader={isRestoring}
            open={openRestoreDialog}
            setOpen={setOpenRestoreDialog}
            variant="warning"
          >
            <ul>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Nombre:</span>
                <span>{selectedRole.name}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Valor:</span>
                <span>{selectedRole.value}</span>
              </li>
            </ul>
          </ConfirmDialog>
          <ConfirmDialog
            title="Eliminar rol"
            description="¿Seguro que querés eliminar el rol?"
            alertMessage="El rol será eliminado de la base de datos. Esta acción es irreversible."
            callback={() => removeHardRole(selectedRole.id)}
            loader={isRemovingHard}
            open={openRemoveHardDialog}
            setOpen={setOpenRemoveHardDialog}
            showAlert
            variant="destructive"
          >
            <ul>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Nombre:</span>
                <span>{selectedRole.name}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Valor:</span>
                <span>{selectedRole.value}</span>
              </li>
            </ul>
          </ConfirmDialog>
        </>
      )}
    </>
  );
}
