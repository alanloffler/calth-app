import { Button } from "@components/ui/button";
import { Card, CardContent, CardFooter } from "@components/ui/card";
import { Controller } from "react-hook-form";
import { FieldGroup, Field, FieldLabel, FieldError } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";
import { PageHeader } from "@components/pages/PageHeader";

import type z from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";

import { BusinessService } from "@business/services/business.service";
import { businessSchema } from "@business/schemas/business.schema";
import { cn } from "@lib/utils";
import { useAuthStore } from "@auth/stores/auth.store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSidebar } from "@components/ui/sidebar";

export default function BusinessSettings() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { admin } = useAuthStore();
  const { open } = useSidebar();

  const form = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      slug: "",
      taxId: "",
      companyName: "",
      tradeName: "",
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
  });

  const { data: business, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ["business"],
    queryFn: () => admin && BusinessService.findOne(admin.businessId),
  });

  useEffect(() => {
    const r = business?.data;
    if (!r) return;

    setBusinessId(r.id);
    form.reset({
      slug: r.slug,
      taxId: r.taxId,
      companyName: r.companyName,
      tradeName: r.tradeName,
      description: r.description,
      street: r.street,
      city: r.city,
      province: r.province,
      country: r.country,
      zipCode: r.zipCode,
      email: r.email,
      phoneNumber: r.phoneNumber,
      whatsAppNumber: r.whatsAppNumber,
    });
  }, [business, form]);

  const { isPending: isSaving, mutate: saveBusiness } = useMutation({
    mutationFn: (data: z.infer<typeof businessSchema>) => BusinessService.update(businessId!, data),
    onSuccess: () => toast.success("Configuración de tu negocio actualizada"),
  });

  function onSubmit(data: z.infer<typeof businessSchema>): void {
    if (!businessId) return;
    saveBusiness(data);
  }

  function handleCancel(): void {
    form.reset();
    navigate(-1);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Configuraciones de tu negocio">
        {isLoadingBusiness && <Loader className="text-sm" size={18} text="Cargando tu negocio" />}
      </PageHeader>
      <Card className="w-full 2xl:max-w-275">
        <CardContent className="flex flex-col gap-6">
          <form className="grid grid-cols-1 gap-6 xl:grid-cols-2" id="edit-form" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4 border-b pb-8">
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold">Datos comerciales</h2>
                <span className="text-muted-foreground text-sm">Actualiza la información comercial de tu negocio</span>
              </div>
              <FieldGroup
                className={cn("grid grid-cols-1 gap-6", open ? "md:grid-cols-1 lg:grid-cols-12" : "md:grid-cols-12")}
              >
                <Controller
                  name="tradeName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className={cn("col-span-1", open ? "md:col-span-12 lg:col-span-6" : "md:col-span-6")}
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="tradeName">Nombre comercial</FieldLabel>
                      <Input aria-invalid={fieldState.invalid} id="tradeName" maxLength={51} {...field} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="slug"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div
                      className={cn(
                        "col-span-1 flex w-full flex-col gap-1",
                        open ? "md:col-span-12 lg:col-span-6" : "md:col-span-6",
                      )}
                    >
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="slug">Subdominio</FieldLabel>
                        <Input
                          aria-invalid={fieldState.invalid}
                          className="disabled:opacity-100"
                          disabled
                          id="slug"
                          {...field}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                      <p className="text-muted-foreground w-fit text-xs">{`https://${field.value}.calth.app`}</p>
                    </div>
                  )}
                />
                <Controller
                  name="companyName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className={cn("col-span-1", open ? "md:col-span-12 lg:col-span-6" : "md:col-span-6")}
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="companyName">Razón social</FieldLabel>
                      <Input aria-invalid={fieldState.invalid} id="companyName" maxLength={51} {...field} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="taxId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className={cn("col-span-1", open ? "md:col-span-12 lg:col-span-6" : "md:col-span-6")}
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="taxId">CUIT</FieldLabel>
                      <Input
                        aria-invalid={fieldState.invalid}
                        id="taxId"
                        maxLength={12}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className={cn("col-span-1", open ? "md:col-span-12 lg:col-span-12" : "md:col-span-12")}
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="description">Descripción</FieldLabel>
                      <Input aria-invalid={fieldState.invalid} id="description" maxLength={201} {...field} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
            <div className="flex flex-col gap-4 border-b pb-8">
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold">Dirección</h2>
                <span className="text-muted-foreground text-sm">Actualizá la dirección de tu negocio</span>
              </div>
              <FieldGroup
                className={cn("grid grid-cols-1 gap-6", open ? "md:grid-cols-1 lg:grid-cols-12" : "md:grid-cols-12")}
              >
                <Controller
                  name="street"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className={cn("col-span-1", open ? "md:col-span-12 lg:col-span-6" : "md:col-span-6")}
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="street">Calle</FieldLabel>
                      <Input aria-invalid={fieldState.invalid} id="street" maxLength={51} {...field} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="city"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className={cn("col-span-1", open ? "md:col-span-12 lg:col-span-6" : "md:col-span-6")}
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="city">Ciudad</FieldLabel>
                      <Input aria-invalid={fieldState.invalid} id="city" maxLength={51} {...field} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="province"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className={cn("col-span-1", open ? "md:col-span-12 lg:col-span-6" : "md:col-span-6")}
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="province">Provincia</FieldLabel>
                      <Input aria-invalid={fieldState.invalid} id="province" maxLength={51} {...field} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="country"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className={cn("col-span-1", open ? "md:col-span-12 lg:col-span-6" : "md:col-span-6")}
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="country">País</FieldLabel>
                      <Input aria-invalid={fieldState.invalid} id="country" maxLength={51} {...field} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="zipCode"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className={cn("col-span-1", open ? "md:col-span-12 lg:col-span-6" : "md:col-span-6")}
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="zipCode">Código postal</FieldLabel>
                      <Input aria-invalid={fieldState.invalid} id="zipCode" maxLength={7} {...field} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold">Contacto</h2>
                <span className="text-muted-foreground text-sm">Actualiza los medios de contacto de tu negocio</span>
              </div>
              <FieldGroup
                className={cn("grid grid-cols-1 gap-6", open ? "md:grid-cols-1 lg:grid-cols-12" : "md:grid-cols-12")}
              >
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className={cn("col-span-1", open ? "md:col-span-12 lg:col-span-6" : "md:col-span-6")}
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input aria-invalid={fieldState.invalid} id="email" {...field} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="phoneNumber"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className={cn("col-span-1", open ? "md:col-span-12 lg:col-span-6" : "md:col-span-6")}
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="phoneNumber">Número de teléfono</FieldLabel>
                      <Input
                        aria-invalid={fieldState.invalid}
                        id="phoneNumber"
                        maxLength={11}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="whatsAppNumber"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className={cn("col-span-1", open ? "md:col-span-12 lg:col-span-6" : "md:col-span-6")}
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="whatsAppNumber">Número de WhatsApp</FieldLabel>
                      <Input
                        aria-invalid={fieldState.invalid}
                        id="whatsAppNumber"
                        maxLength={11}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex items-center justify-end pt-4">
          <div className="flex gap-4">
            <Button variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button disabled={!form.formState.isDirty} form="edit-form" type="submit" variant="default">
              {isSaving ? <Loader color="white" text="Guardando" /> : "Guardar"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
