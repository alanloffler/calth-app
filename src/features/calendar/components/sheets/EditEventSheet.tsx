import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { HourGrid } from "@calendar/components/HourGrid";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";
import { ScrollArea } from "@components/ui/scroll-area";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@components/ui/sheet";
import { UserCombobox } from "@calendar/components/UserCombobox";

import type z from "zod";
import { addMinutes, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { ICalendarConfig } from "@calendar/interfaces/calendar-config.interface";
import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { CalendarService } from "@calendar/services/calendar.service";
import { UsersService } from "@users/services/users.service";
import { eventSchema } from "@calendar/schemas/event.schema";
import { isDayAvailable, isHourSlotAvailable, parseCalendarConfig } from "@calendar/utils/calendar.utils";
import { useTryCatch } from "@core/hooks/useTryCatch";

// TODO: refactor to utils?
function getEventFormValues(event: ICalendarEvent): z.infer<typeof eventSchema> {
  return {
    professionalId: event.professionalId,
    startDate: format(
      typeof event.startDate === "string" ? parseISO(event.startDate) : event.startDate,
      "yyyy-MM-dd'T'HH:mm:ssXXX",
    ),
    title: event.title,
    userId: event.userId,
  };
}
function getEventTimeSlot(event: ICalendarEvent | null): string | null {
  if (!event?.startDate) return null;
  const date = typeof event.startDate === "string" ? parseISO(event.startDate) : event.startDate;
  return format(date, "HH:mm");
}

interface IProps {
  event: ICalendarEvent | null;
  hideOverlay?: boolean;
  onUpdateEvent: (updatedEvent: ICalendarEvent) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function EditEventSheet({ event, hideOverlay = true, onUpdateEvent, open, setOpen }: IProps) {
  const [month, setMonth] = useState<Date | undefined>(new Date());
  const [professionalConfig, setProfessionalConfig] = useState<ICalendarConfig | null>(null);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const originalStartDateRef = useRef<string | null>(null);
  // TODO: handle errors for next 3 hooks
  const { tryCatch: tryCatchDayEvents } = useTryCatch();
  const { isLoading: isUpdating, tryCatch: tryCatchUpdateEvent } = useTryCatch();
  const { tryCatch: tryCatchProfessional } = useTryCatch();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      professionalId: "",
      startDate: "",
      title: "",
      userId: "",
    },
  });

  async function onSubmit(data: z.infer<typeof eventSchema>): Promise<void> {
    if (!event || !professionalConfig) return;

    const startDate = parseISO(data.startDate);
    const endDate = addMinutes(startDate, professionalConfig.step);

    const transformedData = {
      ...data,
      endDate: format(endDate, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    };

    const [response, error] = await tryCatchUpdateEvent(CalendarService.update(event.id, transformedData));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      const [updatedEventResponse] = await tryCatchUpdateEvent(CalendarService.findOne(event.id));

      if (updatedEventResponse?.data) {
        const mergedEvent: ICalendarEvent = {
          ...event,
          ...updatedEventResponse.data,
          professional: {
            ...event.professional,
            ...updatedEventResponse.data.professional,
            professionalProfile: {
              ...event.professional.professionalProfile,
              ...updatedEventResponse.data.professional?.professionalProfile,
            },
          },
          user: {
            ...event.user,
            ...updatedEventResponse.data.user,
          },
        };

        toast.success("Turno actualizado exitosamente");
        onUpdateEvent(mergedEvent);
      }
    }
  }

  const professionalId = useWatch({
    control: form.control,
    name: "professionalId",
  });

  useEffect(() => {
    if (event) {
      const values = getEventFormValues(event);
      form.reset(values);
      originalStartDateRef.current = values.startDate;
    }
  }, [event, form]);

  useEffect(() => {
    if (!professionalId) {
      setProfessionalConfig(null);
      return;
    }

    async function fetchProfessionalConfig() {
      const [response, error] = await tryCatchProfessional(UsersService.findProfessional(professionalId));

      if (error || !response?.data?.professionalProfile) {
        setProfessionalConfig(null);
        return;
      }

      const config = parseCalendarConfig(response.data.professionalProfile);
      setProfessionalConfig(config);

      if (!originalStartDateRef.current) return;
      const originalDate = parseISO(originalStartDateRef.current);

      if (!isDayAvailable(originalDate, config.excludedDays)) {
        form.setValue("startDate", "");
        return;
      }

      if (isHourSlotAvailable(originalDate, config)) {
        form.setValue("startDate", originalStartDateRef.current);
      } else {
        originalDate.setHours(0, 0, 0, 0);
        form.setValue("startDate", format(originalDate, "yyyy-MM-dd'T'HH:mm:ssXXX"));
      }
    }

    fetchProfessionalConfig();
  }, [event, form, professionalId, tryCatchDayEvents, tryCatchProfessional]);

  const startDate = useWatch({
    control: form.control,
    name: "startDate",
  });

  useEffect(() => {
    if (!startDate || !professionalId) {
      setTakenSlots([]);
      return;
    }

    async function fetchDayEvents() {
      const date = format(parseISO(startDate), "yyyy-MM-dd");
      const [response, error] = await tryCatchDayEvents(CalendarService.findAllByDateArray(professionalId, date));

      if (error) {
        toast.error(error.message);
        setTakenSlots([]);
        return;
      }

      if (response?.statusCode === 200 && response.data) {
        const isOriginalProfessional = event?.professionalId === professionalId;
        const currentEventSlot = isOriginalProfessional ? getEventTimeSlot(event) : null;

        const filtered = currentEventSlot
          ? response.data.filter((slot: string) => slot !== currentEventSlot)
          : response.data;

        setTakenSlots(filtered);

        const selectedDate = parseISO(startDate);
        const selectedHour = format(selectedDate, "HH:mm");
        const hasHour = selectedDate.getHours() !== 0 || selectedDate.getMinutes() !== 0;

        if (hasHour && filtered.includes(selectedHour)) {
          selectedDate.setHours(0, 0, 0, 0);
          form.setValue("startDate", format(selectedDate, "yyyy-MM-dd'T'HH:mm:ssXXX"));
        }
      }
    }

    fetchDayEvents();
  }, [form, professionalId, event, startDate, tryCatchDayEvents]);

  return (
    <Sheet open={event !== null && open} onOpenChange={setOpen}>
      <SheetContent
        className="sm:min-w-155"
        hideOverlay={hideOverlay}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          closeRef.current?.focus();
        }}
      >
        <SheetHeader className="pt-8">
          <SheetTitle className="text-lg">Edición del turno</SheetTitle>
          <SheetDescription className="text-base">Formulario para la edición del turno seleccionado</SheetDescription>
          <SheetClose ref={closeRef} />
        </SheetHeader>
        <ScrollArea
          className="**:data-[slot='scroll-area-thumb']:bg-primary **:data-[slot='scroll-area-scrollbar']:bg-primary/20 min-h-0 flex-1"
          color="blue"
          type="auto"
        >
          <form className="flex min-h-0 flex-col gap-6 p-4" id="create-event" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="grid grid-cols-3 gap-6">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="col-span-2">
                    <FieldLabel htmlFor="title">Título del turno</FieldLabel>
                    <Input aria-invalid={fieldState.invalid} id="title" {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup className="grid grid-cols-6 gap-6">
              <Controller
                name="professionalId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="col-span-6 md:col-span-3" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="professionalId">Profesional</FieldLabel>
                    <UserCombobox
                      aria-invalid={fieldState.invalid}
                      id="professionalId"
                      onChange={field.onChange}
                      userType="professional"
                      value={field.value}
                      width="w-full md:w-60!"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="userId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="col-span-3" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="userId">Paciente</FieldLabel>
                    <UserCombobox
                      aria-invalid={fieldState.invalid}
                      id="userId"
                      onChange={field.onChange}
                      value={field.value}
                      width="w-full md:w-60!"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup>
              <Controller
                name="startDate"
                control={form.control}
                render={({ field, fieldState }) => {
                  const hasDate = Boolean(field.value);
                  const hasValidHour =
                    hasDate &&
                    (() => {
                      const date = new Date(field.value);
                      return date.getHours() !== 0 || date.getMinutes() !== 0;
                    })();
                  const isDateInvalid = fieldState.invalid && !hasDate;
                  const isHourInvalid = fieldState.invalid && !hasValidHour;

                  return (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-5 md:grid-rows-1">
                      <Field
                        className="md:col-span-3"
                        data-invalid={isDateInvalid}
                        style={{ position: "relative", zIndex: 2 }}
                      >
                        <FieldLabel htmlFor="date">Fecha</FieldLabel>
                        <div className="max-w-90 flex-1 place-self-center">
                          <Calendar
                            aria-invalid={isDateInvalid}
                            className="aspect-square h-fit w-full"
                            disabled={[{ dayOfWeek: professionalConfig?.excludedDays as number[] }]}
                            id="date"
                            locale={es}
                            mode="single"
                            month={month}
                            onMonthChange={setMonth}
                            onSelect={(date) => {
                              field.onChange(date ? format(date, "yyyy-MM-dd'T'00:00:00XXX") : "");
                            }}
                            selected={field.value ? parseISO(field.value) : undefined}
                          />
                          {isDateInvalid && <FieldError errors={[{ message: "Debe seleccionar una fecha" }]} />}
                        </div>
                      </Field>
                      <Field
                        className="md:col-span-2"
                        data-invalid={isHourInvalid}
                        style={{ position: "relative", zIndex: 1 }}
                      >
                        <FieldLabel>Horario</FieldLabel>
                        {professionalConfig && (
                          <HourGrid
                            form={form}
                            isInvalid={isHourInvalid}
                            professionalConfig={professionalConfig}
                            takenSlots={takenSlots}
                          />
                        )}
                        {isHourInvalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    </div>
                  );
                }}
              />
            </FieldGroup>
            <div className="flex flex-col justify-center gap-4 pt-8 md:flex-row md:justify-end">
              <Button
                className="md:order-2"
                disabled={!form.formState.isDirty}
                form="create-event"
                type="submit"
                variant="default"
              >
                {isUpdating ? <Loader color="white" text="Guardando" /> : "Guardar"}
              </Button>
              <Button
                className="md:order-1"
                type="button"
                variant="ghost"
                onClick={() => {
                  form.clearErrors();
                  if (event) form.reset(getEventFormValues(event));
                  setOpen(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
