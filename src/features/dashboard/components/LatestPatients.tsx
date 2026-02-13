import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Link } from "react-router";
import { Loader } from "@components/Loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import type { IUser } from "@users/interfaces/user.interface";
import { UsersService } from "@users/services/users.service";
import { cn } from "@lib/utils";
import { useTryCatch } from "@core/hooks/useTryCatch";

interface IProps {
  className?: string;
}

export function LatestPatients({ className }: IProps) {
  const [patients, setPatients] = useState<IUser[]>();
  const { isLoading, tryCatch } = useTryCatch();
  const navigate = useNavigate();

  const getLatestEvents = useCallback(async () => {
    const [response, error] = await tryCatch(UsersService.findLatestPatients(5));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200) {
      setPatients(response.data);
    }
  }, [tryCatch]);

  useEffect(() => {
    getLatestEvents();
  }, [getLatestEvents]);

  return (
    <Card className={cn("relative gap-4 px-6", className)}>
      <h2 className="font-semibold">Últimos pacientes</h2>
      {isLoading ? (
        <Loader absolute size={20} text="Cargando pacientes" />
      ) : (
        <>
          <Table>
            <TableHeader className="dark:bg-primary-foreground bg-neutral-100">
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients?.map((patient) => (
                <TableRow
                  className="hover:cursor-pointer hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50"
                  key={patient.id}
                  onClick={() => navigate(`/users/view/${patient.id}`, { state: { role: patient.role } })}
                >
                  <TableCell>{format(patient.createdAt, "dd/MM", { locale: es })}</TableCell>
                  <TableCell>{`${patient.firstName} ${patient.lastName}`}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phoneNumber}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="text-foreground justify-end" variant="link" asChild>
            <Link to="/users/role/patient">Ver todos</Link>
          </Button>
        </>
      )}
    </Card>
  );
}
