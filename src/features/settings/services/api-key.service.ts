import type z from "zod";

import type { IApiKey } from "@settings/interfaces/api-key.interface";
import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { apiKeySchema } from "@settings/schemas/api-key.schema";
import { apiClient } from "@core/client/client";

class ApiKeyModuleService {
  private static instance: ApiKeyModuleService;

  public static getInstance(): ApiKeyModuleService {
    if (!ApiKeyModuleService.instance) {
      ApiKeyModuleService.instance = new ApiKeyModuleService();
    }

    return ApiKeyModuleService.instance;
  }

  public async create(data: z.infer<typeof apiKeySchema>): Promise<IApiResponse<IApiKey[]>> {
    const response = await apiClient.post("/api-keys", data);
    return response.data;
  }

  public async findAll(): Promise<IApiResponse<IApiKey[]>> {
    const response = await apiClient.get("/api-keys");
    return response.data;
  }

  public async update(id: string, data: z.infer<typeof apiKeySchema>): Promise<IApiResponse<void>> {
    if (data.linkedTo === "") delete data.linkedTo;

    const response = await apiClient.patch(`/api-keys/${id}`, data);
    return response.data;
  }

  public async remove(id: string): Promise<IApiResponse<void>> {
    const response = await apiClient.delete(`/api-keys/${id}`);
    return response.data;
  }
}

export const ApiKeyService = ApiKeyModuleService.getInstance();
