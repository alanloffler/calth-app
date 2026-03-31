import { GalleryVerticalEnd } from "lucide-react";

import { AdminForm } from "@business/components/forms/AdminForm";
import { ContactForm } from "@business/components/forms/ContactForm";
import { BusinessForm } from "@business/components/forms/BusinessForm";
import { Stepper } from "@components/Stepper";

import type { z } from "zod";
import { useRef } from "react";

import type { createAdminSchema } from "@business/schemas/create-admin.schema";
import type { createBusinessSchema } from "@business/schemas/create-business.schema";
import type { createContactSchema } from "@business/schemas/create-contact.schema";

type AdminData = z.infer<typeof createAdminSchema>;
type BusinessData = z.infer<typeof createBusinessSchema>;
type ContactData = z.infer<typeof createContactSchema>;

export default function CreateBusiness() {
  const collectedData = useRef<{ business?: BusinessData; contact?: ContactData; admin?: AdminData }>({});

  function handleBusinessSubmit(data: BusinessData) {
    collectedData.current.business = data;
  }

  function handleContactSubmit(data: ContactData) {
    collectedData.current.contact = data;
  }

  function handleAdminSubmit(data: AdminData) {
    collectedData.current.admin = data;
  }

  function handleFinish() {
    console.log("Submit all", collectedData.current);
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
      <Stepper className="px-12 py-8" steps={["Tu negocio", "Contacto", "Administrador"]} onFinish={handleFinish}>
        <BusinessForm onSubmit={handleBusinessSubmit} />
        <ContactForm onSubmit={handleContactSubmit} />
        <AdminForm onSubmit={handleAdminSubmit} />
      </Stepper>
    </section>
  );
}
