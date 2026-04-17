import { FileClock, FilePenLine, RotateCcw, Trash2 } from "lucide-react";

import { Activity } from "react";
import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { ConfirmDialog } from "@components/dialogs/ConfirmDialog";
import { CreateHistorySheet } from "@medical-history/components/sheets/CreateHistorySheet";
import { CreatedAt } from "@components/CreatedAt";
import { DisplayWorkingDays } from "@components/DisplayWorkingDays";
import { HistoryTable } from "@medical-history/components/HistoryTable";
import { Link } from "react-router";
import { Loader } from "@components/Loader";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@auth/components/Protected";
import { Tooltip } from "@components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

import type { IMedicalHistory } from "@medical-history/interfaces/medical-history.interface";
import type { IUser } from "@users/interfaces/user.interface";
import type { TPermission } from "@permissions/interfaces/permission.type";
import { ERoles } from "@auth/enums/role.enum";
import { EUserRole } from "@roles/enums/user-role.enum";
import { GENDERS } from "@core/constants/genders.constant";
import { MedicalHistoryService } from "@medical-history/services/medical-history.service";
import { UsersService } from "@users/services/users.service";
import { formatIc } from "@core/formatters/ic.formatter";
import { useAuthStore } from "@auth/stores/auth.store";
import { usePermission } from "@permissions/hooks/usePermission";
import { useTryCatch } from "@core/hooks/useTryCatch";

// TODO: get from settings store, need db changes
const LOCALE = "es";

