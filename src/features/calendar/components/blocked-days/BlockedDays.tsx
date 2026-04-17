import { Calendar1, FilePenLine, Plus, Trash2 } from "lucide-react";

import { Badge } from "@components/Badge";
import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { ConfirmDialog } from "@components/ConfirmDialog";
import { Controller, set } from "react-hook-form";
import { DataTable } from "@components/data-table/DataTable";
import { Field, FieldError } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Protected } from "@auth/components/Protected";
import { SortableHeader } from "@components/data-table/SortableHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

import type { ColumnDef } from "@tanstack/react-table";
import z from "zod";
import { es as esDateFns } from "date-fns/locale";
import { es } from "react-day-picker/locale";
import { format } from "date-fns";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { CalendarService } from "@calendar/services/calendar.service";
import { blockedDaysSchema } from "@calendar/schemas/blocked-days.schema";
import { queryClient } from "@core/lib/query-client";

interface IProps {
  userId: string;
}

export function BlockedDays({ userId }: IProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [openRemoveHardDialog, setOpenRemoveHardDialog] = useState<boolean>(false);
  const [selectedBlockedDay, setSelectedBlockedDay] = useState<{ id: string; date: string; reason: string } | null>(
    null,
  );

  // TODO: handle isLoading on screen
  const { data: blockedDays = [] } = useQuery({
    queryKey: ["blocked-days", userId],
    queryFn: () => CalendarService.findAllBlockedDays(userId),
    select: (response) => response.data,
  });

  const columns: ColumnDef<{ id: string; date: string; reason: string }>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader alignment="center" column={column}>
          ID
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="id">{row.original.id.slice(0, 5)}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <SortableHeader alignment="left" column={column}>
          Fecha
        </SortableHeader>
      ),
      cell: ({ row }) => format(row.original.date, "P", { locale: esDateFns }),
    },
    {
      accessorKey: "reason",
      header: ({ column }) => (
        <SortableHeader alignment="left" column={column}>
          Motivo
        </SortableHeader>
      ),
    },
    {
      id: "actions",
      minSize: 168,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Protected requiredPermission="patient-update">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="hover:text-edit"
                  onClick={() => {
                    console.log(`edit ${row.original.date}`);
                  }}
                  size="icon-sm"
                  variant="outline"
                >
                  <FilePenLine className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar</TooltipContent>
            </Tooltip>
          </Protected>
          <Protected requiredPermission="patient-update">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="hover:text-delete"
                  onClick={() => {
                    setSelectedBlockedDay(row.original);
                    setOpenRemoveHardDialog(true);
                  }}
                  size="icon-sm"
                  variant="outline"
                >
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Eliminar</TooltipContent>
            </Tooltip>
          </Protected>
        </div>
      ),
    },
  ];

  const form = useForm<z.infer<typeof blockedDaysSchema>>({
    resolver: zodResolver(blockedDaysSchema),
    defaultValues: {
      date: undefined,
      reason: "",
      professionalId: userId,
    },
  });

  const { mutate: createBlockedDay, isPending: isSaving } = useMutation({
    mutationKey: ["blocked-days", "create"],
    mutationFn: (data: z.infer<typeof blockedDaysSchema>) => CalendarService.createBlockedDay(data),
    onSuccess: (response) => {
      if (response.statusCode === 201) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["blocked-days", userId] });
        form.reset();
      }
    },
  });

  // TODO: handle isDeleting on button icon
  const { mutate: deleteBlockedDay, isPending: isRemovingHard } = useMutation({
    mutationKey: ["blocked-days", "delete"],
    mutationFn: (id: string) => CalendarService.deleteBlockedDay(id),
    onSuccess: (response) => {
      if (response.statusCode === 200) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["blocked-days", userId] });
      }
    },
    onSettled: () => {
      setSelectedBlockedDay(null);
      setOpenRemoveHardDialog(false);
    },
  });

  return (
    <>
      <section className="flex flex-col gap-6">
        <form
          className="flex items-start gap-4"
          id="create-blocked-day"
          onSubmit={form.handleSubmit((data) => createBlockedDay(data))}
        >
          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="max-w-40" data-invalid={fieldState.invalid}>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      aria-invalid={fieldState.invalid}
                      className="justify-between font-normal"
                      id="date-picker"
                      variant="outline"
                    >
                      {field.value ? (
                        format(field.value, "P", { locale: esDateFns })
                      ) : (
                        <span className="text-muted-foreground">Fecha</span>
                      )}
                      <Calendar1 />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setOpen(false);
                      }}
                      defaultMonth={field.value}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="reason"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="max-w-60" data-invalid={fieldState.invalid}>
                <Input aria-invalid={fieldState.invalid} id="reason" placeholder="Motivo" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <div>
            <Button disabled={isSaving} form="create-blocked-day" size="default" type="submit" variant="outline">
              {isSaving ? <Loader color="black" /> : <Plus />}
              Crear
            </Button>
          </div>
        </form>
        <DataTable
          className="**:data-[slot=table-container]:min-h-75"
          columns={columns}
          data={blockedDays}
          defaultSorting={[{ id: "date", desc: false }]}
          searchable={false}
        />
      </section>
      {selectedBlockedDay && (
        <ConfirmDialog
          title="Eliminar día bloqueado"
          description="¿Seguro que querés eliminar este día bloqueado?"
          alertMessage="El día bloqueado relacionado al profesional, será eliminado de la base de datos. Esta acción es irreversible."
          callback={() => selectedBlockedDay && deleteBlockedDay(selectedBlockedDay.id)}
          loader={isRemovingHard}
          open={openRemoveHardDialog}
          setOpen={setOpenRemoveHardDialog}
          showAlert
          variant="destructive"
        >
          <ul className="flex flex-col gap-1">
            <li className="flex items-center gap-2">
              <span className="font-semibold">Fecha:</span>
              {format(selectedBlockedDay.date, "dd/MM/yyyy", { locale: es })}
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold">Motivo:</span>
              {selectedBlockedDay.reason}
            </li>
          </ul>
        </ConfirmDialog>
      )}
    </>
  );
}
