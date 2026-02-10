import { Ban, FilePenLine, FileText, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { DataTable } from "@components/data-table/DataTable";
import { Link } from "react-router";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@auth/components/Protected";
import { SortableHeader } from "@components/data-table/SortableHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";

import type { IRole } from "@roles/interfaces/role.interface";
import { ERoles } from "@auth/enums/role.enum";
import { RolesService } from "@roles/services/roles.service";
import { tryCatch } from "@core/utils/try-catch";
import { useAuthStore } from "@auth/stores/auth.store";
import { useTryCatch } from "@core/hooks/useTryCatch";

export default function Roles() {
  const [roles, setRoles] = useState<IRole[] | undefined>(undefined);
  const admin = useAuthStore((state) => state.admin);
  const { isLoading: isLoadingRoles, tryCatch: tryCatchRoles } = useTryCatch();

  const fetchRoles = useCallback(async () => {
    const isSuperAdmin = admin?.role.value === ERoles.super;
    const serviceByRole = isSuperAdmin ? RolesService.findAllSoftRemoved() : RolesService.findAll();

    const [response, error] = await tryCatchRoles(serviceByRole);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      setRoles(response.data);
    }
  }, [admin?.role.value, tryCatchRoles]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  async function removeRole(id: string): Promise<void> {
    const [response, error] = await tryCatch(RolesService.softRemove(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      fetchRoles();
    }
  }

  async function hardRemoveRole(id: string): Promise<void> {
    const [response, error] = await tryCatch(RolesService.remove(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      fetchRoles();
    }
  }

  async function restoreRole(id: string): Promise<void> {
    const [response, error] = await tryCatch(RolesService.restore(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      fetchRoles();
    }
  }

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
                    onClick={() => restoreRole(row.original.id)}
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
              {row.original.value !== ERoles.super && row.original.value !== ERoles.admin && (
                <>
                  <Protected requiredPermission="roles-delete">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="hover:text-delete"
                          onClick={() => removeRole(row.original.id)}
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
                          onClick={() => hardRemoveRole(row.original.id)}
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
        defaultPageSize={10}
        defaultSorting={[{ id: "name", desc: false }]}
        loading={isLoadingRoles}
      />
    </div>
  );
}
