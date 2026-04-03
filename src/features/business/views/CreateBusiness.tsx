import { GalleryVerticalEnd } from "lucide-react";

import { AdminForm } from "@business/components/forms/AdminForm";
import { BusinessForm } from "@business/components/forms/BusinessForm";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { ContactForm } from "@business/components/forms/ContactForm";
import { Countdown } from "@components/Countdown";
import { Stepper } from "@components/Stepper";

import type { z } from "zod";
import { toast } from "sonner";
import { useRef, useState } from "react";

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
  // const [redirectURL, setRedirectURL] = useState<string>("");
  const [redirectURL, setRedirectURL] = useState<string>("https://clinicawanda.localhost:5173/login");
  const [showStepper, setShowStepper] = useState<boolean>(false);
  const [slug, setSlug] = useState<string>("clinicawanda");
  const collectedData = useRef<{ business?: BusinessData; contact?: ContactData; admin?: AdminData }>({});

  function handleBusinessSubmit(data: BusinessData) {
    collectedData.current.business = data;
    setSlug(collectedData.current.business!.slug);
    const appUrl = import.meta.env.VITE_APP_URL;
    const splittedURL = appUrl.split("//");
    setRedirectURL(`${splittedURL[0]}//${slug}.${splittedURL[1]}/login`);
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
      setShowStepper(false);
    }
  }

  function handleTimerEnd(): void {
    if (!slug) return;
    // window.location.replace(redirectURL);
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
        <Card className="mx-auto flex w-fit flex-col items-center gap-3 px-6">
          <p className="font-medium">Negocio creado exitosamente, serás redirigido a la página de ingreso en</p>
          <Countdown className="mt-3" callback={handleTimerEnd} seconds={REDIRECT_SECONDS} />
          <Button
            onClick={() => window.location.replace(redirectURL)}
            className="text-muted-foreground text-sm font-medium"
            variant="link"
          >
            {redirectURL}
          </Button>
        </Card>
      )}
    </section>
  );
}
