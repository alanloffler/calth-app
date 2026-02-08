import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { IMedicalHistory, IMedicalHistoryCreate } from "@medical-history/interfaces/medical-history.interface";
import { apiClient } from "@core/client/client";

class MedicalHistoryModuleService {
  private static instance: MedicalHistoryModuleService;

  public static getInstance(): MedicalHistoryModuleService {
    if (!MedicalHistoryModuleService.instance) {
      MedicalHistoryModuleService.instance = new MedicalHistoryModuleService();
    }

    return MedicalHistoryModuleService.instance;
  }

  public async create(data: IMedicalHistoryCreate): Promise<IApiResponse> {
    const response = await apiClient.post("/medical-history", data);
    return response.data;
  }

  public async findAllByPatient(id: string): Promise<IApiResponse<IMedicalHistory[]>> {
    const response = await apiClient.get(`/medical-history/${id}/patient`);
    return response.data;
  }

  public async update(id: string, data: Partial<IMedicalHistory>): Promise<IApiResponse> {
    const response = await apiClient.patch(`/medical-history/${id}`, data);
    return response.data;
  }

  public async remove(id: string): Promise<IApiResponse> {
    const response = await apiClient.delete(`/medical-history/${id}/soft`);
    return response.data;
  }
}

export const MedicalHistoryService = MedicalHistoryModuleService.getInstance();
