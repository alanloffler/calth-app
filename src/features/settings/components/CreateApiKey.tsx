import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { ClearIconButton } from "@components/ui/ClearIconButton";
import { Controller } from "react-hook-form";
import { EditDialog } from "@components/dialogs/EditDialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

import type z from "zod";
import { toast } from "sonner";
import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";

import { ApiKeyService } from "@settings/services/api-key.service";
import { LINKED_TO } from "@core/config/api-key.config";
import { apiKeySchema } from "@settings/schemas/api-key.schema";
import { queryClient } from "@core/lib/query-client";
import { useAuthStore } from "@auth/stores/auth.store";

interface IProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function CreateApiKey({ open, setOpen }: IProps) {
  const refreshAdmin = useAuthStore((state) => state.refreshAdmin);

  const createForm = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: "",
      key: "",
      linkedTo: undefined,
      active: false,
    },
  });

  const { mutate: createApiKey, isPending: isCreating } = useMutation({
    mutationKey: ["api-keys", "create"],
    mutationFn: (data: z.infer<typeof apiKeySchema>) => ApiKeyService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      refreshAdmin();
      toast.success(response.message);
    },
    onSettled: () => {
      setOpen(false);
    },
  });

  useEffect(() => {
    if (!open) {
      createForm.reset();
    }
  }, [open, createForm]);

  const linkedTo = useWatch({ control: createForm.control, name: "linkedTo" });
  if (linkedTo === undefined) createForm.setValue("active", false);

  return (
    <EditDialog
      open={open}
      setOpen={setOpen}
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
          <Controller
            name="linkedTo"
            control={createForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="linkedTo">Enlazar con</FieldLabel>
                <div className="flex items-center gap-3">
                  <Select aria-invalid={fieldState.invalid} value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger className="w-1/2" id="linkedTo">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {LINKED_TO.map((lt) => (
                        <SelectItem key={lt.id} value={lt.value}>
                          {lt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ClearIconButton type="button" state={field.value} onClear={() => field.onChange(undefined)} />
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="active"
            control={createForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex flex-row gap-3">
                <Checkbox
                  id="active"
                  className="size-5!"
                  disabled={createForm.getValues().linkedTo === undefined}
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                />
                <FieldLabel htmlFor="active">Activo</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={!createForm.formState.isDirty} form="create-apikey" type="submit" variant="default">
            {isCreating ? <Loader color="white" text="Guardando" /> : "Guardar"}
          </Button>
        </div>
      </form>
    </EditDialog>
  );
}
