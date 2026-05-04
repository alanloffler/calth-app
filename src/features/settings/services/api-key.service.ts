import type { IApiKey } from "@settings/interfaces/api-key.interface";
import type { IApiResponse } from "@core/interfaces/api-response.interface";
import { apiClient } from "@core/client/client";

class ApiKeyModuleService {
  private static instance: ApiKeyModuleService;

  public static getInstance(): ApiKeyModuleService {
    if (!ApiKeyModuleService.instance) {
      ApiKeyModuleService.instance = new ApiKeyModuleService();
    }

    return ApiKeyModuleService.instance;
  }

  public async findAll(): Promise<IApiResponse<IApiKey[]>> {
    const response = await apiClient.get("/api-keys");
    return response.data;
  }

  public async update(id: string, data: Omit<IApiKey, "id">): Promise<IApiResponse<void>> {
    const response = await apiClient.patch(`/api-keys/${id}`, { data });
    return response.data;
  }

  public async remove(id: string): Promise<IApiResponse<void>> {
    const response = await apiClient.delete(`/api-keys/${id}`);
    return response.data;
  }
}

export const ApiKeyService = ApiKeyModuleService.getInstance();
