import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";

import type { z } from "zod";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import type { createBusinessSchema } from "@business/schemas/create-business.schema";

export function BusinessForm({ setIsValid }: { setIsValid?: (valid: boolean) => void }) {
  const {
    control,
    formState: { isValid },
  } = useFormContext<z.infer<typeof createBusinessSchema>>();

  useEffect(() => {
    setIsValid?.(isValid);
  }, [isValid, setIsValid]);

  return (
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
  );
}
