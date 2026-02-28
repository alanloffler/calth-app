import { EditAdminForm } from "@users/components/EditAdminForm";
import { EditPatientForm } from "@users/components/EditPatientForm";
import { EditProfessionalForm } from "@users/components/EditProfessionalForm";

import { useLocation, useParams } from "react-router";

import { EUserRole } from "@roles/enums/user-role.enum";

export default function EditUser() {
  const { state } = useLocation();
  const userRole = state.role;
  const { id } = useParams();

  if (!id) return null;

  return (
    <div className="flex w-full flex-col gap-10 lg:w-[80%] xl:w-[80%]">
      {userRole === EUserRole["admin"] && <EditAdminForm userId={id} />}
      {userRole === EUserRole["patient"] && <EditPatientForm userId={id} />}
      {userRole === EUserRole["professional"] && <EditProfessionalForm userId={id} />}
    </div>
  );
}
