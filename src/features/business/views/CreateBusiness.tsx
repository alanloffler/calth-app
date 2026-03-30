import { GalleryVerticalEnd } from "lucide-react";

import { Stepper } from "@components/Stepper";

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
        <Stepper steps={["Title 1", "Title 2", "Title 3"]}>
          <div>Content 1</div>
          <div>Content 2</div>
          <div>Content 3</div>
        </Stepper>
      </section>
    </section>
  );
}
