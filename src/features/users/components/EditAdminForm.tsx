import { Eye, EyeOff } from "lucide-react";

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
import { useLocation, useNavigate } from "react-router";
import { useMaskito } from "@maskito/react";
import { zodResolver } from "@hookform/resolvers/zod";

import type { IUser } from "@users/interfaces/user.interface";
import type { TPermission } from "@permissions/interfaces/permission.type";
import { UsersService } from "@users/services/users.service";
import { digitsMask } from "@core/masks/maskito-digits";
import { tryCatch } from "@core/utils/try-catch";
import { updateAdminSchema } from "@users/schemas/update-admin.schema";
import { useAuthStore } from "@auth/stores/auth.store";
import { useDebounce } from "@core/hooks/useDebounce";
import { usePermission } from "@permissions/hooks/usePermission";
import { useTryCatch } from "@core/hooks/useTryCatch";

interface IProps {
  userId: string;
}

export function EditAdminForm({ userId }: IProps) {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [ic, setIc] = useState<string>("");
  const [icError, setIcError] = useState<string | null>(null);
  const [passwordField, setPasswordField] = useState<boolean>(true);
  const [userToUpdate, setUserToUpdate] = useState<IUser | null>(null);
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const admin = useAuthStore((state) => state.admin);
  const location = useLocation();
  const navigate = useNavigate();
  const refreshAdmin = useAuthStore((state) => state.refreshAdmin);
  const userRole = location.state.role;
  const { isLoading: isLoadingAdmin, tryCatch: tryCatchAdmin } = useTryCatch();
  const { isLoading: isSaving, tryCatch: tryCatchSubmit } = useTryCatch();

  const debouncedEmail = useDebounce(email, 500);
  const debouncedIc = useDebounce(ic, 500);
  const debouncedUsername = useDebounce(username, 500);

  const canUpdatePassword = usePermission(`${userRole}-update-password` as TPermission);

  const icRef = useMaskito({ options: digitsMask });
  const phoneRef = useMaskito({ options: digitsMask });

  const form = useForm<z.input<typeof updateAdminSchema>, unknown, z.output<typeof updateAdminSchema>>({
    resolver: zodResolver(updateAdminSchema),
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

  const checkEmail = useCallback(
    async (value: string) => {
      if (!value || value.length <= 3) return true;
      if (value === userToUpdate?.email) return true;

      const [response, error] = await tryCatch(UsersService.checkEmailAvailability(value));
      if (response?.data === false || error) {
        const message = error ? "Error al comprobar email" : "Email ya registrado";
        setEmailError(message);
        form.setError("email", { message });
        return false;
      }
      return true;
    },
    [form, userToUpdate?.email],
  );

  const checkIc = useCallback(
    async (value: string) => {
      if (!value || value.length <= 7) return true;
      if (value === userToUpdate?.ic) return true;

      const [response, error] = await tryCatch(UsersService.checkIcAvailability(value));
      if (response?.data === false || error) {
        const message = error ? "Error al comprobar DNI" : "DNI ya registrado";
        setIcError(message);
        form.setError("ic", { message });
        return false;
      }
      return true;
    },
    [form, userToUpdate?.ic],
  );

  const checkUsername = useCallback(
    async (value: string): Promise<boolean> => {
      if (!value || value.length <= 3) return true;
      if (value === userToUpdate?.userName) return true;

      const [response, error] = await tryCatch(UsersService.checkUsernameAvailability(value));
      if (response?.data === false || error) {
        const message = error ? "Error al comprobar nombre de usuario" : "Nombre de usuario ya registrado";
        setUsernameError(message);
        form.setError("userName", { message });
        return false;
      }
      return true;
    },
    [form, userToUpdate?.userName],
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

  useEffect(() => {
    async function findOneWithCredentials(): Promise<void> {
      const [user, userError] = await tryCatchAdmin(UsersService.findWithProfile(userId, "admin"));

      if (userError) {
        toast.error(userError.message);
        return;
      }

      if (user && user.statusCode === 200) {
        if (user.data) {
          form.reset({
            email: user.data.email,
            firstName: user.data.firstName,
            ic: user.data.ic,
            lastName: user.data.lastName,
            password: "",
            phoneNumber: user.data.phoneNumber,
            userName: user.data.userName,
          });

          setUserToUpdate(user.data);
        }
      }
    }

    findOneWithCredentials();
  }, [userId, form, tryCatchAdmin]);

  function togglePasswordField(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setPasswordField(!passwordField);
  }

  async function onSubmit(data: z.infer<typeof updateAdminSchema>): Promise<void> {
    if (emailError) {
      form.setError("email", { message: emailError });
      return;
    }

    const [icOk, usernameOk] = await Promise.all([checkIc(data.email), checkUsername(data.userName)]);

    if (!icOk || !usernameOk) return;

    // Check again for race condition: before first check another admin use same ic
    if (data.email !== userToUpdate?.email) {
      const [emailAvailableResponse, emailAvailableError] = await tryCatch(
        UsersService.checkEmailAvailability(data.email),
      );

      if (emailAvailableResponse?.data === false || emailAvailableError) {
        const errorMsg = emailAvailableError ? "Error al comprobar email" : "Email ya registrado";
        setEmailError(errorMsg);
        form.setError("email", { message: errorMsg });
        return;
      }
    }

    const updateData = data.password
      ? data
      : Object.fromEntries(Object.entries(data).filter(([key]) => key !== "password"));

    const [update, updateError] = await tryCatchSubmit(UsersService.update(userId, "admin", updateData));

    if (updateError) {
      toast.error(updateError.message);
      return;
    }

    if (update?.statusCode === 200) {
      if (userToUpdate?.ic === admin?.ic) {
        refreshAdmin();
      }
      toast.success(update.message);
      navigate("/users/role/admin");
    }
  }

  function handleCancel(): void {
    form.reset();
    navigate(-1);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edición de administrador</CardTitle>
        <CardDescription>Actualizá los datos del administrador</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-6 md:grid-cols-2" id="update-user" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 border-t pt-4">
              <h2 className="text-muted-foreground text-base font-medium">Datos personales</h2>
              <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                        ref={(node) => {
                          field.ref(node);
                          icRef(node);
                        }}
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
            </div>
            <div className="flex flex-col gap-3 border-t pt-4">
              <h2 className="text-muted-foreground text-base font-medium">Seguridad</h2>
              <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="col-span-8" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                      <div className="flex items-center gap-2">
                        <Input
                          aria-invalid={fieldState.invalid}
                          className={!canUpdatePassword ? "placeholder:text-red-500" : ""}
                          disabled={!canUpdatePassword}
                          id="password"
                          type={passwordField ? "password" : "text"}
                          placeholder={!canUpdatePassword ? "Permiso requerido" : ""}
                          {...field}
                        />
                        <button
                          className="disabled:hover:text-foreground p-1 transition-colors duration-150 hover:text-sky-500 disabled:opacity-50"
                          disabled={!canUpdatePassword}
                          onClick={(e) => togglePasswordField(e)}
                          type="button"
                        >
                          {passwordField ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 border-t pt-4">
              <h2 className="text-muted-foreground text-base font-medium">Medios de contacto</h2>
              <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="col-span-6" data-invalid={fieldState.invalid || !!emailError}>
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
                    <Field className="col-span-6" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id="phone"
                        maxLength={11}
                        ref={(node) => {
                          field.ref(node);
                          phoneRef(node);
                        }}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4">
        <div>{isLoadingAdmin && <Loader className="text-sm" size={18} text="Cargando administrador" />}</div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button disabled={!form.formState.isDirty} form="update-user" type="submit" variant="default">
            {isSaving ? <Loader color="white" text="Guardando" /> : "Guardar"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
