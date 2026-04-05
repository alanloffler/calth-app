import { Asterisk } from "lucide-react";

import { Button } from "@components/ui/button";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";

import type { z } from "zod";
import { useEffect, useState } from "react";
import { useMaskito } from "@maskito/react";
import { zodResolver } from "@hookform/resolvers/zod";

import { UsersService } from "@users/services/users.service";
import { createAdminSchema } from "@business/schemas/create-admin.schema";
import { digitsMask } from "@core/masks/maskito-digits";
import { tryCatch } from "@core/utils/try-catch";

type AdminFormValues = z.infer<typeof createAdminSchema>;

interface IProps {
  setIsValid?: (valid: boolean) => void;
  formId?: string;
  onStepComplete?: () => void;
  onSubmit?: (data: AdminFormValues) => void;
}

export function AdminForm({ setIsValid, formId, onStepComplete, onSubmit }: IProps) {
  const [icError, setIcError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const icRef = useMaskito({ options: digitsMask });

  // TODO: find by value === superadmin
  // Nest.js const roleId = "ac854a41-5862-423d-90b1-942f7d8e5f27";
  // Go
  const roleId = "b290a964-2028-4004-a960-6ea400a32d70";

  const adminForm = useForm<AdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      email: "",
      firstName: "",
      ic: "",
      lastName: "",
      phoneNumber: "",
      userName: "@",
      password: "",
      roleId: roleId,
    },
    mode: "onChange",
  });

  const {
    clearErrors,
    control,
    formState: { isValid },
    handleSubmit,
    setValue,
  } = adminForm;

  useEffect(() => {
    setIsValid?.(isValid);
  }, [isValid, setIsValid]);

  function handleFormSubmit(data: AdminFormValues): void {
    onSubmit?.(data);
    onStepComplete?.();
  }

  function completeForm(): void {
    adminForm.reset({
      email: "vanesa@gmail.com",
      firstName: "Vanesa",
      ic: "29100200",
      lastName: "Suárez",
      phoneNumber: "3757998877",
      userName: "@vanesa",
      password: "admin123",
      roleId: roleId,
    });
  }

  return (
    <FormProvider {...adminForm}>
      <form
        className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        id={formId}
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <FieldGroup>
          <Controller
            name="firstName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="firstName">
                  Nombre
                  <Asterisk className="size-3" />
                </FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="firstName" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="lastName">
                  Apellido
                  <Asterisk className="size-3" />
                </FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="lastName" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="ic"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="ic">
                  DNI
                  <Asterisk className="size-3" />
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="ic"
                  ref={(node) => {
                    field.ref(node);
                    icRef(node);
                  }}
                  onChange={async (e) => {
                    field.onChange(e);

                    const value = e.target.value;

                    setIcError(null);
                    clearErrors("ic");

                    if (value.length > 7) {
                      const [response, error] = await tryCatch(UsersService.checkIcAvailability(value));
                      if (response?.data === false || error) {
                        const errorMsg = error ? "Error al comprobar DNI" : "DNI ya registrado";
                        setIcError(errorMsg);
                        control.setError("ic", { message: errorMsg });
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
            name="userName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="userName">
                  Usuario
                  <Asterisk className="size-3" />
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="userName"
                  onChange={(e) => {
                    setUsernameError(null);
                    clearErrors("userName");

                    const rawValue = e.target.value.toLowerCase();
                    const noAtSigns = rawValue.replace(/@/g, "");
                    const sanitizedContent = noAtSigns.replace(/[^a-z0-9.\-_]/g, "");
                    const finalValue = `@${sanitizedContent}`;

                    setValue("userName", finalValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setValue("userName", finalValue);
                  }}
                />
                {(fieldState.invalid || usernameError) && (
                  <FieldError errors={usernameError ? [{ message: usernameError }] : [fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <FieldGroup>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">
                  E-mail
                  <Asterisk className="size-3" />
                </FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="email" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">
                  Contraseña
                  <Asterisk className="size-3" />
                </FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="password" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="phoneNumber">
                  Teléfono
                  <Asterisk className="size-3" />
                </FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="phoneNumber" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
        <FieldGroup>
          <Controller
            name="roleId"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="roleId">ID del Rol de administrador</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="roleId" readOnly {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
      <div className="mt-8 flex items-center gap-3 text-sm">
        <Asterisk className="size-5" /> Campos obligatorios
        <Button onClick={() => completeForm()} size="xs" type="button" variant="outline">
          Complete
        </Button>
      </div>
    </FormProvider>
  );
}
