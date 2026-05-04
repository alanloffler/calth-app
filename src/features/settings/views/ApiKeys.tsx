import { FilePenLine, Plus, Trash2 } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { ConfirmDialog } from "@components/dialogs/ConfirmDialog";
import { DataTable } from "@components/data-table/DataTable";
import { EditDialog } from "@components/dialogs/EditDialog";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@auth/components/Protected";
import { SortableHeader } from "@components/data-table/SortableHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import type { IApiKey } from "@settings/interfaces/api-key.interface";
import { DefaultShortTableConfig } from "@core/config/table.config";

const keys = [
  { id: "63e69ea4-817b-4588-9e51-a93367d54f6b", name: "Anthropic", key: "5Zp7tCutWuUYoYqlsP3sGIyjXs6wEwAN" },
  { id: "1f8e7284-fc2b-4f19-86ac-452efcca45b5", name: "OpenAI", key: "I2rVd5zUkYVSmWeNBjX3z0L46usYq1tJ" },
];

export default function ApiKeys() {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [selectedKey, setSelectedKey] = useState<IApiKey | null>(null);

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
      header: () => <span>Clave parcial</span>,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.key}</span>,
    },
    {
      id: "actions",
      minSize: 168,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Protected requiredPermission="roles-update">
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
          <Protected requiredPermission="roles-delete">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="hover:text-delete"
                  onClick={() => {
                    setSelectedKey(row.original);
                    setOpenDeleteDialog(true);
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

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader title="API keys" subtitle="Gestioná las API keys para los servicios del sistema">
          <Protected requiredPermission="business-update">
            <Button variant="default" size="lg" onClick={() => console.log("create api key")}>
              <Plus />
              Crear API Key
            </Button>
          </Protected>
        </PageHeader>
        <DataTable
          columns={columns}
          controls={{ search: false }}
          data={keys}
          defaultPageSize={DefaultShortTableConfig.limit}
          defaultSorting={[{ id: "name", desc: false }]}
          loading={false}
          pageSizes={DefaultShortTableConfig.pageSizes}
          rowCount={keys?.length}
        />
      </div>
      {selectedKey && (
        <>
          <EditDialog open={openEditDialog} setOpen={setOpenEditDialog} title="Editar API Key" description="">
            <form>Editar key: {selectedKey.id}</form>
          </EditDialog>
          <ConfirmDialog
            open={openDeleteDialog}
            setOpen={setOpenDeleteDialog}
            title="Eliminar API Key"
            description="¿Seguro que querés eliminar la API key?"
            showAlert
            alertMessage="La API key será eliminada de la base de datos. Esta acción es irreversible."
            callback={() => console.log("delete api key")}
            variant="destructive"
          >
            <div>Delete key: {selectedKey.id}</div>
          </ConfirmDialog>
        </>
      )}
    </>
  );
}
