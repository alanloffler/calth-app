import "@calendar/styles/calendar.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Calendar as Schedule } from "react-big-calendar";
import { CalendarEventsList } from "@calendar/components/CalendarEventsList";
import { ErrorNotification } from "@components/notifications/ErrorNotification";
import { Loader } from "@components/Loader";
import { PageLoader } from "@components/PageLoader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Toolbar } from "@calendar/components/Toolbar";

import type { Event, ToolbarProps, View } from "react-big-calendar";
import { dateFnsLocalizer } from "react-big-calendar";
import { es } from "date-fns/locale";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { IUser } from "@users/interfaces/user.interface";
import type { TView } from "@calendar/interfaces/calendar-view.type";
import { CalendarService } from "@calendar/services/calendar.service";
import { UsersService } from "@users/services/users.service";
import { cn } from "@lib/utils";
import {
  createEventPropGetter,
  createSlotPropGetter,
  parseCalendarConfig,
  getCalendarDateRange,
  getCalendarRangeFromDate,
  formatDateToString,
} from "@calendar/utils/calendar.utils";
import { useCalendarStore } from "@calendar/stores/calendar.store";
import { useEventStore } from "@calendar/stores/event.store";
import { usePermission } from "@permissions/hooks/usePermission";
import { useTryCatch } from "@core/hooks/useTryCatch";

const locales = { "es-AR": es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: es, weekStartsOn: 1 }),
  getDay,
  locales,
});

const messages = {
  allDay: "Todo el día",
  previous: "Anterior",
  next: "Siguiente",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay eventos en este rango",
  showMore: (total: number) => `${total} más`,
};

