import { CalendarIcon } from "lucide-react";

import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Checkbox } from "@components/ui/checkbox";
import { Controller } from "react-hook-form";
import { EventCombobox } from "@calendar/components/EventCombobox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Loader } from "@components/Loader";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { RichTextEditor } from "@components/RichTextEditor";
import { UserCombobox } from "@calendar/components/UserCombobox";

import type z from "zod";
import { es } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { useTryCatch } from "@core/hooks/useTryCatch";
import { zodResolver } from "@hookform/resolvers/zod";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { IMedicalHistory } from "@medical-history/interfaces/medical-history.interface";
import { MedicalHistoryService } from "@medical-history/services/medical-history.service";
import { cn } from "@lib/utils";
import { createHistorySchema } from "@medical-history/schemas/create-history.schema";

interface IProps {
  history: IMedicalHistory;
  onUpdated: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

// TODO: get from settings store
const LOCALE = "es";

export function EditHistoryForm({ history, onUpdated, setOpen }: IProps) {
  const [date, setDate] = useState<Date | undefined>(history.date ? new Date(history.date) : undefined);
  const [dateType, setDateType] = useState<"manual" | "event">(history.eventId ? "event" : "manual");
  const [openCalendar, setOpenCalendar] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<ICalendarEvent | undefined>(undefined);
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

  const professionalId = form.watch("professionalId");

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

  function handleEventChange(event: ICalendarEvent): void {
    setSelectedEvent(event);
  }

  useEffect(() => {
    if (selectedEvent && dateType === "event") {
      setDate(undefined);
      form.setValue("eventId", selectedEvent.id, { shouldDirty: true });

      const eventDate =
        typeof selectedEvent.startDate === "string"
          ? parseISO(selectedEvent.startDate)
          : new Date(selectedEvent.startDate);
      form.setValue("date", eventDate, { shouldDirty: true });
      form.setValue("reason", selectedEvent.title, { shouldDirty: true });
    } else if (dateType === "manual") {
      setSelectedEvent(undefined);
      form.setValue("eventId", null, { shouldDirty: true });
    }
  }, [selectedEvent, dateType, form]);

  return (
    <div className="flex h-full flex-col">
      <form
        className="grid h-full grid-cols-1 gap-6 overflow-y-auto p-6"
        id="create-history"
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
                <RadioGroup
                  value={dateType}
                  onValueChange={(value) => setDateType(value as "manual" | "event")}
                  className="w-fit"
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual">Manual</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="event" id="event" />
                    <Label htmlFor="event">Relacionada con turno</Label>
                  </div>
                </RadioGroup>
                <div className="flex pt-4">
                  {dateType === "manual" ? (
                    <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                      <PopoverTrigger
                        aria-invalid={fieldState.invalid}
                        className="w-60!"
                        asChild
                        onClick={() => setOpenCalendar(true)}
                      >
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
                  ) : (
                    <EventCombobox
                      aria-invalid={fieldState.invalid}
                      value={selectedEvent?.id ?? history.eventId ?? undefined}
                      disabled={!professionalId}
                      onChange={handleEventChange}
                      professionalId={professionalId}
                      userId={history.userId}
                      width="w-60"
                    />
                  )}
                </div>
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
                <Input aria-invalid={fieldState.invalid} disabled={selectedEvent != undefined} id="reason" {...field} />
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
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="comments">Notas:</FieldLabel>
                  <div
                    className={cn("text-muted-foreground text-sm", { "text-destructive": field.value.length > 1000 })}
                  >
                    {field.value.length}/1000
                  </div>
                </div>
                <RichTextEditor
                  className="max-h-170 overflow-y-auto"
                  field={field}
                  form={form}
                  initialContent={history.comments}
                  invalid={fieldState.invalid}
                  locale={LOCALE}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
      <div className="bg-background shrink-0 border-t p-6">
        <div className="flex items-center justify-end gap-4">
          <Button variant="ghost" onClick={resetForm}>
            Cancelar
          </Button>
          <Button disabled={!form.formState.isDirty} form="create-history" type="submit" variant="default">
            {isUpdating ? <Loader color="white" text="Guardando" /> : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
