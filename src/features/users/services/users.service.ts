import { format, parse } from "date-fns";

import type { IApiResponse } from "@core/interfaces/api-response.interface";
import type { ICreatePatientForm } from "@users/interfaces/create-patient.interface";
import type { ICreateProfessionalForm } from "@users/interfaces/create-professional.interface";
import type { IUser } from "@users/interfaces/user.interface";
import type { TUserRole } from "@roles/interfaces/user-role.type";
import { apiClient } from "@core/client/client";

class UsersModuleService {
  private static instance: UsersModuleService;

  public static getInstance(): UsersModuleService {
    if (!UsersModuleService.instance) {
      UsersModuleService.instance = new UsersModuleService();
    }

    return UsersModuleService.instance;
  }

  // Professionals services
  public async createProfessional(data: ICreateProfessionalForm): Promise<IApiResponse<IUser>> {
    const payload = this.toProfessionalData(data);

    const response = await apiClient.post("/users/professional", payload);
    return response.data;
  }

  // Patients services
  public async createPatient(data: ICreatePatientForm): Promise<IApiResponse<IUser>> {
    const payload = this.toPatientData(data);

    const response = await apiClient.post("/users/patient", payload);
    return response.data;
  }

  public async findPatientWithHistory(id: string): Promise<IApiResponse<IUser>> {
    const response = await apiClient.get(`/users/patient-history/${id}`);
    return response.data;
  }

  public async findPatientSoftRemovedWithHistory(id: string): Promise<IApiResponse<IUser>> {
    const response = await apiClient.get(`/users/patient-soft-removed-history/${id}`);
    return response.data;
  }

  // TODO: order and usage confirmation
  public async findAll(role: string): Promise<IApiResponse<IUser[]>> {
    const response = await apiClient.get(`/users/role/${role}`);
    return response.data;
  }

  public async findAllSoftRemoved(role: string): Promise<IApiResponse<IUser[]>> {
    const response = await apiClient.get(`/users/all-soft-remove/${role}`);
    return response.data;
  }

  public async findOne(id: string): Promise<IApiResponse<IUser>> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }

  public async findOneSoftRemoved(id: string): Promise<IApiResponse<IUser>> {
    const response = await apiClient.get(`/users/soft-remove/${id}`);
    return response.data;
  }

  public async findOneWithCredentials(id: string): Promise<IApiResponse<IUser>> {
    const response = await apiClient.get(`/users/credential/${id}`);
    return response.data;
  }

  // Common services
  // Get()
  public async findWithProfile(id: string, type: TUserRole): Promise<IApiResponse<IUser>> {
    const response = await apiClient.get(`/users/${id}/${type}/profile`);
    return response.data;
  }

  public async findSoftRemovedWithProfile(id: string, type: TUserRole): Promise<IApiResponse<IUser>> {
    const response = await apiClient.get(`/users/${id}/${type}/profile/soft`);
    return response.data;
  }

  // Patch()
  public async update(
    id: string,
    type: TUserRole,
    data: Partial<ICreateProfessionalForm>,
  ): Promise<IApiResponse<IUser>> {
    const payload = this.toProfessionalData(data);

    const response = await apiClient.patch(`/users/${id}/${type}`, payload);
    return response.data;
  }

  public async restore(id: string, type: TUserRole): Promise<IApiResponse<void>> {
    const response = await apiClient.patch(`/users/${id}/${type}/restore`);
    return response.data;
  }

  // Delete()
  public async remove(id: string, type: TUserRole): Promise<IApiResponse<void>> {
    const response = await apiClient.delete(`/users/${id}/${type}`);
    return response.data;
  }

  public async softRemove(id: string, type: TUserRole): Promise<IApiResponse<void>> {
    const response = await apiClient.delete(`/users/${id}/${type}/soft`);
    return response.data;
  }

  // Check services
  public async checkEmailAvailability(email: string): Promise<IApiResponse<boolean>> {
    const response = await apiClient.get(`/users/check/email/${email}`);
    return response.data;
  }

  public async checkIcAvailability(id: string): Promise<IApiResponse<boolean>> {
    const response = await apiClient.get(`/users/check/ic/${id}`);
    return response.data;
  }

  public async checkUsernameAvailability(username: string): Promise<IApiResponse<boolean>> {
    const response = await apiClient.get(`/users/check/username/${username}`);
    return response.data;
  }

  // Private methods
  private toProfessionalData(data: Partial<ICreateProfessionalForm>) {
    return {
      user: {
        email: data.email,
        firstName: data.firstName,
        ic: data.ic,
        lastName: data.lastName,
        password: data.password,
        phoneNumber: data.phoneNumber,
        userName: data.userName,
      },
      profile: {
        dailyExceptionEnd: data.dailyExceptionEnd || undefined,
        dailyExceptionStart: data.dailyExceptionStart || undefined,
        endHour: data.endHour,
        licenseId: data.licenseId,
        professionalPrefix: data.professionalPrefix,
        slotDuration: data.slotDuration,
        specialty: data.specialty,
        startHour: data.startHour,
        workingDays: data.workingDays,
      },
    };
  }

  private toPatientData(data: Partial<ICreatePatientForm>) {
    return {
      user: {
        email: data.email,
        firstName: data.firstName,
        ic: data.ic,
        lastName: data.lastName,
        password: data.password,
        phoneNumber: data.phoneNumber,
        userName: data.userName,
      },
      profile: {
        birthDay: data.birthDay ? format(parse(data.birthDay, "dd/MM/yyyy", new Date()), "yyyy-MM-dd") : undefined,
        bloodType: data.bloodType,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
      },
    };
  }
}

export const UsersService = UsersModuleService.getInstance();
