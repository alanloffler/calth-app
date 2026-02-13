import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

import z from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";

import type { IRole } from "@roles/interfaces/role.interface";
import { RolesService } from "@roles/services/roles.service";
import { UsersService } from "@users/services/users.service";
import { createUserSchema } from "@users/schemas/create-user.schema";
import { tryCatch } from "@core/utils/try-catch";
import { useDebounce } from "@core/hooks/useDebounce";
import { useTryCatch } from "@core/hooks/useTryCatch";

export function CreateForm() {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [icError, setIcError] = useState<string | null>(null);
  const [roles, setRoles] = useState<IRole[] | undefined>(undefined);
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isLoading: isSaving, tryCatch: tryCatchUser } = useTryCatch();
  const { isLoading: isLoadingRoles, tryCatch: tryCatchRoles } = useTryCatch();

  const debouncedUsername = useDebounce(username, 500);

  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      ic: "",
      lastName: "",
      password: "",
      phoneNumber: "",
      roleId: "",
      userName: "@",
    },
  });

  async function onSubmit(data: z.infer<typeof createUserSchema>) {
    if (emailError) {
      form.setError("email", { message: emailError });
      return;
    }

    if (icError) {
      form.setError("ic", { message: icError });
      return;
    }

    if (usernameError) {
      form.setError("userName", { message: usernameError });
      return;
    }

    // Check again for race condition: before first check another admin use same ic
    const [emailAvailableResponse, emailAvailableError] = await tryCatch(
      UsersService.checkEmailAvailability(data.email),
    );

    if (emailAvailableResponse?.data === false || emailAvailableError) {
      const errorMsg = emailAvailableError ? "Error al comprobar email" : "Email ya registrado";
      setEmailError(errorMsg);
      form.setError("email", { message: errorMsg });
      return;
    }

    // Check again for race condition: before first check another admin use same ic
    const [icAvailableResponse, icAvailableError] = await tryCatch(UsersService.checkIcAvailability(data.ic));
    if (icAvailableResponse?.data === false || icAvailableError) {
      const errorMsg = icAvailableError ? "Error al comprobar DNI" : "DNI ya registrado";
      setIcError(errorMsg);
      form.setError("ic", { message: errorMsg });
      return;
    }

    // Check again for race condition: before first check another admin use same username
    const [usernameAvailableResponse, usernameAvailableError] = await tryCatch(
      UsersService.checkUsernameAvailability(data.userName),
    );

    if (usernameAvailableResponse?.data === false || usernameAvailableError) {
      const errorMsg = usernameAvailableError
        ? "Error al comprobar nombre de usuario"
        : "Nombre de usuario ya registrado";
      setUsernameError(errorMsg);
      form.setError("userName", { message: errorMsg });
      return;
    }

    const [create, createError] = await tryCatchUser(UsersService.create(data));

    if (createError) {
      toast.error(createError.message);
      return;
    }

    if (create && create.data && create.statusCode === 201) {
      toast.success(create.message);
      navigate(`/users/role/${create.data.role.value}`);
    }
  }

  useEffect(() => {
    async function checkUsername() {
      if (!debouncedUsername || debouncedUsername.length <= 3) return;

      const [response, error] = await tryCatch(UsersService.checkUsernameAvailability(debouncedUsername));
      if (response?.data === false || error) {
        const message = error ? "Error al comprobar nombre de usuario" : "Nombre de usuario ya registrado";
        setUsernameError(message);
        form.setError("userName", { message });
      }
    }

    checkUsername();
  }, [debouncedUsername, form]);

  useEffect(() => {
    async function getRoles() {
      const [roles, rolesError] = await tryCatchRoles(RolesService.findAll());

      if (rolesError) {
        toast.error(rolesError.message);
        form.control.setError("roleId", { message: "Error obteniendo roles" });
        return;
      }

      if (roles && roles.statusCode === 200 && roles.data) {
        setRoles(roles.data);
      }
    }

    getRoles();
  }, [form.control, tryCatchRoles]);

  function resetForm(): void {
    form.reset();
    navigate(-1);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Usuario</CardTitle>
        <CardDescription>Creá un usuario para el sistema</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <form className="grid grid-cols-1 gap-6" id="create-user" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              name="ic"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || !!icError}>
                  <FieldLabel htmlFor="ic">DNI</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid || !!icError}
                    id="ic"
                    maxLength={9}
                    {...field}
                    onChange={async (e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      field.onChange(value);

                      setIcError(null);
                      form.clearErrors("ic");

                      if (value.length > 7) {
                        const [response, error] = await tryCatch(UsersService.checkIcAvailability(value));
                        if (response?.data === false || error) {
                          const errorMsg = error ? "Error al comprobar DNI" : "DNI ya registrado";
                          setIcError(errorMsg);
                          form.setError("ic", { message: errorMsg });
                        }
                      }
                    }}
                  />
                  {(fieldState.invalid || icError) && (
                    <FieldError errors={icError ? [{ message: icError }] : [fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              name="userName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || !!usernameError}>
                  <FieldLabel htmlFor="userName">Usuario</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid || !!usernameError}
                    id="userName"
                    {...field}
                    onChange={(e) => {
                      setUsernameError(null);
                      form.clearErrors("userName");

                      const rawValue = e.target.value.toLowerCase();
                      const noAtSigns = rawValue.replace(/@/g, "");
                      const sanitizedContent = noAtSigns.replace(/[^a-z0-9.\-_]/g, "");
                      const finalValue = `@${sanitizedContent}`;

                      form.setValue("userName", finalValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });

                      setUsername(finalValue);
                    }}
                  />
                  {(fieldState.invalid || usernameError) && (
                    <FieldError errors={usernameError ? [{ message: usernameError }] : [fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <Input aria-invalid={fieldState.invalid} id="password" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
                  <Input aria-invalid={fieldState.invalid} id="firstName" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
                  <Input aria-invalid={fieldState.invalid} id="lastName" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <FieldGroup className="grid grid-cols-5 gap-6">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || !!emailError} className="col-span-5 md:col-span-3">
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid || !!emailError}
                    id="email"
                    {...field}
                    onChange={async (e) => {
                      field.onChange(e);
                      setEmailError(null);
                      form.clearErrors("email");

                      const emailValue = e.target.value;
                      const emailValidation = z.email().safeParse(emailValue);

                      if (emailValidation.success) {
                        const [response, error] = await tryCatch(UsersService.checkEmailAvailability(emailValue));
                        if (response?.data === false || error) {
                          const errorMsg = error ? "Error al comprobar email" : "Email ya registrado";
                          setEmailError(errorMsg);
                          form.setError("email", { message: errorMsg });
                        }
                      }
                    }}
                  />
                  {(fieldState.invalid || emailError) && (
                    <FieldError errors={emailError ? [{ message: emailError }] : [fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="roleId"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid} className="col-span-5 md:col-span-2">
                    <FieldLabel htmlFor="roleId">Rol</FieldLabel>
                    <Select disabled={!roles} key={field.value} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="roleId" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles?.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                );
              }}
            />
          </FieldGroup>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              name="phoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="col-span-1">
                  <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="phone"
                    maxLength={11}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      field.onChange(value);
                    }}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4">
        <div>{isLoadingRoles && <Loader className="text-sm" size={18} text="Cargando roles" />}</div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={resetForm}>
            Cancelar
          </Button>
          <Button disabled={!form.formState.isDirty} form="create-user" type="submit" variant="default">
            {isSaving ? <Loader color="white" text="Guardando" /> : "Guardar"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
