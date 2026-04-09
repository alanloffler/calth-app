import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Checkbox } from "@components/ui/checkbox";
import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Loader } from "@components/Loader";

import type z from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { IPermissionGroup } from "@permissions/interfaces/permission-group.interface";
import { PermissionsService } from "@permissions/services/permissions.service";
import { RolesService } from "@roles/services/roles.service";
import { cn } from "@core/lib/utils";
import { roleSchema } from "@roles/schemas/role.schema";
import { useTryCatch } from "@core/hooks/useTryCatch";

export function CreateForm() {
  const [permissions, setPermissions] = useState<IPermissionGroup[] | undefined>(undefined);
  const navigate = useNavigate();
  const { isLoading: isLoadingPermissions, tryCatch: tryCatchPermissions } = useTryCatch();
  const { isLoading: isSaving, tryCatch: tryCatchSubmit } = useTryCatch();

  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      description: "",
      name: "",
      value: "",
      permissions: [],
    },
  });

  const permissionsWatch = useWatch({
    control: form.control,
    name: "permissions",
  });

  useEffect(() => {
    async function fetchPermissions() {
      const [response, error] = await tryCatchPermissions(PermissionsService.findAllGrouped());

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response && response.statusCode === 200) {
        setPermissions(response.data);
        form.setValue("permissions", response.data || []);
      }
    }

    fetchPermissions();
  }, [form, tryCatchPermissions]);

  async function onSubmit(data: z.infer<typeof roleSchema>) {
    const [response, error] = await tryCatchSubmit(RolesService.create(data));

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
    navigate("/roles");
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Rol</CardTitle>
          <CardDescription>Creá un rol para los administradores del sistema</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <form className="grid grid-cols-1 gap-6" id="create-role" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Nombre</FieldLabel>
                    <Input aria-invalid={fieldState.invalid} id="name" {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="value"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="value">Valor</FieldLabel>
                    <Input aria-invalid={fieldState.invalid} id="value" {...field} />
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
            <div className="flex flex-col gap-3">
              <Label className={form.formState.errors.permissions && "text-destructive"}>Permisos</Label>
              <FieldGroup>
                <div
                  className={cn(
                    "flex flex-col gap-5 rounded-md border p-6",
                    form.formState.errors.permissions && "border-destructive",
                  )}
                >
                  {isLoadingPermissions ? (
                    <span className="text-foreground! flex justify-center text-sm">
                      <Loader size={18} text="Descargando permisos" />
                    </span>
                  ) : permissions ? (
                    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                      {permissions.map((permission: IPermissionGroup, permIndex: number) => (
                        <li className="flex flex-col gap-3" key={permission.id}>
                          <h2 className="text-xxs font-medium uppercase">{permission.name}</h2>
                          <ul className="flex flex-col gap-3 pl-4">
                            {permission.actions.map((action, actionIndex) => (
                              <li className="flex items-center gap-2" key={action.id}>
                                <Controller
                                  name={`permissions.${permIndex}.actions.${actionIndex}.value`}
                                  control={form.control}
                                  render={({ field }) => {
                                    const isViewPermission = action.key.endsWith("-view");

                                    const hasOtherPermissionsChecked = isViewPermission
                                      ? permission.actions.some(
                                          (a, idx) =>
                                            !a.key.endsWith("-view") &&
                                            permissionsWatch?.[permIndex]?.actions?.[idx]?.value,
                                        )
                                      : false;

                                    return (
                                      <Checkbox
                                        id={action.key}
                                        checked={field.value}
                                        disabled={hasOtherPermissionsChecked}
                                        onCheckedChange={(checked) => {
                                          field.onChange(checked);

                                          if (checked && !action.key.endsWith("-view")) {
                                            const viewActionIndex = permission.actions.findIndex(
                                              (a) => a.key === `${permission.module}-view`,
                                            );

                                            if (viewActionIndex !== -1) {
                                              form.setValue(
                                                `permissions.${permIndex}.actions.${viewActionIndex}.value`,
                                                true,
                                                { shouldDirty: true },
                                              );
                                            }
                                          }

                                          if (form.formState.errors.permissions) {
                                            form.clearErrors("permissions");
                                          }
                                        }}
                                      />
                                    );
                                  }}
                                />
                                <Label htmlFor={action.key}>{action.name}</Label>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-destructive text-center text-sm">Error cargando permisos</span>
                  )}
                </div>
              </FieldGroup>
              {form.formState.errors.permissions && (
                <FieldError
                  errors={[{ message: form.formState.errors.permissions.root?.message || "Error en permisos" }]}
                />
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="justify-end gap-4 pt-4">
          <Button variant="ghost" onClick={resetForm}>
            Cancelar
          </Button>
          <Button disabled={!form.formState.isDirty} form="create-role" type="submit" variant="default">
            {isSaving ? <Loader color="white" text="Guardando" /> : "Guardar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
