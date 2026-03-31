import { Controller, FormProvider, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";

import type { z } from "zod";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { createBusinessSchema } from "@business/schemas/create-business.schema";

type BusinessFormValues = z.infer<typeof createBusinessSchema>;

interface IProps {
  setIsValid?: (valid: boolean) => void;
  formId?: string;
  onStepComplete?: () => void;
  onSubmit?: (data: BusinessFormValues) => void;
}

export function BusinessForm({ setIsValid, formId, onStepComplete, onSubmit }: IProps) {
  const methods = useForm<BusinessFormValues>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: { companyName: "", taxId: "" },
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
      <form id={formId} onSubmit={handleSubmit(handleFormSubmit)}>
        <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Controller
            name="companyName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="companyName">Nombre del negocio</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="companyName" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="taxId"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="taxId">CUIT</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="taxId" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </FormProvider>
  );
}
