import { FilePenLine, Plus, Trash2 } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { ConfirmDialog } from "@components/dialogs/ConfirmDialog";
import { Controller } from "react-hook-form";
import { DataTable } from "@components/data-table/DataTable";
import { EditDialog } from "@components/dialogs/EditDialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@auth/components/Protected";
import { SortableHeader } from "@components/data-table/SortableHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import type z from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import type { IApiKey } from "@settings/interfaces/api-key.interface";
import { ApiKeyService } from "@settings/services/api-key.service";
import { DefaultShortTableConfig } from "@core/config/table.config";
import { apiKeySchema } from "@settings/schemas/api-key.schema";
import { queryClient } from "@core/lib/query-client";

export default function ApiKeys() {
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const [selectedKey, setSelectedKey] = useState<IApiKey | null>(null);

  const createForm = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: "",
      key: "",
    },
  });

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

  const { mutate: createApiKey, isPending: isCreating } = useMutation({
    mutationKey: ["api-keys", "create"],
    mutationFn: (data: z.infer<typeof apiKeySchema>) => ApiKeyService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success(response.message);
    },
    onSettled: () => {
      resetForm();
      setOpenCreateDialog(false);
    },
  });

  const { mutate: removeApiKey, isPending: isRemoving } = useMutation({
    mutationKey: ["api-keys", "remove"],
    mutationFn: (id: string) => ApiKeyService.remove(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success(response.message);
    },
    onSettled: () => {
      setOpenRemoveDialog(false);
    },
  });

  function resetForm(): void {
    createForm.reset();
  }

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
      <EditDialog
        open={openCreateDialog}
        setOpen={setOpenCreateDialog}
        title="Crear API Key"
        description="Completá el formulario para crear una nueva API key"
      >
        <form
          className="flex flex-col gap-6"
          id="create-apikey"
          onSubmit={createForm.handleSubmit((data) => createApiKey(data))}
        >
          <FieldGroup>
            <Controller
              name="name"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Proveedor</FieldLabel>
                  <Input aria-invalid={fieldState.invalid} id="name" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="key"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="key">Clave</FieldLabel>
                  <Input aria-invalid={fieldState.invalid} id="key" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <div className="flex justify-end gap-4 pt-4">
            <Button variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
            <Button disabled={!createForm.formState.isDirty} form="create-apikey" type="submit" variant="default">
              {isCreating ? <Loader color="white" text="Guardando" /> : "Guardar"}
            </Button>
          </div>
        </form>
      </EditDialog>
      {selectedKey && (
        <>
          <EditDialog open={openEditDialog} setOpen={setOpenEditDialog} title="Editar API Key" description="">
            <form>Edit form</form>
          </EditDialog>
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
