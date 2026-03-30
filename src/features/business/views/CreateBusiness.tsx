import { GalleryVerticalEnd } from "lucide-react";

import { Stepper } from "@components/Stepper";

import { useEffect, useState } from "react";

export default function CreateBusiness() {
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
      <section>
        <Stepper steps={["Title 1", "Title 2"]}>
          <StepOneForm />
          <StepTwoForm />
          <StepTwoForm />
        </Stepper>
      </section>
    </section>
  );
}

export function StepOneForm({ setIsValid }: { setIsValid?: (valid: boolean) => void }) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const isValid = email.includes("@") && email.length > 5;
    setIsValid?.(isValid);
  }, [email, setIsValid]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Datos de contacto</h2>
      <input
        className="border p-2"
        type="email"
        placeholder="Tu email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>
  );
}

export function StepTwoForm({ setIsValid }: { setIsValid?: (valid: boolean) => void }) {
  useEffect(() => {
    setIsValid?.(true);
  }, [setIsValid]);

  return <>Step 2 form</>;
}
