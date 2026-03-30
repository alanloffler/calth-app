import { GalleryVerticalEnd } from "lucide-react";

import { Stepper } from "@components/Stepper";

import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useEffect } from "react";

export default function CreateBusiness() {
  const methods = useForm({
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  function handleSubmit(data: any): void {
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
      <section className="mt-8">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <Stepper steps={["Title 1", "Title 2", "Title 3"]} onFinish={methods.handleSubmit(handleSubmit)}>
              <StepOneForm />
              <StepTwoForm />
              <StepTwoForm />
            </Stepper>
          </form>
        </FormProvider>
      </section>
    </section>
  );
}

export function StepOneForm({ setIsValid }: { setIsValid?: (valid: boolean) => void }) {
  const {
    register,
    formState: { errors, isValid },
  } = useFormContext();

  useEffect(() => {
    setIsValid?.(isValid);
  }, [isValid, setIsValid]);

  return (
    <div className="space-y-4">
      <div>
        <label>First Name</label>
        <input {...register("firstName", { required: true })} className="block border p-2" />
        {errors.firstName && <span className="text-red-500">Required</span>}
      </div>

      <div>
        <label>Email</label>
        <input {...register("email", { required: true, pattern: /^\S+@\S+$/i })} className="block border p-2" />
      </div>
    </div>
  );
}

export function StepTwoForm({ setIsValid }: { setIsValid?: (valid: boolean) => void }) {
  useEffect(() => {
    setIsValid?.(true);
  }, [setIsValid]);

  return <>Step 2 form</>;
}
