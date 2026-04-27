import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { IUser } from "@users/interfaces/user.interface";
import { apiClient } from "@core/client/client";

class AccountModuleService {
  private static instance: AccountModuleService;

  public static getInstance(): AccountModuleService {
    if (!AccountModuleService.instance) {
      AccountModuleService.instance = new AccountModuleService();
    }

    return AccountModuleService.instance;
  }

  public async get(): Promise<IApiResponse<IUser>> {
    const response = await apiClient.get("/users/profile");
    return response.data;
  }

  public async update(data: Partial<IUser>): Promise<IApiResponse<IUser>> {
    // TODO: fix on BEs to unify format
    const be = import.meta.env.VITE_BACKEND;
    let _data;
    if (be === "go") {
      _data = { user: { ...data } };
    } else if (be === "nest") {
      _data = { ...data };
    }

    const response = await apiClient.patch("/users/profile", _data);
    return response.data;
  }
}

export const AccountService = AccountModuleService.getInstance();
