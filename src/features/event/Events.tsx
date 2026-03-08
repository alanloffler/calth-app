import { useQuery } from "@tanstack/react-query";

import { EventsService } from "@event/services/events.service";

const LIMIT = 10;

export default function Events() {
  const { data: events } = useQuery({
    queryKey: ["events", LIMIT],
    queryFn: () => EventsService.findAllByBusiness(LIMIT),
  });

  return <>{JSON.stringify(events, null, 2)}</>;
}
