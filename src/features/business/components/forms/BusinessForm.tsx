import { Controller, FormProvider, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@components/ui/field";
import { Input } from "@components/ui/input";

import type { z } from "zod";
import { useEffect } from "react";
import { useMaskito } from "@maskito/react";
import { zodResolver } from "@hookform/resolvers/zod";

import { createBusinessSchema } from "@business/schemas/create-business.schema";
import { digitsMask } from "@core/masks/maskito-digits";

type BusinessFormValues = z.infer<typeof createBusinessSchema>;

interface IProps {
  setIsValid?: (valid: boolean) => void;
  formId?: string;
  onStepComplete?: () => void;
  onSubmit?: (data: BusinessFormValues) => void;
}

export function BusinessForm({ setIsValid, formId, onStepComplete, onSubmit }: IProps) {
  const taxRef = useMaskito({ options: digitsMask });
  const phoneRef = useMaskito({ options: digitsMask });

  const methods = useForm<BusinessFormValues>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      taxId: "",
      tradeName: "",
      companyName: "",
      description: "",
      street: "",
      city: "",
      province: "",
      country: "",
      zipCode: "",
      email: "",
      phoneNumber: "",
      whatsAppNumber: "",
      website: "",
    },
    mode: "onChange",
  });

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = methods;

  useEffect(() => {
    setIsValid?.(isValid);
  }, [isValid, setIsValid]);

  function handleFormSubmit(data: BusinessFormValues) {
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
          <FieldTitle className="text-base">Datos del negocio:</FieldTitle>
          <Controller
            name="taxId"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="taxId">CUIT</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="taxId"
                  maxLength={12}
                  ref={(node) => {
                    field.ref(node);
                    taxRef(node);
                  }}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="tradeName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="tradeName">Razón social</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="tradeName" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="companyName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="companyName">Nombre comercial</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="companyName" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="description">Descripción</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="description" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldTitle className="text-base">Dirección:</FieldTitle>
          <Controller
            name="street"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="street">Calle</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="street" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="city"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="city">Ciudad</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="city" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="province"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="province">Provincia</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="province" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="country"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="country">País</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="country" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="zipCode"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="zipCode">Código Postal</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="zipCode" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldTitle className="text-base">Contacto:</FieldTitle>
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
            name="phoneNumber"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="phoneNumber">Número de teléfono</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="phoneNumber"
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
            name="whatsAppNumber"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="whatsAppNumber">Número de WhatsApp</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="whatsAppNumber"
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
            name="website"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="website">Página web</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="website" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </FormProvider>
  );
}
