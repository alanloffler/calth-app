import { endOfMonth, format, startOfMonth } from "date-fns";

import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { IEventFilters } from "@event/interfaces/filters.interface";
import type { IPaginatedEvents } from "@event/interfaces/paginated-events.interface";
import { apiClient } from "@core/client/client";

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
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ): Promise<IApiResponse<IPaginatedEvents>> {
    let queryParams = `limit=${limit}&page=${page}`;

    if (sortBy) {
      queryParams += `&sortBy=${sortBy}&sortOrder=${sortOrder ?? "asc"}`;
    }
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
    if (filters.recurrent) {
      queryParams += `&recurrent=${filters.recurrent}`;
    }
    if (filters.status) {
      queryParams += `&status=${filters.status}`;
    }

    const path = `/events/filtered?${queryParams}`;

    const response = await apiClient.get(path);
    return response.data;
  }

  public async findDaysWithEvents(professionalId: string, date?: Date) {
    if (!date) return [];

    const initialMonthDate = startOfMonth(date);
    const endMonthDate = endOfMonth(date);
    const fromDate = format(initialMonthDate, "yyyy-MM-dd");
    const toDate = format(endMonthDate, "yyyy-MM-dd");

    const path = `/events/days-with-events/${professionalId}?fromDate=${fromDate}&toDate=${toDate}`;

    const response = await apiClient.get(path);
    return response.data;
  }

  public async removeHard(id: string): Promise<IApiResponse<void>> {
    const path = `/events/${id}`;
    const response = await apiClient.delete(path);
    return response.data;
  }

  public async checkRecurringAvailability(
    professionalId: string,
    startDate: string,
    days: number,
  ): Promise<IApiResponse<{ date: string; available: boolean; suggestion: string }[]>> {
    const path = `/events/check-recurring?professionalId=${professionalId}&startDate=${startDate}&days=${days}`;
    const response = await apiClient.get(path);
    return response.data;
  }
}

export const EventsService = EventsModuleService.getInstance();
