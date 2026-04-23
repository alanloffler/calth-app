import { Button } from "@components/ui/button";
import { Calendar, CalendarDayButton } from "@components/ui/calendar";
import { ChooseRecurringDate } from "@calendar/components/ChooseRecurringDate";
import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { HourGrid } from "@calendar/components/HourGrid";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";
import { ScrollArea } from "@components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@components/ui/sheet";
import { UserCombobox } from "@calendar/components/UserCombobox";

import type z from "zod";
import { addMinutes, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";

import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { ICalendarConfig } from "@calendar/interfaces/calendar-config.interface";
import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { IRecurrentDayResponse } from "@event/interfaces/recurrent-day.interface";
import { CalendarService } from "@calendar/services/calendar.service";
import { EventsService } from "@event/services/events.service";
import { UsersService } from "@users/services/users.service";
import { eventSchema } from "@calendar/schemas/event.schema";
import { parseCalendarConfig } from "@calendar/utils/calendar.utils";
import { queryClient } from "@core/lib/query-client";
import { useCalendarStore } from "@calendar/stores/calendar.store";
import { useEventStore } from "@calendar/stores/event.store";

export function CreateEventSheet() {
  const [isRecurringActive, setIsRecurringActive] = useState<boolean>(false);
  const [month, setMonth] = useState<Date | undefined>(new Date());
  const [professionalConfig, setProfessionalConfig] = useState<ICalendarConfig | null>(null);
  const [recurringDays, setRecurringDays] = useState<IRecurrentDayResponse | undefined>(undefined);
  const { openCreateEventSheet: open, setOpenCreateEventSheet: setOpen } = useEventStore();
  const { selectedProfessional } = useCalendarStore();

  // Form
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      professionalId: "",
      startDate: undefined,
      title: "",
      userId: "",
      recurringDates: undefined,
      recurringCount: undefined,
    },
  });

  // Form watchers
  const professionalId = useWatch({ control: form.control, name: "professionalId" });
  const recurringDates = useWatch({ control: form.control, name: "recurringDates" });
  const startDate = useWatch({ control: form.control, name: "startDate" });

  // Fetch: professional config
  const { data: professional } = useQuery({
    queryKey: ["professional", "config", professionalId],
    queryFn: () => UsersService.findProfessional(professionalId),
    select: (response) => response.data,
    enabled: !!professionalId,
  });

  useEffect(() => {
    form.setValue("startDate", "");

    if (!professionalId || !professional?.professionalProfile) {
      setProfessionalConfig(null);
      return;
    }

    const config = parseCalendarConfig(professional.professionalProfile);
    setProfessionalConfig(config);

    // DISABLED: Select the first available day if no start date is set
    // if (isDayAvailable(new Date(), config.excludedDays)) {
    //   form.setValue("startDate", format(new Date(), "yyyy-MM-dd'T'00:00:00XXX"));
    // }
  }, [form, professional, professionalId]);

  // Calendar: days with events
  const { data: daysWithEvents } = useQuery({
    queryKey: ["days-with-events", professionalId, month],
    queryFn: () => EventsService.findDaysWithEvents(professionalId, month),
    enabled: !!professionalId && !!month,
  });

  const getDaysWithEventsArray = (data: { [key: number]: boolean } | undefined): number[] => {
    if (!data) return [];
    return Object.entries(data)
      .filter(([, hasEvents]) => hasEvents)
      .map(([day]) => parseInt(day));
  };

  const withEvents = getDaysWithEventsArray(daysWithEvents?.data);

  // Calendar: blocked days
  const { data: blockedDays = [] } = useQuery({
    queryKey: ["calendar", "blocked-days", professionalId],
    queryFn: () => CalendarService.findAllBlockedDays(professionalId),
    select: (response) => response.data,
    enabled: !!professionalId,
  });

  const blockedDates = useMemo(
    () => (blockedDays ?? []).map((day: { date: string }) => parseISO(day.date)),
    [blockedDays],
  );

  // Calendar: recurring events
  function handleRecurringConfirm(dates: string[], count: number) {
    form.setValue("recurringCount", count, { shouldDirty: true });
    form.setValue("recurringDates", dates, { shouldDirty: true, shouldValidate: true });
  }

  const handleRecurringActiveChange = useCallback(
    (active: boolean) => {
      setIsRecurringActive(active);
      if (!active) {
        form.setValue("recurringCount", undefined);
        form.setValue("recurringDates", undefined, { shouldValidate: true });
      }
    },
    [form],
  );

  useEffect(() => {
    form.setValue("recurringCount", undefined);
    form.setValue("recurringDates", undefined);
  }, [startDate, form]);

  // HourGrid: taken hour slots
  const { data: takenSlots } = useQuery({
    queryKey: ["hour-grid", "taken-slots", professionalId, startDate],
    queryFn: () => CalendarService.findAllByDateArray(professionalId, format(parseISO(startDate), "yyyy-MM-dd")),
    select: (data) => data?.data ?? [],
    enabled: !!professionalId && !!startDate,
  });

  useEffect(() => {
    if (!startDate || !professionalId) return;

    const selectedDate = parseISO(startDate);
    const selectedHour = format(selectedDate, "HH:mm");
    const hasHour = selectedDate.getHours() !== 0 || selectedDate.getMinutes() !== 0;

    if (hasHour && takenSlots?.includes(selectedHour)) {
      selectedDate.setHours(0, 0, 0, 0);
      form.setValue("startDate", format(selectedDate, "yyyy-MM-dd'T'HH:mm:ssXXX"));
    }
  }, [form, professionalId, startDate, takenSlots]);

  // Sheet: open/close actions
  useEffect(() => {
    if (open === false) {
      form.reset();
      setIsRecurringActive(false);
    }
  }, [form, open]);

  // Submit handler: create event
  const { mutate: createEvent, isPending: isSaving } = useMutation<
    IApiResponse<ICalendarEvent>,
    Error,
    z.infer<typeof eventSchema>
  >({
    mutationFn: async ({ recurringCount: _, ...data }) => {
      if (!professionalConfig) throw new Error("No hay configuración del profesional");

      const startDate = parseISO(data.startDate);
      const endDate = addMinutes(startDate, professionalConfig.step);

      const transformedData = {
        ...data,
        endDate: format(endDate, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      };

      return CalendarService.create(transformedData);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(response.message);
      setOpen(false);
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:min-w-155">
        <SheetHeader className="pt-8">
          <SheetTitle className="text-lg">Agregar turno a la agenda</SheetTitle>
          <SheetDescription className="text-base">
            Completá el formulario para agregar un turno a la agenda
          </SheetDescription>
        </SheetHeader>
        <ScrollArea
          className="**:data-[slot='scroll-area-thumb']:bg-primary **:data-[slot='scroll-area-scrollbar']:bg-primary/20 min-h-0 flex-1"
          color="blue"
          type="auto"
        >
          <form
            className="flex min-h-0 flex-col gap-6 p-4"
            id="create-event"
            onSubmit={form.handleSubmit((data) => createEvent(data))}
          >
            <FieldGroup className="grid grid-cols-3 gap-6">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="col-span-3 md:col-span-2">
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
                      defaultSelected={selectedProfessional?.id}
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
                  <Field className="col-span-6 md:col-span-3" data-invalid={fieldState.invalid}>
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
                        <div className="flex-1 rounded-md border shadow-xs">
                          {/* TODO: get the blocked days on professionalConfig??? at backend instance
                          and retrieve one object only (not merge here) */}
                          <Calendar
                            aria-invalid={isDateInvalid}
                            className="mx-auto aspect-square h-fit w-full max-w-75"
                            disabled={[
                              ...(professionalConfig ? [{ dayOfWeek: professionalConfig.excludedDays }] : []),
                              ...blockedDates,
                            ]}
                            modifiers={{
                              withEvents: (date) => {
                                if (professionalConfig?.excludedDays?.includes(date.getDay())) return false;
                                return withEvents.includes(date.getDate());
                              },
                            }}
                            components={{
                              DayButton: ({ day, modifiers, ...props }) => (
                                <>
                                  {/*className={
                                    modifiers.withEvents ? `${className} text-red-500! opacity-100!` : className
                                  }*/}
                                  <CalendarDayButton day={day} modifiers={modifiers} {...props} />
                                  {modifiers.withEvents && (
                                    <span className="absolute right-2 bottom-2 flex size-1.5 rounded-full bg-green-400"></span>
                                  )}
                                </>
                              ),
                            }}
                            id="date"
                            showOutsideDays={false}
                            locale={es}
                            mode="single"
                            month={month}
                            onMonthChange={setMonth}
                            onSelect={(date) => {
                              field.onChange(date ? format(date, "yyyy-MM-dd'T'00:00:00XXX") : "");
                            }}
                            selected={field.value ? parseISO(field.value) : undefined}
                          />
                        </div>
                        {isDateInvalid && <FieldError errors={[fieldState.error]} />}
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
            <FieldGroup>
              <ChooseRecurringDate
                disabled={!startDate || new Date(startDate).getHours() < 1}
                error={form.formState.errors.recurringDates?.message}
                onActiveChange={handleRecurringActiveChange}
                onConfirm={handleRecurringConfirm}
                onSuggestionSelect={(date) => form.setValue("startDate", date)}
                professionalId={professionalId}
                recurringDays={recurringDays}
                selectedDate={startDate}
                setRecurringDays={setRecurringDays}
                slotDuration={professionalConfig?.step}
              />
            </FieldGroup>
            <div className="flex flex-col justify-center gap-4 pt-8 md:flex-row md:justify-end">
              <Button
                className="md:order-2"
                disabled={
                  !form.formState.isDirty ||
                  (isRecurringActive && !recurringDates?.length) ||
                  !!form.formState.errors.recurringDates
                }
                form="create-event"
                type="submit"
                variant="default"
              >
                {isSaving ? <Loader color="white" text="Guardando" /> : "Guardar"}
              </Button>
              <Button
                className="md:order-1"
                type="button"
                variant="ghost"
                onClick={() => {
                  form.clearErrors();
                  form.reset();
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
