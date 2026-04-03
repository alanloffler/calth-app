import { GalleryVerticalEnd } from "lucide-react";

import { AdminForm } from "@business/components/forms/AdminForm";
import { ContactForm } from "@business/components/forms/ContactForm";
import { BusinessForm } from "@business/components/forms/BusinessForm";
import { Stepper } from "@components/Stepper";

import type { z } from "zod";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

import type { ICreateBusiness } from "@business/interfaces/create-business.interface";
import type { createAdminSchema } from "@business/schemas/create-admin.schema";
import type { createBusinessSchema } from "@business/schemas/create-business.schema";
import type { createContactSchema } from "@business/schemas/create-contact.schema";
import { BusinessService } from "@business/services/business.service";
import { tryCatch } from "@core/utils/try-catch";

type AdminData = z.infer<typeof createAdminSchema>;
type BusinessData = z.infer<typeof createBusinessSchema>;
type ContactData = z.infer<typeof createContactSchema>;

const REDIRECT_SECONDS = 5;

export default function CreateBusiness() {
  const [showStepper, setShowStepper] = useState<boolean>(true);
  const [timer, setTimer] = useState(REDIRECT_SECONDS);
  const [slug, setSlug] = useState("");
  const collectedData = useRef<{ business?: BusinessData; contact?: ContactData; admin?: AdminData }>({});

  useEffect(() => {
    if (showStepper) return;
    if (timer === 0) {
      const { protocol } = window.location;
      window.location.replace(`${protocol}//${slug}.localhost:5173/login`);
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [showStepper, timer, slug]);

  function handleBusinessSubmit(data: BusinessData) {
    collectedData.current.business = data;
  }

  function handleContactSubmit(data: ContactData) {
    collectedData.current.contact = data;
  }

  function handleAdminSubmit(data: AdminData) {
    collectedData.current.admin = data;
  }

  async function handleFinish() {
    const [response, error] = await tryCatch(BusinessService.create(collectedData.current as ICreateBusiness));
    if (error) {
      toast.error(error.message);
      return;
    }
    if (response) {
      toast.success("Negocio creado exitosamente");
      setSlug(collectedData.current.business!.slug);
      setShowStepper(false);
    }
  }

  return (
    <section className="bg-background flex h-screen w-full flex-col gap-8 p-8">
      <header className="flex gap-5">
        <div className="bg-primary text-sidebar-primary-foreground flex aspect-square h-12 w-12 items-center justify-center rounded-lg">
          <GalleryVerticalEnd className="size-6 text-white" />
        </div>
        <h1 className="flex items-center text-2xl font-semibold">Calth</h1>
      </header>
      {showStepper ? (
        <div>
          <p className="text-lg">
            Completa los siguientes formularios para crear tu negocio y comenzar a gestionar tus pacientes y turnos.
          </p>
          <Stepper className="px-12 py-8" steps={["Tu negocio", "Contacto", "Administrador"]} onFinish={handleFinish}>
            <BusinessForm onSubmit={handleBusinessSubmit} />
            <ContactForm onSubmit={handleContactSubmit} />
            <AdminForm onSubmit={handleAdminSubmit} />
          </Stepper>
        </div>
      ) : (
        <div>Negocio creado exitosamente, serás redirigido a la página de ingreso en {timer}.</div>
      )}
    </section>
  );
}
