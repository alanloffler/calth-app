import { Ban, FilePenLine, FileText, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { ConfirmDialog } from "@components/ConfirmDialog";
import { DataTable } from "@components/data-table/DataTable";
import { Link } from "react-router";
import { PageHeader } from "@components/pages/PageHeader";
import { Protected } from "@auth/components/Protected";
import { SortableHeader } from "@components/data-table/SortableHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import type { IUser } from "@users/interfaces/user.interface";
import type { TPermission } from "@permissions/interfaces/permission.type";
import type { TUserRole } from "@roles/interfaces/user-role.type";
import { ERolePlural } from "@roles/enums/role-plural.enum";
import { ERoles } from "@auth/enums/role.enum";
import { UsersService } from "@users/services/users.service";
import { UsersTableConfig } from "@core/config/table.config";
import { formatIc } from "@core/formatters/ic.formatter";
import { uppercaseFirst } from "@core/formatters/uppercase-first.formatter";
import { useAuthStore } from "@auth/stores/auth.store";
import { useSidebar } from "@components/ui/sidebar";
import { useTryCatch } from "@core/hooks/useTryCatch";

export default function Users() {
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean> | undefined>(undefined);
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const [openRemoveHardDialog, setOpenRemoveHardDialog] = useState<boolean>(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IUser | undefined>(undefined);
  const [users, setUsers] = useState<IUser[] | undefined>(undefined);
  const admin = useAuthStore((state) => state.admin);
  const { isLoading: isLoadingUsers, tryCatch: tryCatchAdmins } = useTryCatch();
  const { isLoading: isRemoving, tryCatch: tryCatchRemove } = useTryCatch();
  const { isLoading: isRemovingHard, tryCatch: tryCatchRemoveHard } = useTryCatch();
  const { isLoading: isRestoring, tryCatch: tryCatchRestore } = useTryCatch();
  const { open: sidebarIsOpen } = useSidebar();
  const { role } = useParams();

  const fetchUsers = useCallback(async () => {
    const $role = role ? role : "";
    const isSuperAdmin = admin?.role.value === ERoles.super;
    const serviceByRole = isSuperAdmin ? UsersService.findAllSoftRemoved($role) : UsersService.findAll($role);

    const [response, error] = await tryCatchAdmins(serviceByRole);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      setUsers(response.data);
    }
  }, [admin?.role.value, role, tryCatchAdmins]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function removeUser(id: string): Promise<void> {
    const [response, error] = await tryCatchRemove(UsersService.softRemove(id, role as TUserRole));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      fetchUsers();
    }
  }

  async function restoreUser(id: string) {
    const [response, error] = await tryCatchRestore(UsersService.restore(id, role as TUserRole));

    if (error) {
      toast.error(error.message);

      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      fetchUsers();
    }
  }

  async function hardRemoveUser(id: string): Promise<void> {
    console.log("remove hard");
    const [response, error] = await tryCatchRemoveHard(UsersService.remove(id, role as TUserRole));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      fetchUsers();
    }
  }

  useEffect(() => {
    function getColumnVisibility(width: number): Record<string, boolean> | undefined {
      if (width < 768) {
        return { id: false, ic: false, firstName: false, lastName: false, userName: false };
      }

      if (width < 1280) {
        return {
          id: !sidebarIsOpen,
          firstName: false,
          lastName: false,
          userName: !sidebarIsOpen,
        };
      }

      return undefined;
    }

    function handleResize() {
      setColumnVisibility(getColumnVisibility(window.innerWidth));
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarIsOpen]);

  const columns: ColumnDef<IUser>[] = [
    {
      accessorKey: "id",
      enableHiding: true,
      enableSorting: false,
      header: () => <div className="text-center">ID</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge size="small" variant="id">
            {row.original?.id?.slice(0, 5)}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "ic",
      enableHiding: true,
      header: ({ column }) => (
        <SortableHeader alignment="center" column={column}>
          DNI
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge size="small" variant="ic">
            {formatIc(row.original.ic)}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "userName",
      enableHiding: true,
      header: ({ column }) => <SortableHeader column={column}>Usuario</SortableHeader>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <SortableHeader column={column}>Email</SortableHeader>,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span>{row.original.email}</span>
          {row.original.deletedAt && <Ban className="h-4 w-4 text-rose-500" />}
        </div>
      ),
    },
    {
      accessorKey: "firstName",
      enableHiding: true,
      header: ({ column }) => <SortableHeader column={column}>Nombre</SortableHeader>,
    },
    {
      accessorKey: "lastName",
      enableHiding: true,
      header: ({ column }) => <SortableHeader column={column}>Apellido</SortableHeader>,
    },
    {
      accessorKey: "role.name",
      header: ({ column }) => (
        <SortableHeader alignment="center" column={column}>
          Rol
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge size="small" variant="role">
            {row.original.role?.name}
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      minSize: 168,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="hover:text-view" size="icon-sm" variant="outline" asChild>
                <Link to={`/users/view/${row.original.id}`} state={{ role: row.original.role }}>
                  <FileText />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver detalles</TooltipContent>
          </Tooltip>
          {!row.original.deletedAt && (
            <Protected requiredPermission={`${role}-update` as TPermission}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="hover:text-edit" size="icon-sm" variant="outline" asChild>
                    <Link to={`/users/edit/${row.original.id}`} state={{ role: row.original.role.value }}>
                      <FilePenLine />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
            </Protected>
          )}
          {row.original.deletedAt && true ? (
            <Protected requiredPermission={`${role}-restore` as TPermission}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="hover:text-restore"
                    onClick={() => {
                      setSelectedUser(row.original);
                      setOpenRestoreDialog(true);
                    }}
                    size="icon-sm"
                    variant="outline"
                  >
                    <RotateCcw />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restaurar</TooltipContent>
              </Tooltip>
            </Protected>
          ) : (
            <>
              <Protected requiredPermission={`${role}-delete` as TPermission}>
                {admin && row.original.ic !== admin.ic && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="hover:text-delete"
                        onClick={() => {
                          setSelectedUser(row.original);
                          setOpenRemoveDialog(true);
                        }}
                        size="icon-sm"
                        variant="outline"
                      >
                        <Trash2 />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Eliminar</TooltipContent>
                  </Tooltip>
                )}
              </Protected>
              <Protected requiredPermission={`${role}-delete-hard` as TPermission}>
                {admin && row.original.ic !== admin.ic && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="hover:text-delete gap-0"
                        onClick={() => {
                          setSelectedUser(row.original);
                          setOpenRemoveHardDialog(true);
                        }}
                        size="icon-sm"
                        variant="outline"
                      >
                        <Trash2 />
                        <span>!</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Eliminar permanente</TooltipContent>
                  </Tooltip>
                )}
              </Protected>
            </>
          )}
        </div>
      ),
    },
  ];

  if (!role) return null;

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title={uppercaseFirst(ERolePlural[role as TUserRole])}
          subtitle={`Gestioná los ${ERolePlural[role as TUserRole]} del sistema`}
        >
          <Protected requiredPermission={["admin-create", "patient-create", "professional-create"]} mode="some">
            <Button variant="default" size="lg" asChild>
              <Link to="/users/create" state={{ role }}>
                <Plus /> Crear {ERoles[role as keyof typeof ERoles]}
              </Link>
            </Button>
          </Protected>
        </PageHeader>
        <DataTable
          columnVisibility={columnVisibility}
          columns={columns}
          data={users}
          defaultPageSize={UsersTableConfig.limit}
          defaultSorting={[{ id: "userName", desc: false }]}
          loading={isLoadingUsers}
          pageSizes={[5, 10, 20, 50]}
        />
      </div>
      <ConfirmDialog
        title="Eliminar paciente"
        description="¿Seguro que querés eliminar a este paciente?"
        callback={() => selectedUser && removeUser(selectedUser.id)}
        loader={isRemoving}
        open={openRemoveDialog}
        setOpen={setOpenRemoveDialog}
        variant="destructive"
      >
        <ul>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Nombre:</span>
            {`${selectedUser?.firstName} ${selectedUser?.lastName}`}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">DNI:</span>
            {selectedUser && formatIc(selectedUser.ic)}
          </li>
        </ul>
      </ConfirmDialog>
      <ConfirmDialog
        title="Restaurar paciente"
        description="¿Seguro que querés restaurar a este paciente?"
        callback={() => selectedUser && restoreUser(selectedUser.id)}
        loader={isRestoring}
        open={openRestoreDialog}
        setOpen={setOpenRestoreDialog}
        variant="warning"
      >
        <ul>
          <li className="flex items-center gap-2">
            <span className="font-semibold">Nombre:</span>
            {`${selectedUser?.firstName} ${selectedUser?.lastName}`}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">DNI:</span>
            {selectedUser && formatIc(selectedUser.ic)}
          </li>
        </ul>
      </ConfirmDialog>
      <ConfirmDialog
        title="Eliminar paciente"
        description="¿Seguro que querés eliminar a este paciente?"
        alertMessage="Todos los turnos y el historial médico relacionados al paciente, serán eliminados de la base de datos. Esta acción es irreversible."
        callback={() => selectedUser && hardRemoveUser(selectedUser.id)}
        loader={isRemovingHard}
        open={openRemoveHardDialog}
        setOpen={setOpenRemoveHardDialog}
        showAlert
        variant="destructive"
      >
        <ul className="flex flex-col gap-1">
          <li className="flex items-center gap-2">
            <span className="font-semibold">Nombre completo:</span>
            {`${selectedUser?.firstName} ${selectedUser?.lastName}`}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">DNI:</span>
            {selectedUser && formatIc(selectedUser.ic)}
          </li>
        </ul>
      </ConfirmDialog>
    </>
  );
}
