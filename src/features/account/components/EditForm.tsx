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
import { type MouseEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";

import type { IAdmin } from "@admin/interfaces/admin.interface";
import { AccountService } from "@account/services/profile.service";
import { UsersService } from "@users/services/users.service";
import { profileSchema } from "@account/schemas/profile.schema";
import { useAuthStore } from "@auth/stores/auth.store";
import { useDebounce } from "@core/hooks/useDebounce";
import { useTryCatch } from "@core/hooks/useTryCatch";

export function EditForm() {
  const [adminToUpdate, setAdminToUpdate] = useState<IAdmin | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [icError, setIcError] = useState<string | null>(null);
  const [passwordField, setPasswordField] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const navigate = useNavigate();
  const ownAdmin = useAuthStore((state) => state.admin);
  const refreshAdmin = useAuthStore((state) => state.refreshAdmin);
  const { isLoading: isLoadingAdmin, tryCatch: tryCatchAdmin } = useTryCatch();
  const { isLoading: isSaving, tryCatch: tryCatchSubmit } = useTryCatch();

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

  useEffect(() => {
    async function checkUsername() {
      if (!debouncedUsername || debouncedUsername.length <= 3) return;
      if (debouncedUsername === adminToUpdate?.userName) return;

      const response = await UsersService.checkUsernameAvailability(debouncedUsername);
      if (response.data === false) {
        const message = "Nombre de usuario ya registrado";
        setUsernameError(message);
        form.setError("userName", { message });
      }
    }

    checkUsername();
  }, [debouncedUsername, adminToUpdate?.userName, form]);

  useEffect(() => {
    async function findOneWithCredentials(): Promise<void> {
      if (!ownAdmin) return;

      // const [admin, adminError] = await tryCatchAdmin(UsersService.findOneWithCredentials(ownAdmin.id));
      const [admin, adminError] = await tryCatchAdmin(AccountService.get());

      if (adminError) {
        toast.error(adminError.message);
        return;
      }

      if (admin && admin.statusCode === 200) {
        if (admin.data) {
          form.reset({
            email: admin.data.email,
            firstName: admin.data.firstName,
            ic: admin.data.ic,
            lastName: admin.data.lastName,
            password: "",
            phoneNumber: admin.data.phoneNumber,
            userName: admin.data.userName,
          });
          setAdminToUpdate(admin.data);
        }
      }
    }

    findOneWithCredentials();
  }, [form, navigate, ownAdmin, tryCatchAdmin]);

  function togglePasswordField(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setPasswordField(!passwordField);
  }

  async function onSubmit(data: any): Promise<void> {
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
    if (data.email !== adminToUpdate?.email) {
      const emailAvailableResponse = await UsersService.checkEmailAvailability(data.email);

      if (emailAvailableResponse.data === false) {
        const errorMsg = "Email ya registrado";
        setEmailError(errorMsg);
        form.setError("email", { message: errorMsg });
        return;
      }
    }

    // Check again for race condition: before first check another admin use same ic
    if (data.ic !== adminToUpdate?.ic) {
      const icAvailableResponse = await UsersService.checkIcAvailability(data.ic);

      if (icAvailableResponse.data === false) {
        const errorMsg = "DNI ya registrado";
        setIcError(errorMsg);
        form.setError("ic", { message: errorMsg });
        return;
      }
    }

    // Check again for race condition: before first check another admin use same username
    if (data.userName !== adminToUpdate?.userName) {
      const usernameAvailableResponse = await UsersService.checkUsernameAvailability(data.userName);

      if (usernameAvailableResponse.data === false) {
        const errorMsg = "Nombre de usuario ya registrado";
        setUsernameError(errorMsg);
        form.setError("userName", { message: errorMsg });
        return;
      }
    }

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
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="ic">DNI</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    id="ic"
                    maxLength={9}
                    {...field}
                    onChange={async (e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      field.onChange(value);

                      setIcError(null);
                      form.clearErrors("ic");

                      if (value.length > 7 && value !== adminToUpdate?.ic) {
                        const response = await UsersService.checkIcAvailability(value);
                        if (response.data === false) {
                          const errorMsg = "DNI ya registrado";
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
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="userName">Usuario</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
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
                <Field data-invalid={fieldState.invalid} className="col-span-5 md:col-span-3">
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    id="email"
                    {...field}
                    onChange={async (e) => {
                      field.onChange(e);
                      setEmailError(null);
                      form.clearErrors("email");

                      const emailValue = e.target.value;
                      const emailValidation = z.email().safeParse(emailValue);

                      if (emailValidation.success && emailValue !== adminToUpdate?.email) {
                        const response = await UsersService.checkEmailAvailability(emailValue);
                        if (response.data === false) {
                          const errorMsg = "Email ya registrado";
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
