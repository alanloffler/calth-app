import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";

import z from "zod";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useMaskito } from "@maskito/react";
import { zodResolver } from "@hookform/resolvers/zod";

import type { TUserRole } from "@roles/interfaces/user-role.type";
import { ERoles } from "@auth/enums/role.enum";
import { UsersService } from "@users/services/users.service";
import { createAdminSchema } from "@users/schemas/create-admin.schema";
import { digitsMask } from "@core/masks/maskito-digits";
import { tryCatch } from "@core/utils/try-catch";
import { uppercaseFirst } from "@core/formatters/uppercase-first.formatter";
import { useDebounce } from "@core/hooks/useDebounce";
import { useTryCatch } from "@core/hooks/useTryCatch";

export function CreateAdminForm() {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [ic, setIc] = useState<string>("");
  const [icError, setIcError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const roleTranslated = ERoles[location.state.role as TUserRole];
  const { isLoading: isSaving, tryCatch: tryCatchAdmin } = useTryCatch();

  const debouncedIc = useDebounce(ic, 500);
  const debouncedUsername = useDebounce(username, 500);

  const icRef = useMaskito({ options: digitsMask });
  const phoneRef = useMaskito({ options: digitsMask });

  const form = useForm<z.infer<typeof createAdminSchema>>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      email: "",
      firstName: "",
      ic: "",
      lastName: "",
      password: "",
      phoneNumber: "",
      userName: "@",
    },
  });

  const checkIc = useCallback(
    async (value: string) => {
      if (!value || value.length <= 7) return true;

      const [response, error] = await tryCatch(UsersService.checkIcAvailability(value));
      if (response?.data === false || error) {
        const message = error ? "Error al comprobar DNI" : "DNI ya registrado";
        setIcError(message);
        form.setError("ic", { message });
        return false;
      }
      return true;
    },
    [form],
  );

  const checkUsername = useCallback(
    async (value: string): Promise<boolean> => {
      if (!value || value.length <= 3) return true;

      const [response, error] = await tryCatch(UsersService.checkUsernameAvailability(value));
      if (response?.data === false || error) {
        const message = error ? "Error al comprobar nombre de usuario" : "Nombre de usuario ya registrado";
        setUsernameError(message);
        form.setError("userName", { message });
        return false;
      }
      return true;
    },
    [form],
  );

  // Writting validations
  useEffect(() => {
    checkIc(debouncedIc);
  }, [checkIc, debouncedIc]);

  useEffect(() => {
    checkUsername(debouncedUsername);
  }, [checkUsername, debouncedUsername]);

  async function onSubmit(data: z.output<typeof createAdminSchema>) {
    if (emailError) {
      form.setError("email", { message: emailError });
      return;
    }

    const [icOk, usernameOk] = await Promise.all([checkIc(data.ic), checkUsername(data.userName)]);

    if (!icOk || !usernameOk) return;

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

    const [create, createError] = await tryCatchAdmin(UsersService.createAdmin(data));

    if (createError) {
      toast.error(createError.message);
      return;
    }

    if (create && create.data && create.statusCode === 201) {
      toast.success(create.message);
      navigate("/users/role/admin");
    }
  }

  function resetForm(): void {
    form.reset();
    navigate(-1);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{`${uppercaseFirst(roleTranslated)} nuevo`}</CardTitle>
        <CardDescription>{`Creá un usuario ${roleTranslated} para el sistema`}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-6 md:grid-cols-2" id="create-user" onSubmit={form.handleSubmit(onSubmit)}>
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
                      <Input aria-invalid={fieldState.invalid} id="password" {...field} />
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
        <div></div>
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
