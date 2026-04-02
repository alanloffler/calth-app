import { Asterisk } from "lucide-react";

import { Checkbox } from "@components/ui/checkbox";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@components/ui/field";
import { Input } from "@components/ui/input";

import type { z } from "zod";
import { useEffect } from "react";
import { useMaskito } from "@maskito/react";
import { zodResolver } from "@hookform/resolvers/zod";

import { createBusinessSchema } from "@business/schemas/create-business.schema";
import { digitsMask } from "@core/masks/maskito-digits";

function toSlug(value: string): string | null {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (slug.length < 3) {
    return null;
  }
  return slug;
}

type BusinessFormValues = z.infer<typeof createBusinessSchema>;

interface IProps {
  setIsValid?: (valid: boolean) => void;
  formId?: string;
  onStepComplete?: () => void;
  onSubmit?: (data: BusinessFormValues) => void;
}

export function BusinessForm({ setIsValid, formId, onStepComplete, onSubmit }: IProps) {
  const taxRef = useMaskito({ options: digitsMask });

  const businessForm = useForm<BusinessFormValues>({
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
      slug: "",
    },
    mode: "onChange",
  });

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = businessForm;

  const slugField = useWatch({ control, name: "slug" });
  const tradeName = useWatch({ control, name: "tradeName" });

  const slugSuggestions = tradeName
    ? tradeName
        .split(" ")
        .map(toSlug)
        .filter((s): s is string => s !== null)
    : [];

  useEffect(() => {
    setIsValid?.(isValid);
  }, [isValid, setIsValid]);

  function handleFormSubmit(data: BusinessFormValues): void {
    onSubmit?.(data);
    onStepComplete?.();
  }

  return (
    <FormProvider {...businessForm}>
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
                <FieldLabel className="flex items-center" htmlFor="taxId">
                  CUIT <Asterisk className="size-3" />
                </FieldLabel>
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
                <FieldLabel htmlFor="tradeName">
                  Razón social <Asterisk className="size-3" />
                </FieldLabel>
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
                <FieldLabel htmlFor="companyName">
                  Nombre comercial <Asterisk className="size-3" />
                </FieldLabel>
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
                <FieldLabel htmlFor="description">
                  Descripción <Asterisk className="size-3" />
                </FieldLabel>
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
                <FieldLabel htmlFor="street">
                  Calle <Asterisk className="size-3" />
                </FieldLabel>
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
                <FieldLabel htmlFor="city">
                  Ciudad <Asterisk className="size-3" />
                </FieldLabel>
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
                <FieldLabel htmlFor="province">
                  Provincia <Asterisk className="size-3" />
                </FieldLabel>
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
                <FieldLabel htmlFor="country">
                  País <Asterisk className="size-3" />
                </FieldLabel>
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
                <FieldLabel htmlFor="zipCode">
                  Código Postal <Asterisk className="size-3" />
                </FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="zipCode" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
        <FieldGroup>
          <Controller
            name="slug"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="slug">
                  Subdominio <Asterisk className="size-3" />
                </FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="slug" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          {slugField && slugField.length > 2 && (
            <span className="text-muted-foreground text-sm">Tu dirección será: https://{slugField}.calth.app</span>
          )}
          {/* TODO: CHECK AVAILABILITY ON BACKEND */}
          {slugSuggestions.length > 0 && (
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <div className="text-sm">
                  <h3 className="mb-2">Sugerencias:</h3>
                  <ul className="space-y-2">
                    {
                      <li key="composed-slug" className="flex items-center gap-2">
                        <Checkbox
                          id="slug-composed-slug"
                          checked={field.value === slugSuggestions[0] + slugSuggestions[1]}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? slugSuggestions[0] + slugSuggestions[1] : "")
                          }
                        />
                        <label htmlFor="slug-composed-slug" className="cursor-pointer">
                          {slugSuggestions[0] + slugSuggestions[1]}
                        </label>
                      </li>
                    }
                    {slugSuggestions.map((suggestion) => (
                      <li key={suggestion} className="flex items-center gap-2">
                        <Checkbox
                          id={`slug-${suggestion}`}
                          checked={field.value === suggestion}
                          onCheckedChange={(checked) => field.onChange(checked ? suggestion : "")}
                        />
                        <label htmlFor={`slug-${suggestion}`} className="cursor-pointer">
                          {suggestion}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            />
          )}
        </FieldGroup>
      </form>
      <div className="mt-8 flex items-center gap-3 text-sm">
        <Asterisk className="size-5" /> Campos obligatorios
      </div>
    </FormProvider>
  );
}
