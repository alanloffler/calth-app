import { Controller, FormProvider, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";

import type { z } from "zod";
import { useEffect, useState } from "react";
import { useMaskito } from "@maskito/react";
import { zodResolver } from "@hookform/resolvers/zod";

import { createAdminSchema } from "@business/schemas/create-admin.schema";
import { digitsMask } from "@core/masks/maskito-digits";
import { tryCatch } from "@core/utils/try-catch";
import { UsersService } from "@users/services/users.service";

type AdminFormValues = z.infer<typeof createAdminSchema>;

interface IProps {
  setIsValid?: (valid: boolean) => void;
  formId?: string;
  onStepComplete?: () => void;
  onSubmit?: (data: AdminFormValues) => void;
}

export function AdminForm({ setIsValid, formId, onStepComplete, onSubmit }: IProps) {
  const [icError, setIcError] = useState<string | null>(null);
  const icRef = useMaskito({ options: digitsMask });

  // TODO: find by value === superadmin
  const roleId = "ac854a41-5862-423d-90b1-942f7d8e5f27";

  const methods = useForm<AdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      email: "",
      firstName: "",
      ic: "",
      lastName: "",
      phoneNumber: "",
      userName: "",
      password: "",
      roleId: roleId,
    },
    mode: "onChange",
  });

  const {
    control,
    formState: { isValid },
    handleSubmit,
    clearErrors,
  } = methods;

  useEffect(() => {
    setIsValid?.(isValid);
  }, [isValid, setIsValid]);

  function handleFormSubmit(data: AdminFormValues) {
    onSubmit?.(data);
    onStepComplete?.();
  }

  return (
    <FormProvider {...methods}>
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
                <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
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
                <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
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
                <FieldLabel htmlFor="ic">DNI</FieldLabel>
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
                <FieldLabel htmlFor="userName">Usuario</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="userName" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
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
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
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
                <FieldLabel htmlFor="phoneNumber">Teléfono</FieldLabel>
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
    </FormProvider>
  );
}
