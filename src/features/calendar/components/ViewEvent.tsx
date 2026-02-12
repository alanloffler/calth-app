import { EditEventSheet } from "@calendar/components/sheets/EditEventSheet";
import { ViewEventSheet } from "@calendar/components/sheets/ViewEventSheet";

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";

import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";

interface IProps {
  event: ICalendarEvent | null;
  onRefresh: () => Promise<void>;
  openSheet: boolean;
  setOpenSheet: Dispatch<SetStateAction<boolean>>;
}

export function ViewEvent({ event, onRefresh, openSheet, setOpenSheet }: IProps) {
  const [openEditSheet, setOpenEditSheet] = useState<boolean>(false);
  const [localEvent, setLocalEvent] = useState<ICalendarEvent | null>(null);
  const skipRefreshRef = useRef<boolean>(false);

  const currentEvent = localEvent ?? event;

  useEffect(() => {
    if (openSheet) {
      setLocalEvent(null);
    }
  }, [openSheet, event]);

  async function handleRemoveEvent(): Promise<void> {
    skipRefreshRef.current = true;
    setOpenEditSheet(false);
    setOpenSheet(false);
    await onRefresh();
  }

  function handleViewSheetClose(): void {
    if (!skipRefreshRef.current) {
      onRefresh();
    }
    skipRefreshRef.current = false;
  }

  function handleUpdateEvent(updatedEvent: ICalendarEvent): void {
    setLocalEvent(updatedEvent);
    setOpenEditSheet(false);
  }

  return (
    <>
      <ViewEventSheet
        event={currentEvent}
        onClose={handleViewSheetClose}
        onEventChange={setLocalEvent}
        onRemoveEvent={handleRemoveEvent}
        open={openSheet}
        setOpen={setOpenSheet}
        setOpenEditSheet={setOpenEditSheet}
      />
      <EditEventSheet
        event={currentEvent}
        onUpdateEvent={handleUpdateEvent}
        open={openEditSheet}
        setOpen={setOpenEditSheet}
      />
    </>
  );
}
