import { CalendarIcon } from "lucide-react";

import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Checkbox } from "@components/ui/checkbox";
import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Textarea } from "@components/ui/textarea";
import { UserCombobox } from "@calendar/components/UserCombobox";

import type z from "zod";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useTryCatch } from "@core/hooks/useTryCatch";
import { zodResolver } from "@hookform/resolvers/zod";

import type { IMedicalHistory } from "@medical-history/interfaces/medical-history.interface";
import { MedicalHistoryService } from "@medical-history/services/medical-history.service";
import { createHistorySchema } from "@medical-history/schemas/create-history.schema";

interface IProps {
  history: IMedicalHistory;
  onUpdated: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function EditHistoryForm({ history, onUpdated, setOpen }: IProps) {
  const [date, setDate] = useState<Date | undefined>(history.date ? new Date(history.date) : undefined);
  const [openCalendar, setOpenCalendar] = useState<boolean>(false);
  const { isLoading: isUpdating, tryCatch: tryCatchUpdateHistory } = useTryCatch();

  const form = useForm<z.infer<typeof createHistorySchema>>({
    resolver: zodResolver(createHistorySchema),
    defaultValues: {
      businessId: history.businessId,
      comments: history.comments,
      date: history.date ? new Date(history.date) : undefined,
      eventId: history.eventId,
      professionalId: history.professionalId,
      reason: history.reason,
      recipe: history.recipe,
      userId: history.userId,
    },
  });

  function onSelectDate(date: Date | undefined) {
    if (!date) return;

    setDate(date);
    form.setValue("date", date, { shouldDirty: true });
  }

  async function onSubmit(data: z.infer<typeof createHistorySchema>) {
    if (!data) return;

    const [response, error] = await tryCatchUpdateHistory(MedicalHistoryService.update(history.id, data));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success("Historial médico actualizado");
      onUpdated();
      resetForm();
    }
  }

  function resetForm(): void {
    form.reset();
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-10">
      <form className="grid grid-cols-1 gap-6" id="create-history" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="grid grid-cols-1 gap-6">
          <Controller
            name="professionalId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="w-60" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="professional">Profesional:</FieldLabel>
                <UserCombobox aria-invalid={fieldState.invalid} id="professional" userType="professional" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="date">Fecha:</FieldLabel>
                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                  <PopoverTrigger className="w-60!" asChild onClick={() => setOpenCalendar(true)}>
                    <Button
                      variant="outline"
                      data-empty={!date}
                      className="data-[empty=true]:text-muted-foreground w-70 justify-start text-left font-normal"
                    >
                      <CalendarIcon />
                      {date ? format(date, "P", { locale: es }) : <span>Seleccionar</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      locale={es}
                      onSelect={(date) => {
                        onSelectDate(date);
                        setOpenCalendar(false);
                      }}
                      {...field}
                    />
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="reason"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="reason">Título:</FieldLabel>
                <Input aria-invalid={fieldState.invalid} id="reason" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="recipe"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="recipe">Receta:</FieldLabel>
                <Checkbox
                  aria-invalid={fieldState.invalid}
                  className="size-5!"
                  checked={field.value}
                  disabled={field.disabled}
                  id="recipe"
                  name={field.name}
                  onBlur={field.onBlur}
                  onCheckedChange={field.onChange}
                  ref={field.ref}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="comments"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="comments">Comentarios:</FieldLabel>
                <Textarea aria-invalid={fieldState.invalid} className="min-h-50" id="comments" rows={28} {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
      <div className="flex items-center justify-end gap-4">
        <Button variant="ghost" onClick={resetForm}>
          Cancelar
        </Button>
        <Button disabled={!form.formState.isDirty} form="create-history" type="submit" variant="default">
          {isUpdating ? <Loader color="white" text="Guardando" /> : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
