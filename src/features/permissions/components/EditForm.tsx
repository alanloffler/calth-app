import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

import type z from "zod";
import { toast } from "sonner";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";

import { PERMISSIONS } from "@core/constants/permissions";
import { PermissionsService } from "@permissions/services/permissions.service";
import { permissionSchema } from "@permissions/schemas/permission.schema";
import { queryClient } from "@core/lib/query-client";
import { useTryCatch } from "@core/hooks/useTryCatch";

export function EditForm() {
  const navigate = useNavigate();
  const previousCategory = useRef<string | undefined>(undefined);
  const { id } = useParams();
  const { isLoading: isLoadingPermission, tryCatch: tryCatchPermission } = useTryCatch();

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

  const availableActions = useMemo(() => {
    if (!selectedCategory) return [];

    const category = PERMISSIONS.find((cat) => cat.value === selectedCategory);

    return category?.actions || [];
  }, [selectedCategory]);

  useEffect(() => {
    if (previousCategory.current === undefined) {
      return;
    }

    if (previousCategory.current !== selectedCategory && selectedCategory) {
      form.setValue("actionKey", "");
      previousCategory.current = selectedCategory;
    }
  }, [selectedCategory, form]);

  useEffect(() => {
    async function fetchPermission() {
      if (id) {
        const [response, error] = await tryCatchPermission(PermissionsService.findOne(id));

        if (error) {
          toast.error(error.message);
          return;
        }

        if (response && response.statusCode === 200) {
          if (response.data) {
            form.reset({
              actionKey: response.data.actionKey,
              category: response.data.category,
              description: response.data.description,
              name: response.data.name,
            });

            previousCategory.current = response.data.category;
          }
        }
      }
    }

    fetchPermission();
  }, [id, form, tryCatchPermission]);

  const { mutate: updatePermission, isPending: isSavingPermission } = useMutation({
    mutationKey: ["permissions", "update"],
    mutationFn: (data: z.infer<typeof permissionSchema>) => PermissionsService.update(id as string, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success(response.message);
      resetForm();
    },
  });

  function resetForm(): void {
    form.reset();
    navigate(-1);
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Editar Permiso</CardTitle>
          <CardDescription>Actualizá los datos del permiso</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <form
            className="grid grid-cols-1 gap-6"
            id="create-permission"
            onSubmit={form.handleSubmit((data) => updatePermission(data))}
          >
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
                          <SelectItem key={index} value={action.value}>
                            {action.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
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
        <CardFooter className="flex items-center justify-between pt-4">
          <div>{isLoadingPermission && <Loader className="text-sm" size={18} text="Descargando permiso" />}</div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
            <Button disabled={!form.formState.isDirty} form="create-permission" type="submit" variant="default">
              {isSavingPermission ? <Loader color="white" text="Guardando" /> : "Guardar"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
