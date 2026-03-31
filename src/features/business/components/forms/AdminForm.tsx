import { Controller, FormProvider, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";

import type { z } from "zod";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { createAdminSchema } from "@business/schemas/create-admin.schema";

type AdminFormValues = z.infer<typeof createAdminSchema>;

interface IProps {
  setIsValid?: (valid: boolean) => void;
  formId?: string;
  onStepComplete?: () => void;
  onSubmit?: (data: AdminFormValues) => void;
}

export function AdminForm({ setIsValid, formId, onStepComplete, onSubmit }: IProps) {
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
      roleId: "",
      businessId: "",
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

  function handleFormSubmit(data: AdminFormValues) {
    onSubmit?.(data);
    onStepComplete?.();
  }

  return (
    <FormProvider {...methods}>
      <form id={formId} onSubmit={handleSubmit(handleFormSubmit)}>
        <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Controller
            name="adminEmail"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="adminEmail">Email del administrador</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="adminEmail" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </FormProvider>
  );
}
