import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { IBusiness } from "@business/interfaces/business.interface";
import type { ICreateBusiness } from "@business/interfaces/create-business.interface";
import { apiClient } from "@core/client/client";

class BusinessModuleService {
  private static instance: BusinessModuleService;

  public static getInstance(): BusinessModuleService {
    if (!BusinessModuleService.instance) {
      BusinessModuleService.instance = new BusinessModuleService();
    }

    return BusinessModuleService.instance;
  }

  public async create(data: ICreateBusiness): Promise<IApiResponse<IBusiness>> {
    const response = await apiClient.post("/businesses", data);
    return response.data;
  }

  public async findOne(businessId: string): Promise<IApiResponse<IBusiness>> {
    const response = await apiClient.get(`/businesses/${businessId}`);
    return response.data;
  }

  public async update(id: string, data: Partial<IBusiness>): Promise<IApiResponse<IBusiness>> {
    const response = await apiClient.patch(`/businesses/${id}`, data);
    return response.data;
  }

  public async checkTaxIdAvailability(taxId: string): Promise<IApiResponse<boolean>> {
    const response = await apiClient.get(`/businesses/availability/tax-id/${taxId}`);
    return response.data;
  }

  public async checkSlugAvailability(slug: string): Promise<IApiResponse<boolean>> {
    const response = await apiClient.get(`/businesses/availability/slug/${slug}`);
    return response.data;
  }
}

export const BusinessService = BusinessModuleService.getInstance();
