import { Asterisk } from "lucide-react";

import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";

import type { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { useMaskito } from "@maskito/react";
import { zodResolver } from "@hookform/resolvers/zod";

import { BusinessService } from "@business/services/business.service";
import { createBusinessSchema } from "@business/schemas/create-business.schema";
import { digitsMask } from "@core/masks/maskito-digits";
import { tryCatch } from "@core/utils/try-catch";

function toSlug(value: string): string | null {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (slug.length < 3 || slug.includes("s-r-l") || slug.includes("s-a")) {
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
  const [rand] = useState<number>(() => Math.floor(Math.random() * 1000));
  const [taxIdError, setTaxIdError] = useState<string | null>(null);
  const [unavailableSlugs, setUnavailableSlugs] = useState<Set<string>>(new Set());
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
      timezone: "",
    },
    mode: "onChange",
  });

  const {
    clearErrors,
    control,
    formState: { isValid },
    handleSubmit,
    setError,
  } = businessForm;

  const slugField = useWatch({ control, name: "slug" });
  const tradeName = useWatch({ control, name: "tradeName" });

  const slugSuggestions = useMemo(
    () =>
      tradeName
        ? tradeName
            .split(" ")
            .map(toSlug)
            .filter((s): s is string => s !== null)
        : [],
    [tradeName],
  );

  const allSlugSuggestions = useMemo(() => {
    if (slugSuggestions.length < 2) return slugSuggestions;
    const combined = slugSuggestions[0] + slugSuggestions[1];
    const combinedRand = combined + rand;
    return [combined, combinedRand, ...slugSuggestions];
  }, [rand, slugSuggestions]);

  useEffect(() => {
    setUnavailableSlugs(new Set());
    if (allSlugSuggestions.length === 0) return;
    allSlugSuggestions.forEach(async (slug) => {
      const [response] = await tryCatch(BusinessService.checkSlugAvailability(slug));
      if (response?.data === false) {
        setUnavailableSlugs((prev) => new Set(prev).add(slug));
      }
    });
  }, [allSlugSuggestions]);

  const slugUnavailable = !!slugField && unavailableSlugs.has(slugField);

  useEffect(() => {
    setIsValid?.(isValid && !slugUnavailable);
  }, [isValid, slugUnavailable, setIsValid]);

  function handleFormSubmit(data: BusinessFormValues): void {
    onSubmit?.(data);
    onStepComplete?.();
  }

  function completeForm(): void {
    businessForm.reset({
      taxId: "20301011029",
      tradeName: "Clínica Wanda S.R.L.",
      companyName: "Clínica Wanda",
      description: "Centro médico especializado en pediatría y obstetricia.",
      street: "Calle 1º de Abril",
      city: "Wanda",
      province: "Misiones",
      country: "Argentina",
      zipCode: "3376",
      slug: "clinicawanda",
      timezone: "America/Argentina/Buenos_Aires",
    });
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
              <Field data-invalid={fieldState.invalid || !!taxIdError}>
                <FieldLabel className="flex items-center" htmlFor="taxId">
                  CUIT <Asterisk className="size-3" />
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid || !!taxIdError}
                  id="taxId"
                  maxLength={12}
                  ref={(node) => {
                    field.ref(node);
                    taxRef(node);
                  }}
                  onChange={async (e) => {
                    field.onChange(e);
                    const value = e.target.value;
                    setTaxIdError(null);
                    clearErrors("taxId");

                    if (value.length === 11) {
                      const [response, error] = await tryCatch(BusinessService.checkTaxIdAvailability(value));
                      if (response?.data === false || error) {
                        const errorMsg = error?.message ?? response?.message ?? "CUIT no disponible";
                        setTaxIdError(errorMsg);
                        setError("taxId", { message: errorMsg });
                      }
                    }
                  }}
                />
                {(fieldState.invalid || taxIdError) && (
                  <FieldError errors={taxIdError ? [{ message: taxIdError }] : [fieldState.error]} />
                )}
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
                <Textarea className="min-h-25" aria-invalid={fieldState.invalid} id="description" {...field} />
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
              <Field data-invalid={fieldState.invalid || slugUnavailable}>
                <FieldLabel htmlFor="slug">
                  Subdominio <Asterisk className="size-3" />
                </FieldLabel>
                <Input aria-invalid={fieldState.invalid || slugUnavailable} id="slug" {...field} />
                {(fieldState.invalid || slugUnavailable) && (
                  <FieldError
                    errors={slugUnavailable ? [{ message: "Este subdominio no está disponible" }] : [fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
          {slugField && slugField.length > 2 && (
            <span className="text-muted-foreground text-sm">Tu dirección será: https://{slugField}.calth.app</span>
          )}
          {allSlugSuggestions.length > 0 && (
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <div className="text-sm">
                  <h3 className="mb-2">Sugerencias:</h3>
                  <ul className="space-y-2">
                    {allSlugSuggestions.map((suggestion) => {
                      const isUnavailable = unavailableSlugs.has(suggestion);
                      return (
                        <li key={suggestion} className="flex items-center gap-2">
                          <Checkbox
                            id={`slug-${suggestion}`}
                            disabled={isUnavailable}
                            checked={field.value === suggestion}
                            onCheckedChange={(checked) => field.onChange(checked ? suggestion : "")}
                          />
                          <label
                            htmlFor={`slug-${suggestion}`}
                            className={isUnavailable ? "text-muted-foreground line-through" : "cursor-pointer"}
                          >
                            {suggestion}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            />
          )}
          <Controller
            name="timezone"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="timezone">
                  Zona horaria <Asterisk className="size-3" />
                </FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="timezone" {...field} />
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
