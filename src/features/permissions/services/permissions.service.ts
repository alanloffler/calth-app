import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { IPermission } from "@permissions/interfaces/permission.interface";
import type { IPermissionGroup } from "@permissions/interfaces/permission-group.interface";
import { apiClient } from "@core/client/client";

class PermissionsModuleService {
  private static instance: PermissionsModuleService;

  public static getInstance(): PermissionsModuleService {
    if (!PermissionsModuleService.instance) {
      PermissionsModuleService.instance = new PermissionsModuleService();
    }

    return PermissionsModuleService.instance;
  }

  public async create(permission: Partial<IPermission>): Promise<IApiResponse<IPermission>> {
    const response = await apiClient.post("/permissions", permission);
    return response.data;
  }

  public async findAll(): Promise<IApiResponse<IPermission[]>> {
    const response = await apiClient.get("/permissions");
    return response.data;
  }

  public async findAllGrouped(): Promise<IApiResponse<IPermissionGroup[]>> {
    const response = await apiClient.get("/permissions/grouped");
    return response.data;
  }

  public async findAllByCategory(category: string): Promise<IApiResponse<IPermission[]>> {
    const response = await apiClient.get(`/permissions/category/${category}`);
    return response.data;
  }

  public async findOne(id: string): Promise<IApiResponse<IPermission>> {
    const response = await apiClient.get(`/permissions/${id}`);
    return response.data;
  }

  public async update(id: string, permission: Partial<IPermission>): Promise<IApiResponse<IPermission>> {
    const response = await apiClient.patch(`/permissions/${id}`, permission);
    return response.data;
  }

  public async remove(id: string): Promise<IApiResponse<IPermission>> {
    const response = await apiClient.delete(`/permissions/${id}`);
    return response.data;
  }

  public async softRemove(id: string): Promise<IApiResponse<IPermission>> {
    const response = await apiClient.delete(`/permissions/${id}/soft`);
    return response.data;
  }

  public async restore(id: string): Promise<IApiResponse<IPermission>> {
    const response = await apiClient.patch(`/permissions/${id}/restore`);
    return response.data;
  }
}

export const PermissionsService = PermissionsModuleService.getInstance();
