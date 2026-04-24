import "@calendar/styles/calendar.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Plus } from "lucide-react";

import { Button } from "@components/ui/button";
import { Calendar as Schedule } from "react-big-calendar";
import { CalendarEventsList } from "@calendar/components/CalendarEventsList";
import { Card } from "@components/ui/card";
import { CustomEvent } from "@calendar/components/calendar/CustomEvent";
import { ErrorNotification } from "@components/notifications/ErrorNotification";
import { Link } from "react-router";
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
import { useQuery } from "@tanstack/react-query";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { TView } from "@calendar/interfaces/calendar-view.type";
import { CalendarService } from "@calendar/services/calendar.service";
import { MESSAGES } from "@calendar/dictionaries/messages.dictionary";
import { UsersService } from "@users/services/users.service";
import { cn } from "@core/lib/utils";
import {
  createEventPropGetter,
  createSlotPropGetter,
  parseCalendarConfig,
  getCalendarRangeFromDate,
  formatDateToString,
} from "@calendar/utils/calendar.utils";
import { useCalendarStore } from "@calendar/stores/calendar.store";
import { useEventStore } from "@calendar/stores/event.store";
import { usePermission } from "@permissions/hooks/usePermission";

const locales = { "es-AR": es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: es, weekStartsOn: 1 }),
  getDay,
  locales,
});

interface IDateRange {
  startDate: string;
  endDate: string;
}

export default function Calendar() {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorNotification, setErrorNotification] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | undefined>(undefined);
  const canViewEvent = usePermission("events-view");
  const { refreshKey, setSelectedEvent, setOpenViewEventSheet } = useEventStore();
  const { selectedDate, selectedView, setSelectedDate, setSelectedView } = useCalendarStore();
  const { selectedProfessional, selectedProfessionalConfig, setSelectedProfessional, setSelectedProfessionalConfig } =
    useCalendarStore();

  const dateRange = useMemo<IDateRange>(() => {
    const { start, end } = getCalendarRangeFromDate(selectedDate, selectedView);
    return { startDate: formatDateToString(start), endDate: formatDateToString(end) };
  }, [selectedDate, selectedView]);

  const {
    data: events,
    isLoading: isLoadingEvents,
    isError: isEventsError,
    error: eventsError,
  } = useQuery({
    queryKey: ["events", "calendar", selectedProfessional?.id, dateRange.startDate, dateRange.endDate, refreshKey],
    queryFn: () => CalendarService.findAll(selectedProfessional!.id, dateRange.startDate, dateRange.endDate),
    select: (response) => response.data,
    enabled: !!selectedProfessional,
  });

  useEffect(() => {
    if (isEventsError && eventsError) {
      const message = (eventsError as Error).message;
      toast.error(message);
      setErrorMessage(message);
      setErrorNotification(true);
    }
  }, [isEventsError, eventsError]);

  const slotPropGetter = useMemo(() => createSlotPropGetter(selectedProfessionalConfig), [selectedProfessionalConfig]);
  const eventPropGetter = useMemo(() => createEventPropGetter(), []);

  const { data: professionals, isLoading: isLoadingProfessionals } = useQuery({
    queryKey: ["professionals"],
    queryFn: () => UsersService.findAll("professional"),
    select: (response) => response.data,
  });

  useEffect(() => {
    if (professionals && professionals.length > 0 && !selectedProfessionalId) {
      setSelectedProfessionalId(professionals[0].id);
    }
  }, [professionals, selectedProfessionalId]);

  const { data: professional, isLoading: isLoadingProfessional } = useQuery({
    queryKey: ["professional", selectedProfessionalId],
    queryFn: () => UsersService.findProfessional(selectedProfessionalId!),
    select: (response) => response.data,
    enabled: !!selectedProfessionalId,
  });

  useEffect(() => {
    if (!professional) return;

    if (!professional.professionalProfile) {
      const errMsg = "El profesional no tiene un perfil profesional";
      setErrorMessage(errMsg);
      setErrorNotification(true);
      return;
    }

    setErrorNotification(false);
    setSelectedProfessional(professional);
    setSelectedProfessionalConfig(parseCalendarConfig(professional.professionalProfile));
    setIsReady(true);
  }, [professional, setSelectedProfessional, setSelectedProfessionalConfig]);

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

  if (professionals?.length === 0) {
    return (
      <Card className="mx-auto w-fit px-6">
        <span>Aún no hay profesionales para mostrar la agenda.</span>
        <Button className="mx-auto w-fit" size="default" variant="default" asChild>
          <Link to="/users/create" state={{ role: "professional" }}>
            <Plus />
            Creá un profesional
          </Link>
        </Button>
      </Card>
    );
  }

  if (!isReady) {
    return <PageLoader text="Cargando agenda" />;
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-8">
        <div className="flex items-center gap-4">
          <Select
            disabled={!professionals}
            value={selectedProfessionalId || ""}
            onValueChange={(professionalId) => {
              if (professionalId) setSelectedProfessionalId(professionalId);
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
          <div className="relative flex h-full w-full flex-col gap-8 lg:flex-row lg:gap-3">
            {isLoadingEvents && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/30">
                <PageLoader text="Cargando turnos" />
              </div>
            )}
            <Schedule
              className={cn(
                "calendar w-full lg:w-[80%]",
                !canViewEvent && "[&_.rbc-event]:pointer-events-none",
                isLoadingEvents && "pointer-events-none opacity-50",
              )}
              components={{
                event: ({ event }) => <CustomEvent event={event} view={selectedView} />,
                toolbar: (props: ToolbarProps<ICalendarEvent>) => (
                  <Toolbar {...props} calendarView={props.view as TView} currentDate={selectedDate} />
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
              messages={MESSAGES}
              min={selectedProfessionalConfig?.startHour}
              onNavigate={setSelectedDate}
              onSelectEvent={onSelectEvent}
              onView={onView}
              slotPropGetter={slotPropGetter}
              eventPropGetter={eventPropGetter}
              startAccessor="startDate"
              step={selectedProfessionalConfig?.step}
              timeslots={selectedProfessionalConfig?.timeSlots}
              tooltipAccessor={null}
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
