import { Calendar1, FilePenLine, Plus, Trash2 } from "lucide-react";

import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Controller } from "react-hook-form";
import { DataTable } from "@components/data-table/DataTable";
import { Field, FieldError } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Protected } from "@auth/components/Protected";
import { SortableHeader } from "@components/data-table/SortableHeader";

import type { ColumnDef } from "@tanstack/react-table";
import z from "zod";
import { es as esDateFns } from "date-fns/locale";
import { es } from "react-day-picker/locale";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { blockedDaysSchema } from "@calendar/schemas/blocked-days.schema";
import { Badge } from "@components/Badge";

interface IProps {
  userId: string;
}

export function BlockedDays({ userId }: IProps) {
  const [open, setOpen] = useState<boolean>(false);

  const blockedDays = [
    { id: "a9vd90fvd9fva98x0c9v9xz", date: "2026-03-06T00:00:00-03:00", reason: "Blocked day 3" },
    { id: "b9vd90fvd9fva98x0c9v9xz", date: "2026-03-07T00:00:00-03:00", reason: "Blocked day 4" },
    { id: "c9vd90fvd9fva98x0c9v9xz", date: "2026-03-08T00:00:00-03:00", reason: "Blocked day 5" },
    { id: "d9vd90fvd9fva98x0c9v9xz", date: "2026-03-09T00:00:00-03:00", reason: "Blocked day 6" },
    { id: "39vd90fvd9fva98x0c9v9xz", date: "2026-03-05T00:00:00-03:00", reason: "Blocked day 2" },
    { id: "f9vd90fvd9fva98x0c9v9xz", date: "2026-03-04T00:00:00-03:00", reason: "Blocked day 1" },
  ];
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
          </Protected>
          <Protected requiredPermission="patient-update">
            <Button
              className="hover:text-delete"
              onClick={() => {
                console.log(`delete ${row.original.date}`);
              }}
              size="icon-sm"
              variant="outline"
            >
              <Trash2 />
            </Button>
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

  function onSubmit(data: z.infer<typeof blockedDaysSchema>) {
    console.log(data);
  }

  return (
    <section className="flex flex-col gap-6">
      <form className="flex items-start gap-4" id="create-blocked-day" onSubmit={form.handleSubmit(onSubmit)}>
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
          <Button form="create-blocked-day" size="default" type="submit" variant="outline">
            <Plus />
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
  );
}
