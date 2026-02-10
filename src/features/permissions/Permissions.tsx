import { Ban, FilePenLine, FileText, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { DataTable } from "@components/data-table/DataTable";
import { Link } from "react-router";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@auth/components/Protected";
import { SortableHeader } from "@components/data-table/SortableHeader";

import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";

import type { IPermission } from "@permissions/interfaces/permission.interface";
import { PermissionsService } from "@permissions/services/permissions.service";
import { tryCatch } from "@core/utils/try-catch";
import { useAuthStore } from "@auth/stores/auth.store";
import { useTryCatch } from "@core/hooks/useTryCatch";

export default function Permissions() {
  const [permissions, setPermissions] = useState<IPermission[] | undefined>(undefined);
  const refreshAdmin = useAuthStore((state) => state.refreshAdmin);
  const { isLoading: isLoadingPermissions, tryCatch: tryCatchPermissions } = useTryCatch();

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
    const [response, error] = await tryCatch(PermissionsService.softRemove(id));

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
    const [response, error] = await tryCatch(PermissionsService.restore(id));

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
    const [response, error] = await tryCatch(PermissionsService.remove(id));

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
          <Button className="hover:text-view" size="icon-sm" variant="outline" asChild>
            <Link to={`/permissions/view/${row.original.id}`}>
              <FileText />
            </Link>
          </Button>
          {row.original.deletedAt ? (
            <Protected requiredPermission="permissions-restore">
              <Button
                className="hover:text-restore"
                onClick={() => restorePermission(row.original.id)}
                size="icon-sm"
                variant="outline"
              >
                <RotateCcw />
              </Button>
            </Protected>
          ) : (
            <>
              <Protected requiredPermission="permissions-update">
                <Button className="hover:text-edit" size="icon-sm" variant="outline" asChild>
                  <Link to={`/permissions/edit/${row.original.id}`}>
                    <FilePenLine />
                  </Link>
                </Button>
              </Protected>
              <Protected requiredPermission="permissions-delete">
                <Button
                  className="hover:text-delete"
                  onClick={() => removePermission(row.original.id)}
                  size="icon-sm"
                  variant="outline"
                >
                  <Trash2 />
                </Button>
              </Protected>
              <Protected requiredPermission="permissions-delete-hard">
                <Button
                  className="hover:text-delete gap-0"
                  onClick={() => hardRemovePermission(row.original.id)}
                  size="icon-sm"
                  variant="outline"
                >
                  <Trash2 />
                  <span>!</span>
                </Button>
              </Protected>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
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
  );
}
