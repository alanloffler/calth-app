import { GalleryVerticalEnd } from "lucide-react";

import { BusinessForm } from "@business/components/forms/BusinessForm";
import { FormProvider } from "react-hook-form";
import { Stepper } from "@components/Stepper";

import type z from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createBusinessSchema } from "@business/schemas/create-business.schema";

export default function CreateBusiness() {
  const createBusinessForm = useForm<z.infer<typeof createBusinessSchema>>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      companyName: "",
      taxId: "",
    },
    mode: "onChange",
  });

  function handleSubmit(data: z.output<typeof createBusinessSchema>): void {
    console.log("Submit forms", data);
  }

  return (
    <section className="bg-background flex h-screen w-full flex-col gap-8 p-8">
      <header className="flex gap-5">
        <div className="bg-primary text-sidebar-primary-foreground flex aspect-square h-12 w-12 items-center justify-center rounded-lg">
          <GalleryVerticalEnd className="size-6 text-white" />
        </div>
        <h1 className="flex items-center text-2xl font-semibold">Calth</h1>
      </header>
      <p className="text-lg">
        Completa los siguientes formularios para crear tu negocio y comenzar a gestionar tus pacientes y turnos.
      </p>
      <section className="mx-12 my-8">
        <FormProvider {...createBusinessForm}>
          <form onSubmit={createBusinessForm.handleSubmit(handleSubmit)}>
            <Stepper
              steps={["Tu negocio", "Title 2", "Title 3"]}
              onFinish={createBusinessForm.handleSubmit(handleSubmit)}
            >
              <BusinessForm />
              <StepTwoForm />
              <StepTwoForm />
            </Stepper>
          </form>
        </FormProvider>
      </section>
    </section>
  );
}

export function StepTwoForm({ setIsValid }: { setIsValid?: (valid: boolean) => void }) {
  useEffect(() => {
    setIsValid?.(true);
  }, [setIsValid]);

  return <>Step 2 form</>;
}
