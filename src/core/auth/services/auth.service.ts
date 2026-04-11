import type { IAdmin } from "@admin/interfaces/admin.interface";
import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { ICredentials, ISignIn } from "@auth/interfaces/auth.interface";
import type { IUser } from "@users/interfaces/user.interface";
import { apiClient } from "@core/client/client";

class AuthModuleService {
  private static instance: AuthModuleService;

  public static getInstance(): AuthModuleService {
    if (!AuthModuleService.instance) {
      AuthModuleService.instance = new AuthModuleService();
    }

    return AuthModuleService.instance;
  }

  public async signIn(credentials: ICredentials): Promise<IApiResponse<ISignIn>> {
    const response = await apiClient.post<IApiResponse<ISignIn>>("/auth/login", credentials);
    return response.data;
  }

  public async signOut(): Promise<IApiResponse<null>> {
    const response = await apiClient.post<IApiResponse<null>>("/auth/logout");
    return response.data;
  }

  public async getMe(): Promise<IApiResponse<IAdmin | IUser>> {
    const response = await apiClient.get<IApiResponse<IAdmin | IUser>>("/auth/me");
    return response.data;
  }
}

export const AuthService = AuthModuleService.getInstance();
