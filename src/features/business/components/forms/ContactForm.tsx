import { Asterisk } from "lucide-react";

import { Button } from "@components/ui/button";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@components/ui/field";
import { Input } from "@components/ui/input";

import type { z } from "zod";
import { useEffect } from "react";
import { useMaskito } from "@maskito/react";
import { zodResolver } from "@hookform/resolvers/zod";

import { createContactSchema } from "@business/schemas/create-contact.schema";
import { digitsMask } from "@core/masks/maskito-digits";

type ContactFormInput = z.input<typeof createContactSchema>;
type ContactFormOutput = z.output<typeof createContactSchema>;

interface IProps {
  setIsValid?: (valid: boolean) => void;
  formId?: string;
  onStepComplete?: () => void;
  onSubmit?: (data: ContactFormOutput) => void;
}

export function ContactForm({ setIsValid, formId, onStepComplete, onSubmit }: IProps) {
  const phoneRef = useMaskito({ options: digitsMask });

  const contactForm = useForm<ContactFormInput, unknown, ContactFormOutput>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
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
  } = contactForm;

  useEffect(() => {
    setIsValid?.(isValid);
  }, [isValid, setIsValid]);

  function handleFormSubmit(data: ContactFormOutput) {
    onSubmit?.(data);
    onStepComplete?.();
  }

  function completeForm(): void {
    contactForm.reset({
      email: "alanmatiasloffler@gmail.com",
      phoneNumber: "3757470101",
      whatsAppNumber: "3757101010",
    });
  }

  return (
    <FormProvider {...contactForm}>
      <form
        className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        id={formId}
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <FieldGroup>
          <FieldTitle className="text-base">Contacto:</FieldTitle>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">
                  Email <Asterisk className="size-3" />
                </FieldLabel>
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
                <FieldLabel htmlFor="phoneNumber">
                  Número de teléfono <Asterisk className="size-3" />
                </FieldLabel>
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
                <FieldLabel htmlFor="whatsAppNumber">
                  Número de WhatsApp <Asterisk className="size-3" />
                </FieldLabel>
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
                <Input
                  aria-invalid={fieldState.invalid}
                  id="website"
                  {...field}
                  value={(field.value as string) ?? ""}
                />
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
