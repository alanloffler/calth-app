import { format } from "date-fns";

import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { IEventFilters } from "@event/interfaces/filters.interface";
import { apiClient } from "@core/client/client";
import type { IPaginatedEvents } from "@event/interfaces/paginated-events.interface";

class EventsModuleService {
  private static instance: EventsModuleService;

  public static getInstance(): EventsModuleService {
    if (!EventsModuleService.instance) {
      EventsModuleService.instance = new EventsModuleService();
    }

    return EventsModuleService.instance;
  }

  public async findEventsFiltered(
    filters: IEventFilters,
    limit: number = 5,
    page: number = 1,
  ): Promise<IApiResponse<IPaginatedEvents>> {
    let queryParams = `limit=${limit}&page=${page}`;

    if (filters.date) {
      const formatted = format(filters.date, "yyyy-MM-dd");
      queryParams += `&date=${formatted}`;
    }
    if (filters.patientId) {
      queryParams += `&patientId=${filters.patientId}`;
    }
    if (filters.professionalId) {
      queryParams += `&professionalId=${filters.professionalId}`;
    }
    if (filters.status) {
      queryParams += `&status=${filters.status}`;
    }

    const path = `/events/filtered?${queryParams}`;

    const response = await apiClient.get(path);
    return response.data;
  }
}

export const EventsService = EventsModuleService.getInstance();