export default function Calendar() {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorNotification, setErrorNotification] = useState<boolean>(false);
  const [events, setEvents] = useState<ICalendarEvent[] | undefined>(undefined);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [professionals, setProfessionals] = useState<IUser[] | undefined>(undefined);
  const canViewEvent = usePermission("events-view");
  const { refreshKey, setSelectedEvent, setOpenViewEventSheet } = useEventStore();
  const { isLoading: isLoadingEvents, tryCatch: tryCatchEvents } = useTryCatch();
  const { isLoading: isLoadingProfessional, tryCatch: tryCatchProfessional } = useTryCatch();
  const { isLoading: isLoadingProfessionals, tryCatch: tryCatchProfessionals } = useTryCatch();
  const { selectedDate, selectedView, setSelectedDate, setSelectedView } = useCalendarStore();
  const { selectedProfessional, selectedProfessionalConfig, setSelectedProfessional, setSelectedProfessionalConfig } =
    useCalendarStore();

  const slotPropGetter = useMemo(() => createSlotPropGetter(selectedProfessionalConfig), [selectedProfessionalConfig]);
  const eventPropGetter = useMemo(() => createEventPropGetter(), []);

  const getProfessional = useCallback(
    async (id: string): Promise<void> => {
      const [response, error] = await tryCatchProfessional(UsersService.findProfessional(id));

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response && response.statusCode === 200 && response.data) {
        setErrorNotification(false);

        if (!response.data.professionalProfile) {
          const errMsg = "El profesional no tiene un perfil profesional";
          setErrorMessage(errMsg);
          setErrorNotification(true);
          return;
        }

        setSelectedProfessional(response.data);
        setSelectedProfessionalConfig(parseCalendarConfig(response.data.professionalProfile));
        setIsReady(true);
      }
    },
    [setSelectedProfessional, setSelectedProfessionalConfig, tryCatchProfessional],
  );

  const fetchProfessionals = useCallback(async () => {
    const [response, error] = await tryCatchProfessionals(UsersService.findAll("professional"));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200 && response.data) {
      setProfessionals(response.data);
      getProfessional(response.data[0].id);
    }
  }, [getProfessional, tryCatchProfessionals]);

  const refreshEvents = useCallback(
    async (startDate?: string, endDate?: string) => {
      if (!selectedProfessional) return;

      const [response, error] = await tryCatchEvents(
        CalendarService.findAll(selectedProfessional.id, startDate, endDate),
      );

      if (error) {
        toast.error(error.message);
        setErrorMessage(error.message);
        setErrorNotification(true);
        return;
      }

      if (response && response?.statusCode === 200) {
        setEvents(response.data);
      }
    },
    [selectedProfessional, tryCatchEvents],
  );

  const onView = useCallback(
    (view: View) => {
      if (view === "month") setSelectedDate(new Date());
      setSelectedView(view as TView);
    },
    [setSelectedDate, setSelectedView],
  );

  const onSelectEvent = useCallback(
    (event: Event) => {
      setSelectedEvent(event as ICalendarEvent);
      setOpenViewEventSheet(true);
    },
    [setSelectedEvent, setOpenViewEventSheet],
  );

  const onRangeChange = useCallback(
    (range: { start: Date; end: Date } | Date[], view?: string) => {
      if (!view) return;

      const { start, end } = getCalendarDateRange(range, view as "month" | "week" | "day");
      const startDate = formatDateToString(start);
      const endDate = formatDateToString(end);

      refreshEvents(startDate, endDate);
    },
    [refreshEvents],
  );

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  useEffect(() => {
    if (selectedProfessional && selectedDate && selectedView) {
      const { start, end } = getCalendarRangeFromDate(selectedDate, selectedView);
      const startDate = formatDateToString(start);
      const endDate = formatDateToString(end);

      refreshEvents(startDate, endDate);
    }
  }, [selectedProfessional, refreshKey, refreshEvents, selectedDate, selectedView]);

  if (!isReady || isLoadingEvents) return <PageLoader text="Cargando agenda" />;

  return (
    <>
      <div className="flex h-screen flex-col gap-8">
        <div className="flex items-center gap-4">
          <Select
            disabled={!professionals}
            value={selectedProfessional?.id || ""}
            onValueChange={(professionalId) => {
              if (professionalId) getProfessional(professionalId);
            }}
          >
            <SelectTrigger className="min-w-60" id="professionals" size="lg">
              <SelectValue
                placeholder={isLoadingProfessionals ? "Cargando profesionales" : "Seleccionar profesional"}
              />
            </SelectTrigger>
            <SelectContent>
              {professionals?.map((professional) => (
                <SelectItem key={professional.id} value={professional.id}>
                  {`${professional.professionalProfile?.professionalPrefix} ${professional.firstName} ${professional.lastName}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoadingProfessional && <Loader text="Cargando profesional" />}
          {isLoadingProfessionals && <Loader text="Cargando profesionales" />}
        </div>
        {errorNotification && <ErrorNotification message={errorMessage} tryAgain={false} />}
        {selectedProfessional && selectedProfessionalConfig && !errorNotification && (
          <div className="flex h-full w-full flex-col gap-8 lg:flex-row lg:gap-3">
            <Schedule
              className={cn("calendar w-full lg:w-[80%]", !canViewEvent && "[&_.rbc-event]:pointer-events-none")}
              components={{
                toolbar: (props: ToolbarProps<ICalendarEvent>) => (
                  <Toolbar
                    {...props}
                    calendarView={props.view as TView}
                    currentDate={selectedDate}
                    onCreateEvent={refreshEvents}
                  />
                ),
              }}
              culture="es-AR"
              date={selectedDate}
              endAccessor="endDate"
              events={events}
              formats={{
                eventTimeRangeFormat: (range) => format(range.start, "HH:mm"),
              }}
              key={selectedProfessional.id}
              localizer={localizer}
              max={selectedProfessionalConfig?.endHour}
              messages={messages}
              min={selectedProfessionalConfig?.startHour}
              onNavigate={setSelectedDate}
              onSelectEvent={onSelectEvent}
              onRangeChange={onRangeChange}
              onView={onView}
              slotPropGetter={slotPropGetter}
              eventPropGetter={eventPropGetter}
              startAccessor="startDate"
              step={selectedProfessionalConfig?.step}
              timeslots={selectedProfessionalConfig?.timeSlots}
              view={selectedView}
              views={["month", "week", "day"]}
            />
            <CalendarEventsList className="w-full lg:w-[20%]" professionalId={selectedProfessional.id} />
          </div>
        )}
      </div>
    </>
  );
}
