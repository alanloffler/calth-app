import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import { apiClient } from "@core/client/client";

class EventsModuleService {
  private static instance: EventsModuleService;

  public static getInstance(): EventsModuleService {
    if (!EventsModuleService.instance) {
      EventsModuleService.instance = new EventsModuleService();
    }

    return EventsModuleService.instance;
  }

  public async findAllByBusiness(limit: number): Promise<IApiResponse<ICalendarEvent[]>> {
    const response = await apiClient.get(`/events/business?limit=${limit}`);
    return response.data;
  }
}

export const EventsService = EventsModuleService.getInstance();
