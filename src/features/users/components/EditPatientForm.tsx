import { Eye, EyeOff } from "lucide-react";

import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

import z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { type MouseEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useMaskito } from "@maskito/react";
import { zodResolver } from "@hookform/resolvers/zod";

import type { IUser } from "@users/interfaces/user.interface";
import type { TPermission } from "@permissions/interfaces/permission.type";
import { GENDERS } from "@core/constants/genders.constant";
import { UsersService } from "@users/services/users.service";
import { dateMask } from "@core/masks/maskito-date";
import { digitsMask } from "@core/masks/maskito-digits";
import { numberMask } from "@core/masks/maskito-number";
import { tryCatch } from "@core/utils/try-catch";
import { updatePatientSchema } from "@users/schemas/update-patient.schema";
import { useAuthStore } from "@auth/stores/auth.store";
import { useDebounce } from "@core/hooks/useDebounce";
import { usePermission } from "@permissions/hooks/usePermission";
import { useTryCatch } from "@core/hooks/useTryCatch";

interface IProps {
  userId: string;
}

// TODO: get from settings store, need changes on database -> ADD column
const LOCALE = "es";

export function EditPatientForm({ userId }: IProps) {
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
  const { isLoading: isLoadingPatient, tryCatch: tryCatchPatient } = useTryCatch();
  const { isLoading: isSaving, tryCatch: tryCatchSubmit } = useTryCatch();

  const debouncedEmail = useDebounce(email, 500);
  const debouncedIc = useDebounce(ic, 500);
  const debouncedUsername = useDebounce(username, 500);

  const canUpdatePassword = usePermission(`${userRole}-update-password` as TPermission);

  const birthDayRef = useMaskito({ options: dateMask });
  const icRef = useMaskito({ options: digitsMask });
  const heightRef = useMaskito({ options: digitsMask });
  const phoneRef = useMaskito({ options: digitsMask });
  const weightRef = useMaskito({ options: numberMask });

  const form = useForm<z.input<typeof updatePatientSchema>, unknown, z.output<typeof updatePatientSchema>>({
    resolver: zodResolver(updatePatientSchema),
    defaultValues: {
      email: "",
      firstName: "",
      ic: "",
      lastName: "",
      password: "",
      phoneNumber: "",
      userName: "",

      gender: "",
      birthDay: "",
      bloodType: "",
      weight: "",
      height: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  useEffect(() => {
    async function checkUsername() {
      if (!debouncedUsername || debouncedUsername.length <= 3) return;
      if (debouncedUsername === userToUpdate?.userName) return;

      const [response, error] = await tryCatch(UsersService.checkUsernameAvailability(debouncedUsername));
      if (response?.data === false || error) {
        const message = error ? "Error al comprobar nombre de usuario" : "Nombre de usuario ya registrado";
        setUsernameError(message);
        form.setError("userName", { message });
      }
    }

    checkUsername();
  }, [debouncedUsername, form, userToUpdate?.userName]);

  useEffect(() => {
    async function checkIc() {
      if (!debouncedIc || debouncedIc.length <= 7) return;
      if (debouncedIc === userToUpdate?.ic) return;

      const [response, error] = await tryCatch(UsersService.checkIcAvailability(debouncedIc));
      if (response?.data === false || error) {
        const message = error ? "Error al comprobar DNI" : "DNI ya registrado";
        setIcError(message);
        form.setError("ic", { message });
      }
    }

    checkIc();
  }, [debouncedIc, form, userToUpdate?.ic]);

  useEffect(() => {
    async function checkEmail() {
      if (!debouncedEmail || debouncedEmail.length <= 3) return;
      if (debouncedEmail === userToUpdate?.email) return;

      const [response, error] = await tryCatch(UsersService.checkEmailAvailability(debouncedEmail));
      if (response?.data === false || error) {
        const errorMsg = error ? "Error al comprobar email" : "Email ya registrado";
        setEmailError(errorMsg);
        form.setError("email", { message: errorMsg });
      }
    }

    checkEmail();
  }, [debouncedEmail, form, userToUpdate?.email]);

  useEffect(() => {
    async function findOneWithCredentials(): Promise<void> {
      const [user, userError] = await tryCatchPatient(UsersService.findWithProfile(userId, "patient"));

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

            gender: user.data.patientProfile?.gender ?? "",
            birthDay: user.data.patientProfile
              ? format(new Date(user.data.patientProfile.birthDay), "dd/MM/yyyy")
              : undefined,
            bloodType: user.data.patientProfile?.bloodType,
            weight: String(user.data.patientProfile?.weight),
            height: String(user.data.patientProfile?.height),
            emergencyContactName: user.data.patientProfile?.emergencyContactName,
            emergencyContactPhone: user.data.patientProfile?.emergencyContactPhone,
          });

          setUserToUpdate(user.data);
        }
      }
    }

    findOneWithCredentials();
  }, [userId, form, tryCatchPatient]);

  function togglePasswordField(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setPasswordField(!passwordField);
  }

  async function onSubmit(data: z.infer<typeof updatePatientSchema>): Promise<void> {
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

    // Check again for race condition: before first check another admin use same ic
    if (data.ic !== userToUpdate?.ic) {
      const [icAvailableResponse, icAvailableError] = await tryCatch(UsersService.checkIcAvailability(data.ic));

      if (icAvailableResponse?.data === false || icAvailableError) {
        const errorMsg = icAvailableError ? "Error al comprobar DNI" : "DNI ya registrado";
        setIcError(errorMsg);
        form.setError("ic", { message: errorMsg });
        return;
      }
    }

    // Check again for race condition: before first check another admin use same username
    if (data.userName !== userToUpdate?.userName) {
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
    }

    const updateData = data.password
      ? data
      : Object.fromEntries(Object.entries(data).filter(([key]) => key !== "password"));

    const [update, updateError] = await tryCatchSubmit(UsersService.update(userId, "patient", updateData));

    if (updateError) {
      toast.error(updateError.message);
      return;
    }

    if (update?.statusCode === 200) {
      if (userToUpdate?.ic === admin?.ic) {
        refreshAdmin();
      }
      toast.success(update.message);
      navigate("/users/role/patient");
    }
  }

  function handleCancel(): void {
    form.reset();
    navigate(-1);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edición de paciente</CardTitle>
        <CardDescription>Actualizá los datos del paciente</CardDescription>
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
                <Controller
                  name="gender"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="gender">Género</FieldLabel>
                      <Select
                        disabled={!GENDERS || GENDERS[LOCALE].length < 1}
                        key={field.value}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="gender" aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Género" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDERS[LOCALE].map((gender, idx) => (
                            <SelectItem key={idx} value={gender.value}>
                              {gender.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
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
                            shouldValidate: true,
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
              <h2 className="text-muted-foreground text-base font-medium">Datos médicos</h2>
              <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <Controller
                  name="bloodType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="col-span-12 md:col-span-6" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="startHour">Tipo de sangre</FieldLabel>
                      <Input aria-invalid={fieldState.invalid} id="bloodType" maxLength={21} {...field} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="weight"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="col-span-12 md:col-span-6" data-invalid={fieldState.invalid}>
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
                    <Field className="col-span-12 md:col-span-6" data-invalid={fieldState.invalid}>
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
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4">
        <div>{isLoadingPatient && <Loader className="text-sm" size={18} text="Cargando paciente" />}</div>
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
