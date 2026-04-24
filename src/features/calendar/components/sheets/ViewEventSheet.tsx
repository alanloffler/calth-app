import { BellRing, BriefcaseMedical, CalendarDays, Clock, FilePenLine, Mail, Smartphone, Trash2 } from "lucide-react";
import { Patients } from "@components/icons/Patients";
import { WhatsApp } from "@components/icons/WhatsApp";

import { Activity } from "react";
import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { ConfirmDialog } from "@components/dialogs/ConfirmDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { EventStatus } from "@calendar/components/ui/EventStatus";
import { Protected } from "@auth/components/Protected";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { UpdateEventStatus } from "@calendar/components/UpdateEventStatus";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { CalendarService } from "@calendar/services/calendar.service";
import { formatIc } from "@core/formatters/ic.formatter";
import { queryClient } from "@core/lib/query-client";
import { uppercaseFirst } from "@core/formatters/uppercase-first.formatter";
import { useEventStore } from "@calendar/stores/event.store";
import { usePermission } from "@permissions/hooks/usePermission";

export function ViewEventSheet() {
  const {
    openViewEventSheet,
    selectedEvent: event,
    setOpenEditEventSheet,
    setOpenViewEventSheet,
    setSelectedEvent,
  } = useEventStore();
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const hasPermissions = usePermission(["events-delete-hard", "events-update", "events-notify"], "some");

  function removeEventDialog(): void {
    setOpenRemoveDialog(true);
  }

  const { mutate: removeEvent, isPending: isRemoving } = useMutation({
    mutationKey: ["events", "remove"],
    mutationFn: (id: string) => CalendarService.remove(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(response.message);
      setOpenViewEventSheet(false);
      setSelectedEvent(null);
    },
    onSettled: () => {
      setOpenRemoveDialog(false);
    },
  });

  function notify(type: "Email" | "WhatsApp"): void {
    toast.success(`Notificación enviada por ${type}`);
  }

  function handleStatusChange(updatedEvent: ICalendarEvent): void {
    setSelectedEvent(updatedEvent);
    queryClient.invalidateQueries({ queryKey: ["events"] });
  }

  if (!event) return null;

  return (
    <>
      <Sheet open={openViewEventSheet} onOpenChange={setOpenViewEventSheet}>
        <SheetTrigger asChild></SheetTrigger>
        <SheetContent className="sm:min-w-120" onOpenAutoFocus={(e) => e.preventDefault()}>
          <SheetHeader className="pt-8">
            <SheetTitle className="text-lg">Detalles del turno</SheetTitle>
            <SheetDescription className="text-base">Detalles del turno seleccionado</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-6 p-4">
            <article className="flex flex-col rounded-lg border p-4">
              <header className="flex justify-center">
                <h2 className="text-base font-semibold md:text-lg">{event.title}</h2>
              </header>
              <ul className="mt-4 flex flex-col gap-3 text-sm md:text-base">
                <li className="flex items-center gap-4">
                  <EventStatus variant={event.status} />
                  {event.recurrentId && <Badge>Recurrente</Badge>}
                </li>
                <li>
                  <div className="flex items-center gap-3">
                    <BriefcaseMedical className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
                    <span>{`${event.professional.professionalProfile?.professionalPrefix} ${event.professional.firstName} ${event.professional.lastName}`}</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-3">
                    <Patients className="h-5 w-5 shrink-0 -translate-x-px" />
                    <span>{`${event.user.firstName} ${event.user.lastName}`}</span>
                    <Badge variant="id" size="small">
                      {formatIc(event.user.ic)}
                    </Badge>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
                    <span>{event.startDate && uppercaseFirst(format(event.startDate, "PPPP", { locale: es }))}</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
                    <span>
                      {event.startDate && format(event.startDate, "HH':'mm", { locale: es }) + " - "}
                      {event.endDate && format(event.endDate, "HH':'mm", { locale: es }) + " hs."}
                    </span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
                    <span>{event.user.phoneNumber}</span>
                  </div>
                </li>
              </ul>
              <Activity mode={hasPermissions ? "visible" : "hidden"}>
                <footer className="mt-4 flex justify-end gap-1">
                  <Protected requiredPermission="events-delete-hard">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="hover:bg-rose-50 hover:text-rose-600"
                          onClick={removeEventDialog}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Eliminar</TooltipContent>
                    </Tooltip>
                  </Protected>
                  <Protected requiredPermission="events-update">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="hover:bg-green-50 hover:text-green-600"
                          onClick={() => {
                            setSelectedEvent(event);
                            setOpenEditEventSheet(true);
                          }}
                          size="icon"
                          variant="ghost"
                        >
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                  </Protected>
                  <Protected requiredPermission="events-notify">
                    {/* TODO: implement notifications with email and WhatsApp */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button className="hover:bg-fuchsia-50 hover:text-fuchsia-600" size="icon" variant="ghost">
                              <BellRing className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Notificaciones</TooltipContent>
                        </Tooltip>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => notify("Email")}>
                          <Mail className="h-4 w-4" />
                          Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => notify("WhatsApp")}>
                          <WhatsApp className="h-3.5! w-3.5!" />
                          WhatsApp
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Protected>
                </footer>
              </Activity>
            </article>
            <div className="flex items-center gap-2">
              <Protected requiredPermission="events-update">
                <span className="text-sm font-medium">Cambiar estado:</span>
                <UpdateEventStatus event={event} onEventChange={handleStatusChange} />
              </Protected>
            </div>
            {event.siblings && event.siblings.length > 0 && (
              <Card className="bg-muted flex flex-col gap-2 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge size="icon" variant="recurrent">
                    R
                  </Badge>
                  <p>Este turno forma parte de una serie de turnos recurrentes.</p>
                </div>
                <ul className="flex flex-col gap-1">
                  {event.siblings?.map((sibling, idx) => (
                    <li className="flex items-center gap-2" key={sibling.id}>
                      <div>Turno {idx + 1}:</div>
                      <div>{format(sibling.startDate, "dd/MM/yy")}</div>
                      <div>
                        {format(sibling.startDate, "HH:mm")} - {format(sibling.endDate, "HH:mm")}
                      </div>
                      <span>
                        <EventStatus size="small" variant={sibling.status} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        title="Eliminar turno"
        description="¿Seguro que querés eliminar este turno?"
        alertMessage="El turno será eliminado de la base de datos. Esta acción es irreversible."
        callback={() => removeEvent(event.id)}
        loader={isRemoving}
        open={openRemoveDialog}
        setOpen={setOpenRemoveDialog}
        showAlert
        variant="destructive"
      >
        <ul>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Título:</span>
            <span>{event.title}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Fecha:</span>
            <span>{format(event.startDate, "P", { locale: es })}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Profesional:</span>
            <span>{`${event.professional.professionalProfile?.professionalPrefix} ${event.professional.firstName} ${event.professional.lastName}`}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Paciente:</span>
            <span>{`${event.user.firstName} ${event.user.lastName}`}</span>
          </li>
        </ul>
      </ConfirmDialog>
    </>
  );
}
