import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { IEffectivePermission } from "@roles/interfaces/effective-permission.interface";
import { apiClient } from "@core/client/client";

class RoleOverridesModuleService {
  private static instance: RoleOverridesModuleService;

  public static getInstance(): RoleOverridesModuleService {
    if (!RoleOverridesModuleService.instance) {
      RoleOverridesModuleService.instance = new RoleOverridesModuleService();
    }

    return RoleOverridesModuleService.instance;
  }

  public async findEffective(roleId: string): Promise<IApiResponse<IEffectivePermission[]>> {
    const response = await apiClient.get(`/role-overrides/${roleId}`);
    return response.data;
  }

  public async upsertOverride(
    roleId: string,
    permissionId: string,
    effect: "grant" | "deny",
  ): Promise<IApiResponse<unknown>> {
    const response = await apiClient.put(`/role-overrides/${roleId}/permissions/${permissionId}`, { effect });
    return response.data;
  }

  public async removeOverride(roleId: string, permissionId: string): Promise<IApiResponse<unknown>> {
    const response = await apiClient.delete(`/role-overrides/${roleId}/permissions/${permissionId}`);
    return response.data;
  }

  public async resetAll(roleId: string): Promise<IApiResponse<unknown>> {
    const response = await apiClient.delete(`/role-overrides/${roleId}`);
    return response.data;
  }
}

export const RoleOverridesService = RoleOverridesModuleService.getInstance();