export default function ViewUser() {
  const [medicalHistory, setMedicalHistory] = useState<IMedicalHistory[] | undefined>();
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const [openRemoveHardDialog, setOpenRemoveHardDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | undefined>(undefined);
  const adminAuth = useAuthStore((state) => state.admin);
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = location.state.role;
  const { id } = useParams();
  const { isLoading: isLoadingMedicalHistory, tryCatch: tryCatchMedicalHistory } = useTryCatch();
  const { isLoading: isLoadingUser, tryCatch: tryCatchUser } = useTryCatch();
  const { isLoading: isRemoving, tryCatch: tryCatchRemove } = useTryCatch();
  const { isLoading: isRemovingHard, tryCatch: tryCatchRemoveHard } = useTryCatch();
  const { isLoading: isRestoring, tryCatch: tryCatchRestore } = useTryCatch();

  const hasPermissions = usePermission(
    [
      `${userRole.value}-delete`,
      `${userRole.value}-delete-hard`,
      `${userRole.value}-restore`,
      `${userRole.value}-update`,
    ] as TPermission[],
    "some",
  );

  const getMedicalHistory = useCallback(
    async function (id: string): Promise<void> {
      const isSuperAdmin = adminAuth?.role.value === ERoles.super;
      const serviceByRole = isSuperAdmin
        ? MedicalHistoryService.findAllByPatientRemoved(id)
        : MedicalHistoryService.findAllByPatient(id);

      const [response, error] = await tryCatchMedicalHistory(serviceByRole);

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response && response.statusCode === 200) {
        setMedicalHistory(response.data);
      }
    },
    [adminAuth?.role.value, tryCatchMedicalHistory],
  );

  const findOneUser = useCallback(
    async function (id: string) {
      const isSuperAdmin = adminAuth?.role.value === ERoles.super;
      const serviceByRole = isSuperAdmin
        ? UsersService.findSoftRemovedWithProfile(id, userRole.value)
        : UsersService.findWithProfile(id, userRole.value);

      const [response, responseError] = await tryCatchUser(serviceByRole);

      if (responseError) {
        toast.error(responseError.message);
        return;
      }

      if (response && response.statusCode === 200) {
        setUser(response.data);
        if (response.data) getMedicalHistory(response.data.id);
      }
    },
    [adminAuth?.role.value, getMedicalHistory, tryCatchUser, userRole.value],
  );

  async function removeUser(id: string): Promise<void> {
    const [response, error] = await tryCatchRemove(UsersService.softRemove(id, userRole.value));

    if (error) {
      toast.error(error.message);
      setOpenRemoveDialog(false);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      findOneUser(id);
      setOpenRemoveDialog(false);
    }
  }

  async function hardRemoveUser(id: string): Promise<void> {
    const [response, error] = await tryCatchRemoveHard(UsersService.remove(id, userRole.value));

    if (error) {
      if (error.status === 409) {
        toast.warning(error.message);
        setOpenRemoveHardDialog(false);
        return;
      } else {
        toast.error(error.message);
        setOpenRemoveHardDialog(false);
        return;
      }
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      navigate(-1);
    }
  }

  async function restoreUser(id: string) {
    const [response, error] = await tryCatchRestore(UsersService.restore(id, userRole.value));

    if (error) {
      toast.error(error.message);
      setOpenRestoreDialog(false);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      findOneUser(id);
      setOpenRestoreDialog(false);
    }
  }

  useEffect(() => {
    findOneUser(id!);
  }, [id, findOneUser]);

  if (!user) return null;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <PageHeader title={`Detalles del ${userRole.name.toLowerCase()}`} />
        <Card className="w-full p-6 text-center md:w-[80%] lg:w-[60%] xl:w-[50%]">
          {isLoadingUser ? (
            <div className="flex justify-center">
              <Loader size={20} text={`Cargando ${userRole.name.toLowerCase()}`} />
            </div>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-xl">
                  <Activity mode={user.role.value === EUserRole["professional"] ? "visible" : "hidden"}>
                    {`${user.professionalProfile?.professionalPrefix ?? ""} `}
                  </Activity>
                  {`${user.firstName} ${user.lastName}`}
                </CardTitle>
                <CardDescription className="text-base">{user.role?.name}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-8 px-0">
                <div className="columns-1 space-y-6 space-x-6 md:columns-2">
                  <div className="flex break-inside-avoid flex-col items-start gap-3">
                    <h2 className="text-muted-foreground w-full border-b text-start text-base font-medium">
                      Datos personales
                    </h2>
                    <ul className="flex flex-col gap-2 text-sm">
                      <li className="flex justify-start gap-2">
                        <span className="font-semibold">Nombre:</span>
                        <span>{user.firstName}</span>
                      </li>
                      <li className="flex justify-start gap-2">
                        <span className="font-semibold">Apellido:</span>
                        <span>{user.lastName}</span>
                      </li>
                      <li className="flex justify-start gap-2">
                        <span className="font-semibold">Usuario:</span>
                        <span>{user.userName}</span>
                      </li>
                      <li className="flex justify-start gap-2">
                        <span className="font-semibold">DNI:</span>
                        <span>{user.ic}</span>
                      </li>
                      {user.role.value === EUserRole["patient"] && user.patientProfile?.birthDay && (
                        <li className="flex flex-wrap justify-start gap-2">
                          <span className="shrink-0 font-semibold">Fecha de nacimiento:</span>
                          <span className="break-all">
                            {format(user.patientProfile?.birthDay, "P", { locale: es })}
                          </span>
                        </li>
                      )}
                      {user.role.value === EUserRole["patient"] && (
                        <li className="flex flex-wrap justify-start gap-2">
                          <span className="shrink-0 font-semibold">Género:</span>
                          <span className="break-all">
                            {GENDERS[LOCALE].find((g) => g.value === user.patientProfile?.gender)?.label}
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <Activity mode={user.role.value === EUserRole["patient"] ? "visible" : "hidden"}>
                    <div className="flex break-inside-avoid flex-col items-start gap-3">
                      <h2 className="text-muted-foreground w-full border-b text-start text-base font-medium">
                        Datos médicos
                      </h2>
                      <ul className="flex flex-col gap-2 text-sm">
                        <li className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">Tipo de sangre:</span>
                          <span>{user.patientProfile?.bloodType}</span>
                        </li>
                        <li className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">Peso:</span>
                          <span>{`${user.patientProfile?.weight} kgs.`}</span>
                        </li>
                        <li className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">Altura:</span>
                          <span>{`${user.patientProfile?.height} cms.`}</span>
                        </li>
                      </ul>
                    </div>
                  </Activity>
                  <Activity mode={user.role.value === EUserRole["professional"] ? "visible" : "hidden"}>
                    <div className="flex break-inside-avoid flex-col items-start gap-3">
                      <h2 className="text-muted-foreground w-full border-b text-start text-base font-medium">
                        Datos profesionales
                      </h2>
                      <ul className="flex flex-col gap-2 text-sm">
                        <li className="flex justify-start gap-2">
                          <span className="font-semibold">Nº de matrícula:</span>
                          <span>{user.professionalProfile?.licenseId}</span>
                        </li>
                        <li className="flex justify-start gap-2">
                          <span className="font-semibold">Especialidad:</span>
                          <span>{user.professionalProfile?.specialty}</span>
                        </li>
                      </ul>
                    </div>
                  </Activity>
                  <div className="flex break-inside-avoid flex-col items-start gap-3">
                    <h2 className="text-muted-foreground w-full border-b text-start text-base font-medium">
                      Medios de contacto
                    </h2>
                    <ul className="flex flex-col gap-2 text-sm">
                      <li className="flex justify-start gap-2">
                        <span className="font-semibold">E-mail:</span>
                        <span>{user.email}</span>
                      </li>
                      <li className="flex justify-start gap-2">
                        <span className="font-semibold">Teléfono:</span>
                        <span>{user.phoneNumber}</span>
                      </li>
                      {user.role.value === EUserRole["patient"] && (
                        <li className="flex flex-wrap justify-start gap-2">
                          <span className="shrink-0 text-start font-semibold">Contacto de emergencia:</span>
                          <span className="break-all">{user.patientProfile?.emergencyContactName}</span>
                        </li>
                      )}
                      {user.role.value === EUserRole["patient"] && (
                        <li className="flex flex-wrap justify-start gap-2">
                          <span className="shrink-0 text-start font-semibold">Teléfono de emergencia:</span>
                          <span className="break-all">{user.patientProfile?.emergencyContactPhone}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <Activity
                    mode={
                      user.role.value === EUserRole["professional"] && user.professionalProfile ? "visible" : "hidden"
                    }
                  >
                    <div className="flex break-inside-avoid flex-col items-start gap-3">
                      <h2 className="text-muted-foreground w-full border-b text-start text-base font-medium">
                        Configuración de la agenda
                      </h2>
                      <ul className="flex flex-col gap-2 text-sm">
                        <li className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">Días laborales:</span>
                          <DisplayWorkingDays days={user.professionalProfile?.workingDays} />
                        </li>
                        <li className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">Horario:</span>
                          {user.professionalProfile?.dailyExceptionStart && user.professionalProfile?.dailyExceptionEnd
                            ? `${user.professionalProfile?.startHour} - ${user.professionalProfile?.dailyExceptionStart} / ${user.professionalProfile?.dailyExceptionEnd} - ${user.professionalProfile?.endHour} hs.`
                            : `${user.professionalProfile?.startHour} - ${user.professionalProfile?.endHour} hs.`}
                        </li>
                        <li className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">Duración del turno:</span>
                          <span>{user.professionalProfile?.slotDuration} min.</span>
                        </li>
                      </ul>
                    </div>
                  </Activity>
                </div>
                <CreatedAt>
                  {`${user.role.name} creado el ${user && format(user.createdAt, "dd/MM/yyyy", { locale: es })}`}
                </CreatedAt>
              </CardContent>
              <Activity mode={hasPermissions ? "visible" : "hidden"}>
                <CardFooter className="px-0">
                  {user?.deletedAt && user?.deletedAt !== null ? (
                    <div className="flex w-full items-center justify-between">
                      <Badge size="small" variant="red">
                        Eliminado
                      </Badge>
                      <Protected requiredPermission={`${userRole.value}-restore` as TPermission}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="hover:text-restore"
                              onClick={() => setOpenRestoreDialog(true)}
                              size="icon-sm"
                              variant="outline"
                            >
                              <RotateCcw />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Restaurar</TooltipContent>
                        </Tooltip>
                      </Protected>
                    </div>
                  ) : (
                    <div className="flex w-full items-center justify-between">
                      {userRole.value === EUserRole["patient"] ? (
                        <div className="flex items-center gap-3">
                          <Protected requiredPermission={"medical_history-create" as TPermission}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="hover:text-history"
                                  onClick={() => setOpenSheet(true)}
                                  size="icon-sm"
                                  variant="outline"
                                >
                                  <FileClock />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Agregar historia médica</TooltipContent>
                            </Tooltip>
                          </Protected>
                        </div>
                      ) : (
                        <div></div>
                      )}
                      <div className="flex items-center gap-3">
                        <Protected requiredPermission={`${userRole.value}-update` as TPermission}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button className="hover:text-edit" size="icon-sm" variant="outline" asChild>
                                <Link to={`/users/edit/${id}`} state={{ role: userRole.value }}>
                                  <FilePenLine />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                        </Protected>
                        <Protected requiredPermission={`${userRole.value}-delete` as TPermission}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                className="hover:text-delete"
                                onClick={() => setOpenRemoveDialog(true)}
                                size="icon-sm"
                                variant="outline"
                              >
                                <Trash2 />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
                          </Tooltip>
                        </Protected>
                        <Protected requiredPermission={`${userRole.value}-delete-hard` as TPermission}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                className="hover:text-delete gap-0"
                                onClick={() => setOpenRemoveHardDialog(true)}
                                size="icon-sm"
                                variant="outline"
                              >
                                <Trash2 />
                                <span>!</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar permanente</TooltipContent>
                          </Tooltip>
                        </Protected>
                      </div>
                    </div>
                  )}
                </CardFooter>
              </Activity>
            </>
          )}
        </Card>
      </div>
      <Protected requiredPermission={`medical_history-view` as TPermission}>
        {userRole.value === EUserRole["patient"] && (
          <div className="flex flex-col gap-3">
            <PageHeader title={`Historial médico de ${user.firstName} ${user.lastName}`} />
            <HistoryTable
              history={medicalHistory}
              isLoading={isLoadingMedicalHistory}
              onUpdated={() => getMedicalHistory(user.id)}
            />
          </div>
        )}
      </Protected>
      <ConfirmDialog
        title="Eliminar paciente"
        description="¿Seguro que querés eliminar a este paciente?"
        callback={() => id && removeUser(id)}
        loader={isRemoving}
        open={openRemoveDialog}
        setOpen={setOpenRemoveDialog}
        variant="destructive"
      >
        <ul>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Nombre:</span>
            {`${user.firstName} ${user.lastName}`}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">DNI:</span>
            {formatIc(user.ic)}
          </li>
        </ul>
      </ConfirmDialog>
      <ConfirmDialog
        title="Restaurar paciente"
        description="¿Seguro que querés restaurar a este paciente?"
        callback={() => id && restoreUser(user.id)}
        loader={isRestoring}
        open={openRestoreDialog}
        setOpen={setOpenRestoreDialog}
        variant="warning"
      >
        <ul>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Nombre:</span>
            {`${user.firstName} ${user.lastName}`}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">DNI:</span>
            {user && formatIc(user.ic)}
          </li>
        </ul>
      </ConfirmDialog>
      <ConfirmDialog
        title="Eliminar paciente"
        description="¿Seguro que querés eliminar a este paciente?"
        alertMessage="Todos los turnos y el historial médico relacionados al paciente, serán eliminados de la base de datos. Esta acción es irreversible."
        callback={() => id && hardRemoveUser(id)}
        loader={isRemovingHard}
        open={openRemoveHardDialog}
        setOpen={setOpenRemoveHardDialog}
        showAlert
        variant="destructive"
      >
        <ul className="flex flex-col gap-1">
          <li className="flex items-center gap-2">
            <span className="font-semibold">Nombre completo:</span>
            {`${user.firstName} ${user.lastName}`}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">DNI:</span>
            {formatIc(user.ic)}
          </li>
        </ul>
      </ConfirmDialog>
      <CreateHistorySheet
        user={user}
        onCreated={() => getMedicalHistory(user.id)}
        open={openSheet}
        setOpen={setOpenSheet}
      />
    </section>
  );
}
