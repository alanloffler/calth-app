import { Eye, EyeOff } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";

import z from "zod";
import { toast } from "sonner";
import { type MouseEvent, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";

import type { IUser } from "@users/interfaces/user.interface";
import { AccountService } from "@account/services/profile.service";
import { UsersService } from "@users/services/users.service";
import { profileSchema } from "@account/schemas/profile.schema";
import { tryCatch } from "@core/utils/try-catch";
import { useAuthStore } from "@auth/stores/auth.store";
import { useDebounce } from "@core/hooks/useDebounce";
import { useTryCatch } from "@core/hooks/useTryCatch";

export function EditForm() {
  const [adminToUpdate, setAdminToUpdate] = useState<IUser | undefined>(undefined);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [ic, setIc] = useState<string>("");
  const [icError, setIcError] = useState<string | null>(null);
  const [passwordField, setPasswordField] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const navigate = useNavigate();
  const ownAdmin = useAuthStore((state) => state.admin);
  const refreshAdmin = useAuthStore((state) => state.refreshAdmin);
  const { isLoading: isSaving, tryCatch: tryCatchSubmit } = useTryCatch();

  const debouncedEmail = useDebounce(email, 500);
  const debouncedIc = useDebounce(ic, 500);
  const debouncedUsername = useDebounce(username, 500);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: "",
      firstName: "",
      ic: "",
      lastName: "",
      password: "",
      phoneNumber: "",
      userName: "",
    },
  });

  const { data: admin, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ["auth", "account"],
    queryFn: () => AccountService.get(),
    select: (response) => response.data,
    enabled: !!ownAdmin,
  });

  useEffect(() => {
    if (admin) {
      form.reset({
        email: admin.email,
        firstName: admin.firstName,
        ic: admin.ic,
        lastName: admin.lastName,
        password: "",
        phoneNumber: admin.phoneNumber,
        userName: admin.userName,
      });
      setAdminToUpdate(admin);
    }
  }, [admin, form, setAdminToUpdate]);

  const checkEmail = useCallback(
    async (value: string) => {
      if (!value || value.length <= 3) return true;
      if (value === adminToUpdate?.email) return true;

      const [response, error] = await tryCatch(UsersService.checkEmailAvailability(value));
      if (response?.data === false || error) {
        const message = error ? "Error al comprobar email" : "Email ya registrado";
        setEmailError(message);
        form.setError("email", { message });
        return false;
      }
      return true;
    },
    [form, adminToUpdate?.email],
  );

  const checkIc = useCallback(
    async (value: string) => {
      if (!value || value.length <= 7 || value.length > 8) return true;
      if (value === adminToUpdate?.ic) return true;

      const [response, error] = await tryCatch(UsersService.checkIcAvailability(value));
      if (response?.data === false || error) {
        const message = error ? "Error al comprobar DNI" : "DNI ya registrado";
        setIcError(message);
        form.setError("ic", { message });
        return false;
      }
      return true;
    },
    [form, adminToUpdate?.ic],
  );

  const checkUsername = useCallback(
    async (value: string): Promise<boolean> => {
      if (!value || value.length <= 3) return true;
      if (value === adminToUpdate?.userName) return true;

      const [response, error] = await tryCatch(UsersService.checkUsernameAvailability(value));
      if (response?.data === false || error) {
        const message = error ? "Error al comprobar nombre de usuario" : "Nombre de usuario ya registrado";
        setUsernameError(message);
        form.setError("userName", { message });
        return false;
      }
      return true;
    },
    [form, adminToUpdate?.userName],
  );

  // Writting validations
  useEffect(() => {
    checkEmail(debouncedEmail);
  }, [checkEmail, debouncedEmail]);

  useEffect(() => {
    checkIc(debouncedIc);
  }, [checkIc, debouncedIc]);

  useEffect(() => {
    checkUsername(debouncedUsername);
  }, [checkUsername, debouncedUsername]);

  function togglePasswordField(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setPasswordField(!passwordField);
  }

  async function onSubmit(data: any): Promise<void> {
    const [emailOk, icOk, usernameOk] = await Promise.all([
      checkEmail(data.email),
      checkIc(data.ic),
      checkUsername(data.userName),
    ]);

    if (!emailOk || !icOk || !usernameOk) return;

    const updateData = data.password
      ? data
      : Object.fromEntries(Object.entries(data).filter(([key]) => key !== "password"));

    const [update, updateError] = await tryCatchSubmit(AccountService.update(updateData));

    if (updateError) {
      toast.error(updateError.message);
      return;
    }

    if (update?.statusCode === 200) {
      toast.success("Perfil actualizado");
      await refreshAdmin();
      navigate("/");
    }
  }

  function handleCancel(): void {
    form.reset();
    navigate(-1);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi cuenta</CardTitle>
        <CardDescription>Actualizá los datos de tu perfil</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <form className="grid grid-cols-1 gap-6" id="edit-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field>
              <FieldLabel>ID</FieldLabel>
              <Input className="pointer-events-none" id="id" readOnly value={ownAdmin!.id} />
            </Field>
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
                      setIcError(null);
                      form.clearErrors("ic");

                      const value = e.target.value;
                      form.setValue("ic", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });

                      setIc(value);
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
                  <FieldLabel htmlFor="password">Nueva Contraseña (opcional)</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      aria-invalid={fieldState.invalid}
                      id="password"
                      type={passwordField ? "password" : "text"}
                      {...field}
                    />
                    <button
                      type="button"
                      className="p-1 transition-colors duration-150 hover:text-sky-500"
                      onClick={(e) => togglePasswordField(e)}
                    >
                      {passwordField ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  </div>
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
                      setEmailError(null);
                      form.clearErrors("email");

                      const value = e.target.value;
                      const emailValidation = z.email().safeParse(value);

                      form.setValue("email", value, {
                        shouldDirty: true,
                        shouldValidate: emailValidation.success,
                      });

                      if (emailValidation.success) setEmail(value);
                    }}
                  />
                  {(fieldState.invalid || emailError) && (
                    <FieldError errors={emailError ? [{ message: emailError }] : [fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="phoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="col-span-5 md:col-span-2">
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
        {adminToUpdate && (
          <div className="mt-8 flex items-center gap-3">
            <span className="text-sm">Tu rol es</span>
            <Badge size="normal" variant="role">
              {adminToUpdate?.role.name}
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4">
        <div>{isLoadingAdmin && <Loader className="text-sm" size={18} text="Cargando tu información" />}</div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button disabled={!form.formState.isDirty} form="edit-form" type="submit" variant="default">
            {isSaving ? <Loader color="white" text="Guardando" /> : "Guardar"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
