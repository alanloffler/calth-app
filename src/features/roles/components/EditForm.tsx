import { LockKeyhole } from "lucide-react";

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
import { useNavigate, useParams } from "react-router";
import { useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { IPermissionGroup } from "@permissions/interfaces/permission-group.interface";
import { ERoles } from "@auth/enums/role.enum";
import { PermissionsService } from "@permissions/services/permissions.service";
import { RolesService } from "@roles/services/roles.service";
import { cn } from "@lib/utils";
import { roleSchema } from "@roles/schemas/role.schema";
import { useAuthStore } from "@auth/stores/auth.store";
import { useTryCatch } from "@core/hooks/useTryCatch";

const CRITICAL_PERMISSIONS_FOR_SUPERADMIN = ["roles-view", "roles-update"];

export function EditForm() {
  const [permissions, setPermissions] = useState<any | undefined>(undefined);
  const [permissionsError, setPermissionsError] = useState<boolean>(false);
  const [roleValue, setRoleValue] = useState<string>("");
  const navigate = useNavigate();
  const refreshAdmin = useAuthStore((state) => state.refreshAdmin);
  const { id } = useParams();
  const { isLoading: isLoadingPermissions, tryCatch: tryCatchPermissions } = useTryCatch();
  const { isLoading: isLoadingRole, tryCatch: tryCatchRole } = useTryCatch();
  const { isLoading: isSaving, tryCatch: tryCatchSubmit } = useTryCatch();

  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      description: "",
      name: "",
      permissions: [],
      value: "",
    },
  });

  const permissionsWatch = useWatch({
    control: form.control,
    name: "permissions",
  });

  useEffect(() => {
    async function loadData() {
      const [roleResponse, roleError] = await tryCatchRole(RolesService.findOne(id!));

      if (roleError) {
        toast.error(roleError?.message || "Error cargando datos");
        return;
      }

      if (roleResponse?.statusCode === 200 && roleResponse.data) {
        form.setValue("name", roleResponse.data.name);
        form.setValue("description", roleResponse.data.description);
        form.setValue("value", roleResponse.data.value);
        setRoleValue(roleResponse.data.value);

        const [permissionsResponse, permissionsError] = await tryCatchPermissions(PermissionsService.findAllGrouped());

        if (permissionsError) {
          setPermissionsError(true);
          toast.error(permissionsError?.message || "Error cargando datos");
          return;
        }

        if (permissionsResponse?.statusCode === 200 && permissionsResponse.data) {
          const rolePermissionKeys = new Set(
            roleResponse?.data?.rolePermissions?.map((rp) => rp.permission?.actionKey) || [],
          );

          const processedPermissions = permissionsResponse.data
            .map((permGroup) => ({
              ...permGroup,
              actions: permGroup.actions.map((action) => {
                return {
                  ...action,
                  value: rolePermissionKeys.has(action.key),
                  deletedAt: action.deletedAt,
                };
              }),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

          setPermissions(processedPermissions);
          form.setValue("permissions", processedPermissions);
        }
      }
    }

    loadData();
  }, [id, form, tryCatchPermissions, tryCatchRole]);

  async function onSubmit(data: z.infer<typeof roleSchema>) {
    const cleanedData = {
      ...data,
      permissions: data.permissions.map((permGroup) => ({
        ...permGroup,
        actions: permGroup.actions.filter((action) => !action.deletedAt),
      })),
    };

    const [response, error] = await tryCatchSubmit(RolesService.update(id!, cleanedData));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      await refreshAdmin();
      resetForm();
    }
  }

  function resetForm(): void {
    form.reset();
    navigate("/roles");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Rol</CardTitle>
        <CardDescription>Actualizá los datos del rol</CardDescription>
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
                                  const isDeleted = !!action.deletedAt;
                                  const isSuperAdmin = roleValue === ERoles.super;
                                  const isCriticalPermission = CRITICAL_PERMISSIONS_FOR_SUPERADMIN.includes(action.key);
                                  const isLockedForSuperAdmin = isSuperAdmin && isCriticalPermission;

                                  const hasOtherPermissionsChecked = isViewPermission
                                    ? permission.actions.some(
                                        (a, idx) =>
                                          !a.key.endsWith("-view") &&
                                          permissionsWatch?.[permIndex]?.actions?.[idx]?.value,
                                      )
                                    : false;

                                  return (
                                    <>
                                      <Checkbox
                                        id={action.key}
                                        checked={field.value}
                                        disabled={hasOtherPermissionsChecked || isDeleted || isLockedForSuperAdmin}
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
                                      <Label
                                        htmlFor={action.key}
                                        className={cn(
                                          isDeleted && "text-muted-foreground flex items-center line-through",
                                        )}
                                      >
                                        {action.name}
                                        {isLockedForSuperAdmin && (
                                          <span className="text-muted-foreground ml-2 text-xs">
                                            <LockKeyhole className="h-3.5 w-3.5" />
                                          </span>
                                        )}
                                      </Label>
                                    </>
                                  );
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                ) : (
                  permissionsError && (
                    <span className="text-destructive text-center text-sm">Error cargando permisos</span>
                  )
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
      <CardFooter className="flex justify-between pt-4">
        <div>{isLoadingRole && <Loader className="text-sm" size={18} text="Cargando rol" />}</div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={resetForm}>
            Cancelar
          </Button>
          <Button disabled={!form.formState.isDirty} form="create-role" type="submit" variant="default">
            {isSaving ? <Loader color="white" text="Guardando" /> : "Guardar"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
