import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

import type z from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";

import { PERMISSIONS } from "@core/constants/permissions";
import { PermissionsService } from "@permissions/services/permissions.service";
import { permissionSchema } from "@permissions/schemas/permission.schema";
import { useTryCatch } from "@core/hooks/useTryCatch";

export function CreateForm() {
  const [availableActions, setAvailableActions] = useState<{ name: string; value: string }[]>([]);
  const [unavailableActions, setUnavailableActions] = useState<boolean>(false);
  const navigate = useNavigate();
  const { isLoading: isLoadingActions, tryCatch: tryCatchActions } = useTryCatch();
  const { isLoading: isSaving, tryCatch: tryCatchSubmit } = useTryCatch();

  const form = useForm<z.infer<typeof permissionSchema>>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      actionKey: "",
      category: "",
      description: "",
      name: "",
    },
  });

  const selectedCategory = useWatch({
    control: form.control,
    name: "category",
  });

  useEffect(() => {
    async function getAvailableActions() {
      if (!selectedCategory) return;

      setAvailableActions([]);

      const category = PERMISSIONS.find((cat) => cat.value === selectedCategory);

      const [response, error] = await tryCatchActions(PermissionsService.findAllByCategory(selectedCategory));

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response && response.statusCode === 200 && category) {
        const usedPermissions = response.data || [];
        const usedActionKeys = usedPermissions.filter((p) => p.category === selectedCategory).map((p) => p.actionKey);
        const filteredActions = category.actions.filter((action) => !usedActionKeys.includes(action.value));

        setAvailableActions(filteredActions);

        if (filteredActions.length === 0) {
          setUnavailableActions(true);
        } else {
          setUnavailableActions(false);
        }
      }
    }

    getAvailableActions();
  }, [selectedCategory, tryCatchActions]);

  useEffect(() => {
    if (selectedCategory) {
      form.setValue("actionKey", "");
    }
  }, [selectedCategory, form]);

  async function onSubmit(data: z.infer<typeof permissionSchema>) {
    const [response, error] = await tryCatchSubmit(PermissionsService.create(data));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 201) {
      toast.success(response.message);
      resetForm();
    }
  }

  function resetForm(): void {
    form.reset();
    navigate("/permissions");
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Permiso</CardTitle>
          <CardDescription>Creá un permiso para usarlo en roles del sistema</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <form className="grid grid-cols-1 gap-6" id="create-permission" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="grid grid-cols-5 gap-6">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="col-span-5 md:col-span-3" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Nombre</FieldLabel>
                    <Input aria-invalid={fieldState.invalid} id="name" {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="category">Categoría</FieldLabel>
                    <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="roleId" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERMISSIONS.map((cat, index) => (
                          <SelectItem key={index} value={cat.value}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="actionKey"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="actionKey">Acción</FieldLabel>
                    <Select
                      disabled={!selectedCategory || availableActions.length === 0}
                      key={field.value}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="permissionAction" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableActions.map((action, index) => (
                          <SelectItem disabled={availableActions.length === 0} key={index} value={action.value}>
                            {action.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    {unavailableActions && <FieldError errors={[{ message: "No hay acciones disponibles" }]} />}
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup className="grid grid-cols-1 gap-6">
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="description">Descripción</FieldLabel>
                    <Input aria-invalid={fieldState.invalid} id="description" {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between pt-4">
          <div>{isLoadingActions && <Loader className="text-sm" size={18} text="Cargando acciones" />}</div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
            <Button disabled={!form.formState.isDirty} form="create-permission" type="submit" variant="default">
              {isSaving ? <Loader color="white" text="Guardando" /> : "Guardar"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
