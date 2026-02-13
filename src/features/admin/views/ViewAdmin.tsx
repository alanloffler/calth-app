import { FilePenLine, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@components/ui/button";
import { Badge } from "@components/Badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { CreatedAt } from "@components/CreatedAt";
import { HoldButton } from "@components/ui/HoldButton";
import { Link } from "react-router";
import { Loader } from "@components/Loader";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@auth/components/Protected";

import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Activity, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import type { IAdmin } from "@admin/interfaces/admin.interface";
import { AdminService } from "@admin/services/admin.service";
import { ERoles } from "@auth/enums/role.enum";
import { tryCatch } from "@core/utils/try-catch";
import { useAuthStore } from "@auth/stores/auth.store";
import { usePermission } from "@permissions/hooks/usePermission";
import { useTryCatch } from "@core/hooks/useTryCatch";

export default function ViewAdmin() {
  const [admin, setAdmin] = useState<IAdmin | undefined>(undefined);
  const adminAuth = useAuthStore((state) => state.admin);
  const hasPermissions = usePermission(["admin-delete", "admin-delete-hard", "admin-restore", "admin-update"], "some");
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoading: isLoadingAdmin, tryCatch: tryCatchAdmin } = useTryCatch();

  const findOneAdmin = useCallback(
    async function (id: string) {
      const isSuperAdmin = adminAuth?.role.value === ERoles.super;
      const serviceByRole = isSuperAdmin ? AdminService.findOneSoftRemoved(id) : AdminService.findOne(id);

      const [response, responseError] = await tryCatchAdmin(serviceByRole);

      if (responseError) {
        toast.error(responseError.message);
        return;
      }

      if (response && response.statusCode === 200) {
        setAdmin(response.data);
      }
    },
    [adminAuth?.role.value, tryCatchAdmin],
  );

  async function removeAdmin(id: string): Promise<void> {
    const [response, error] = await tryCatch(AdminService.softRemove(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      findOneAdmin(id);
    }
  }

  async function hardRemoveAdmin(id: string): Promise<void> {
    const [response, error] = await tryCatch(AdminService.remove(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      navigate(-1);
    }
  }

  async function restoreAdmin(id: string) {
    const [response, error] = await tryCatch(AdminService.restore(id));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      findOneAdmin(id);
    }
  }

  useEffect(() => {
    findOneAdmin(id!);
  }, [id, findOneAdmin]);

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Detalles del administrador" />
      <Card className="w-full p-6 text-center md:max-w-100 md:p-10">
        {isLoadingAdmin ? (
          <div className="flex justify-center">
            <Loader size={20} text="Cargando administrador" />
          </div>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-xl">{`${admin?.firstName} ${admin?.lastName}`}</CardTitle>
              <CardDescription className="text-base">{admin?.role.name}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 px-0">
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="font-semibold">Usuario</span>
                  <span>{admin?.userName}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold">DNI</span>
                  <span>{admin?.ic}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold">E-mail</span>
                  <span>{admin?.email}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold">Teléfono</span>
                  <span>{admin?.phoneNumber}</span>
                </li>
              </ul>
              <CreatedAt>{`Administrador desde el ${admin && new Date(admin.createdAt.split("T")[0]).toLocaleDateString()}`}</CreatedAt>
            </CardContent>
            <Activity mode={hasPermissions ? "visible" : "hidden"}>
              <CardFooter className="justify-end gap-3 px-0">
                {admin?.deletedAt && admin?.deletedAt !== null ? (
                  <div className="flex w-full items-center justify-between">
                    <Badge size="small" variant="red">
                      Eliminado
                    </Badge>
                    <Protected requiredPermission="admin-restore">
                      <HoldButton callback={() => id && restoreAdmin(id)} size="icon" type="restore" variant="outline">
                        <RotateCcw className="h-4 w-4" />
                      </HoldButton>
                    </Protected>
                  </div>
                ) : (
                  <>
                    <Protected requiredPermission="admin-update">
                      <Button className="px-5! hover:text-green-500" variant="outline" asChild>
                        <Link to={`/admin/edit/${id}`}>
                          <FilePenLine className="h-4 w-4" />
                        </Link>
                      </Button>
                    </Protected>
                    <Protected requiredPermission="admin-delete">
                      <HoldButton callback={() => id && removeAdmin(id)} size="icon" type="delete" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </HoldButton>
                    </Protected>
                    <Protected requiredPermission="admin-delete-hard">
                      <HoldButton
                        callback={() => id && hardRemoveAdmin(id)}
                        size="icon"
                        type="hard-delete"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>!</span>
                      </HoldButton>
                    </Protected>
                  </>
                )}
              </CardFooter>
            </Activity>
          </>
        )}
      </Card>
    </section>
  );
}
