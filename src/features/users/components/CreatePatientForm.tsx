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
import { useLocation, useNavigate } from "react-router";
import { useMaskito } from "@maskito/react";
import { zodResolver } from "@hookform/resolvers/zod";

import type { TUserRole } from "@roles/interfaces/user-role.type";
import { ERoles } from "@auth/enums/role.enum";
import { GENDERS } from "@core/constants/genders.constant";
import { UsersService } from "@users/services/users.service";
import { createPatientSchema } from "@users/schemas/create-patient.schema";
import { dateMask } from "@core/masks/maskito-date";
import { digitsMask } from "@core/masks/maskito-digits";
import { numberMask } from "@core/masks/maskito-number";
import { tryCatch } from "@core/utils/try-catch";
import { uppercaseFirst } from "@core/formatters/uppercase-first.formatter";
import { useDebounce } from "@core/hooks/useDebounce";
import { useTryCatch } from "@core/hooks/useTryCatch";

// TODO: get from settings store, needs db changes
const LOCALE = "es";

export function CreatePatientForm() {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [icError, setIcError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const roleTranslated = ERoles[location.state.role as TUserRole];
  const { isLoading: isSaving, tryCatch: tryCatchPatient } = useTryCatch();

  const debouncedUsername = useDebounce(username, 500);

  const birthDayRef = useMaskito({ options: dateMask });
  const icRef = useMaskito({ options: digitsMask });
  const heightRef = useMaskito({ options: digitsMask });
  const phoneRef = useMaskito({ options: digitsMask });
  const weightRef = useMaskito({ options: numberMask });

  const form = useForm<z.input<typeof createPatientSchema>, unknown, z.output<typeof createPatientSchema>>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      email: "",
      firstName: "",
      ic: "",
      lastName: "",
      password: "",
      phoneNumber: "",
      userName: "@",
      gender: "",
      birthDay: "",
      bloodType: "",
      weight: "",
      height: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  async function onSubmit(data: z.output<typeof createPatientSchema>) {
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

    const [create, createError] = await tryCatchPatient(UsersService.createPatient(data));

    if (createError) {
      toast.error(createError.message);
      return;
    }

    if (create && create.data && create.statusCode === 201) {
      toast.success(create.message);
      navigate("/users/role/patient");
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
                          field.onChange(e);

                          const value = e.target.value;

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
                <Controller
                  name="birthDay"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="birthDay">Fecha de nacimiento</FieldLabel>
                      <Input
                        aria-invalid={fieldState.invalid}
                        id="birthDay"
                        {...field}
                        placeholder="dd/mm/aaaa"
                        ref={(node) => {
                          field.ref(node);
                          birthDayRef(node);
                        }}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
            <div className="flex flex-col gap-3 border-t pt-4">
              <h2 className="text-muted-foreground text-base font-medium">Datos médicos</h2>
              <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Controller
                  name="gender"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="gender">Género</FieldLabel>
                      <Select
                        disabled={GENDERS[LOCALE].length === 0}
                        key={field.value}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="roleId" aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDERS[LOCALE].map((gender) => (
                            <SelectItem key={gender.value} value={gender.value}>
                              {gender.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="bloodType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="bloodType">Tipo de sangre</FieldLabel>
                      <Input aria-invalid={fieldState.invalid} id="bloodType" maxLength={21} {...field} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="weight"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="weight">Peso (Kg)</FieldLabel>
                      <Input
                        aria-invalid={fieldState.invalid}
                        id="weight"
                        maxLength={6}
                        {...field}
                        ref={(node) => {
                          field.ref(node);
                          weightRef(node);
                        }}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="height"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="height">Altura (Cm)</FieldLabel>
                      <Input
                        aria-invalid={fieldState.invalid}
                        id="height"
                        maxLength={3}
                        {...field}
                        ref={(node) => {
                          field.ref(node);
                          heightRef(node);
                        }}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                <Controller
                  name="emergencyContactName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="col-span-6" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="emergencyContactName">Contacto de emergencia</FieldLabel>
                      <Input aria-invalid={fieldState.invalid} id="emergencyContactName" maxLength={51} {...field} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="emergencyContactPhone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="col-span-6" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="emergencyContactPhone">Teléfono de emergencia</FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id="emergencyContactPhone"
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
