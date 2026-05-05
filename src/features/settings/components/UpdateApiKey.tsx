import { Button } from "@components/ui/button";
import { Controller } from "react-hook-form";
import { EditDialog } from "@components/dialogs/EditDialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";

import type z from "zod";
import { toast } from "sonner";
import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";

import type { IApiKey } from "@settings/interfaces/api-key.interface";
import { ApiKeyService } from "@settings/services/api-key.service";
import { apiKeySchema } from "@settings/schemas/api-key.schema";
import { queryClient } from "@core/lib/query-client";

interface IProps {
  apiKey: IApiKey;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function UpdateApiKey({ apiKey, open, setOpen }: IProps) {
  const form = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: apiKey.name,
      key: apiKey.key,
    },
  });

  const { mutate: updateApiKey, isPending: isUpdating } = useMutation({
    mutationKey: ["api-keys", "update"],
    mutationFn: (data: z.infer<typeof apiKeySchema>) => ApiKeyService.update(apiKey.id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success(response.message);
    },
    onSettled: () => {
      setOpen(false);
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <EditDialog
      open={open}
      setOpen={setOpen}
      title="Crear API Key"
      description="Completá el formulario para crear una nueva API key"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <form
        className="flex flex-col gap-6"
        id="create-apikey"
        onSubmit={form.handleSubmit((data) => updateApiKey(data))}
      >
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
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
            control={form.control}
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
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={!form.formState.isDirty} form="create-apikey" type="submit" variant="default">
            {isUpdating ? <Loader color="white" text="Guardando" /> : "Guardar"}
          </Button>
        </div>
      </form>
    </EditDialog>
  );
}
