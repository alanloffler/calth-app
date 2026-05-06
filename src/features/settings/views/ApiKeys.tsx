import { FilePenLine, Link, Mail, Plus, Sparkles, Trash2 } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { CheckedIcon } from "@components/CheckedIcon";
import { ConfirmDialog } from "@components/dialogs/ConfirmDialog";
import { CreateApiKey } from "@settings/components/CreateApiKey";
import { DataTable } from "@components/data-table/DataTable";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@auth/components/Protected";
import { SortableHeader } from "@components/data-table/SortableHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { UpdateApiKey } from "@settings/components/UpdateApiKey";

import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { IApiKey } from "@settings/interfaces/api-key.interface";
import { ApiKeyService } from "@settings/services/api-key.service";
import { DefaultShortTableConfig } from "@core/config/table.config";
import { cn } from "@core/lib/utils";
import { queryClient } from "@core/lib/query-client";
import { useAuthStore } from "@auth/stores/auth.store";

export default function ApiKeys() {
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const [selectedKey, setSelectedKey] = useState<IApiKey | null>(null);
  const loggedUser = useAuthStore((state) => state.admin);
  const refreshAdmin = useAuthStore((state) => state.refreshAdmin);

  const columns: ColumnDef<IApiKey>[] = [
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
      header: ({ column }) => <SortableHeader column={column}>Proveedor</SortableHeader>,
    },
    {
      accessorKey: "key",
      header: () => <span>Clave</span>,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.key}</span>,
    },
    {
      accessorKey: "linkedTo",
      header: () => <span>Enlazado a</span>,
      cell: ({ row }) =>
        row.original.linkedTo && (
          <Badge size="small" variant="role">
            <Link className="mr-2 size-3" />
            {row.original.linkedTo}
          </Badge>
        ),
    },
    {
      accessorKey: "active",
      header: () => <div className="text-center">Activo</div>,
      cell: ({ row }) => (row.original.active ? <CheckedIcon state={row.original.active} /> : null),
    },
    {
      id: "actions",
      minSize: 168,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Protected requiredPermission="*">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="hover:text-edit"
                  onClick={() => {
                    setSelectedKey(row.original);
                    setOpenEditDialog(true);
                  }}
                  size="icon-sm"
                  variant="outline"
                >
                  <FilePenLine />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar</TooltipContent>
            </Tooltip>
          </Protected>
          <Protected requiredPermission="*">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="hover:text-delete"
                  onClick={() => {
                    setSelectedKey(row.original);
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
        </div>
      ),
    },
  ];

  const { data: keys, isLoading: isLoadingKeys } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => ApiKeyService.findAll(),
    select: (response) => response.data,
  });

  const { mutate: removeApiKey, isPending: isRemoving } = useMutation({
    mutationKey: ["api-keys", "remove"],
    mutationFn: (id: string) => ApiKeyService.remove(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      refreshAdmin();
      toast.success(response.message);
    },
    onSettled: () => {
      setOpenRemoveDialog(false);
    },
  });

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader title="API keys" subtitle="Gestioná las API keys para los servicios del sistema">
          <Protected requiredPermission="business-update">
            <Button variant="default" size="lg" onClick={() => setOpenCreateDialog(true)}>
              <Plus />
              Crear API Key
            </Button>
          </Protected>
        </PageHeader>
        <section className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full border",
                loggedUser?.hasAiActive
                  ? "border-green-200 bg-green-100 text-green-600 dark:border-green-900/30 dark:bg-green-800/30 dark:text-green-800"
                  : "border-red-200 bg-red-100 text-red-600 dark:border-red-900/30 dark:bg-red-800/30 dark:text-red-800",
              )}
            >
              <Sparkles className="size-4 shrink-0" />
            </div>
            <p>
              {loggedUser?.hasAiActive
                ? "La inteligencia artificial está activada"
                : "La inteligencia artificial no está activada"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full border",
                loggedUser?.hasEmailActive
                  ? "border-green-200 bg-green-100 text-green-600 dark:border-green-900/30 dark:bg-green-800/30 dark:text-green-800"
                  : "border-red-200 bg-red-100 text-red-600 dark:border-red-900/30 dark:bg-red-800/30 dark:text-red-800",
              )}
            >
              <Mail className="size-4 shrink-0" />
            </div>
            <p>
              {loggedUser?.hasEmailActive ? "El envío de emails está activado" : "El envío de emails no está activado"}
            </p>
          </div>
        </section>
        <DataTable
          columns={columns}
          controls={{ search: false }}
          data={keys}
          defaultPageSize={DefaultShortTableConfig.limit}
          defaultSorting={[{ id: "name", desc: false }]}
          loading={isLoadingKeys}
          pageSizes={DefaultShortTableConfig.pageSizes}
          rowCount={keys?.length}
        />
      </div>
      {/* Create dialog */}
      <CreateApiKey open={openCreateDialog} setOpen={setOpenCreateDialog} />
      {selectedKey && (
        <>
          {/* Update dialog */}
          <UpdateApiKey apiKey={selectedKey} open={openEditDialog} setOpen={setOpenEditDialog} />
          {/* Remove dialog */}
          <ConfirmDialog
            open={openRemoveDialog}
            setOpen={setOpenRemoveDialog}
            title="Eliminar API Key"
            description="¿Seguro que querés eliminar la API key?"
            showAlert
            alertMessage="La API key será eliminada de la base de datos. Esta acción es irreversible."
            loader={isRemoving}
            callback={() => removeApiKey(selectedKey.id)}
            variant="destructive"
          >
            <div className="flex flex-col">
              <ul>
                <li className="flex items-center gap-2">
                  <span className="font-semibold">Proveedor:</span>
                  <span>{selectedKey.name}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-semibold">Clave:</span>
                  <span>{selectedKey.key}</span>
                </li>
              </ul>
            </div>
          </ConfirmDialog>
        </>
      )}
    </>
  );
}
