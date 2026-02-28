import { CreateAdminForm } from "@users/components/CreateAdminForm";
import { CreatePatientForm } from "@users/components/CreatePatientForm";
import { CreateProfessionalForm } from "@users/components/CreateProfessionalForm";

import { useLocation } from "react-router";

import { EUserRole } from "@roles/enums/user-role.enum";

export default function CreateUser() {
  const { state } = useLocation();
  const userRole = state.role;

  return (
    <div className="flex w-full max-w-7xl flex-col gap-10 md:w-full xl:w-[80%]">
      {userRole === EUserRole["admin"] && <CreateAdminForm />}
      {userRole === EUserRole["patient"] && <CreatePatientForm />}
      {userRole === EUserRole["professional"] && <CreateProfessionalForm />}
    </div>
  );
}
