import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { IRole } from "@roles/interfaces/role.interface";
import { apiClient } from "@core/client/client";

class RolesModuleService {
  private static instance: RolesModuleService;

  public static getInstance(): RolesModuleService {
    if (!RolesModuleService.instance) {
      RolesModuleService.instance = new RolesModuleService();
    }

    return RolesModuleService.instance;
  }

  public async create(role: Partial<IRole>): Promise<IApiResponse<IRole>> {
    const response = await apiClient.post("/roles", role);
    return response.data;
  }

  public async findAll(): Promise<IApiResponse<IRole[]>> {
    const response = await apiClient.get("/roles");
    return response.data;
  }

  public async findAllSoftRemoved(): Promise<IApiResponse<IRole[]>> {
    const response = await apiClient.get("/roles/soft");
    return response.data;
  }

  public async findOne(id: string): Promise<IApiResponse<IRole>> {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  }

  public async findOneSoftRemoved(id: string): Promise<IApiResponse<IRole>> {
    const response = await apiClient.get(`/roles/${id}/soft-removed`);
    return response.data;
  }

  public async update(id: string, role: Partial<IRole>): Promise<IApiResponse<IRole>> {
    const response = await apiClient.patch(`/roles/${id}`, role);
    return response.data;
  }

  public async remove(id: string): Promise<IApiResponse<IRole>> {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  }

  public async softRemove(id: string): Promise<IApiResponse<IRole>> {
    const response = await apiClient.delete(`/roles/soft-remove/${id}`);
    return response.data;
  }

  public async restore(id: string): Promise<IApiResponse<IRole>> {
    const response = await apiClient.patch(`/roles/restore/${id}`);
    return response.data;
  }
}

export const RolesService = RolesModuleService.getInstance();
