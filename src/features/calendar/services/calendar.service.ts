import type z from "zod";

import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { ICalendarEvent } from "@calendar/interfaces/calendar-event.interface";
import type { TEventStatus } from "@calendar/enums/event-status.enum";
import type { eventSchema } from "@calendar/schemas/event.schema";
import { apiClient } from "@core/client/client";
import { blockedDaysSchema } from "@calendar/schemas/blocked-days.schema";

class CalendarModuleService {
  private static instance: CalendarModuleService;

  public static getInstance(): CalendarModuleService {
    if (!CalendarModuleService.instance) {
      CalendarModuleService.instance = new CalendarModuleService();
    }

    return CalendarModuleService.instance;
  }

  public async create(data: z.infer<typeof eventSchema>): Promise<IApiResponse<ICalendarEvent>> {
    const response = await apiClient.post("/events", data);
    return response.data;
  }

  public async findAll(
    professionalId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<IApiResponse<ICalendarEvent[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get(`events/professional/${professionalId}${query}`);

    const data = response.data;
    if (!data.data) return data;

    return { ...data, data: this.toDate(data.data) };
  }

  public async findAllByBusiness(limit: number): Promise<IApiResponse<ICalendarEvent[]>> {
    const response = await apiClient.get(`/events/business?limit=${limit}`);
    return response.data;
  }

  public async findAllByDateArray(professionalId: string, date: string): Promise<IApiResponse<string[]>> {
    const response = await apiClient.get(`events/professional/${professionalId}/date-array/${date}`);
    return response.data;
  }

  public async findByBusinessProfessionalPatient(
    professionalId: string,
    patientId: string,
  ): Promise<IApiResponse<ICalendarEvent[]>> {
    const response = await apiClient.get(`events/patient/${patientId}?professional=${professionalId}`);
    return response.data;
  }

  public async findOne(id: string): Promise<IApiResponse<ICalendarEvent>> {
    const response = await apiClient.get(`/events/${id}`);
    const data = response.data;
    if (!data.data) return data;

    return {
      ...data,
      data: {
        ...data.data,
        startDate: new Date(data.data.startDate),
        endDate: new Date(data.data.endDate),
      },
    };
  }

  public async update(id: string, data: z.infer<typeof eventSchema>): Promise<IApiResponse<ICalendarEvent>> {
    const response = await apiClient.patch(`/events/${id}`, data);
    return response.data;
  }

  public async updateStatus(eventId: string, status: TEventStatus): Promise<IApiResponse> {
    const response = await apiClient.patch(`/events/${eventId}/status`, { status });
    return response.data;
  }

  public async remove(id: string): Promise<IApiResponse<ICalendarEvent>> {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  }

  // Blocked days => professional calendar config
  // TODO: type api response
  public async createBlockedDay(data: z.infer<typeof blockedDaysSchema>): Promise<IApiResponse<any>> {
    const response = await apiClient.post(`/blocked-days`, data);
    return response.data;
  }

  public async updateBlockedDay(id: string, data: z.infer<typeof blockedDaysSchema>): Promise<IApiResponse<any>> {
    const response = await apiClient.patch(`/blocked-days/${id}`, data);
    return response.data;
  }

  public async findAllBlockedDays(id: string): Promise<IApiResponse<any>> {
    const response = await apiClient.get(`/blocked-days/${id}`);
    return response.data;
  }

  // Private helpers
  private toDate(events: ICalendarEvent[]) {
    if (events) {
      return events.map((event: any) => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
      }));
    }

    return events;
  }
}

export const CalendarService = CalendarModuleService.getInstance();
