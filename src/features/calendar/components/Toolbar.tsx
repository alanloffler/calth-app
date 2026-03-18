import { Plus } from "lucide-react";

import { Button } from "@components/ui/button";
import { DateHeader } from "@calendar/components/DateHeader";
import { Navigation } from "@calendar/components/Navigation";
import { Protected } from "@auth/components/Protected";

import type { ToolbarProps } from "react-big-calendar";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { TView } from "@calendar/interfaces/calendar-view.type";
import { cn } from "@lib/utils";
import { useEventStore } from "@calendar/stores/event.store";
import { useSidebar } from "@components/ui/sidebar";

interface IProps extends ToolbarProps<ICalendarEvent> {
  calendarView: TView;
  currentDate: Date;
  onCreateEvent: () => void;
}

export function Toolbar(props: IProps) {
  const { open } = useSidebar();
  const { setOpenCreateEventSheet } = useEventStore();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 rounded-t-lg border border-b-0 p-6 lg:flex-row",
        open ? "md:flex-col" : "md:flex-row",
      )}
    >
      <DateHeader calendarView={props.calendarView} currentDate={props.currentDate} />
      <div className="flex flex-col items-center gap-3 md:flex-row">
        <Navigation {...props} />
        <Protected requiredPermission="events-create">
          <Button className="w-full md:w-auto" onClick={() => setOpenCreateEventSheet(true)}>
            <Plus className="h-4 w-4" />
            Turno
          </Button>
        </Protected>
      </div>
    </div>
  );
}
