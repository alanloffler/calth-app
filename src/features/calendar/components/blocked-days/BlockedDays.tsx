import { Calendar1, Plus } from "lucide-react";

import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Controller } from "react-hook-form";
import { DataTable } from "@components/data-table/DataTable";
import { Field, FieldError } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";

import z from "zod";
import { es } from "react-day-picker/locale";
import { es as esDateFns } from "date-fns/locale";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { blockedDaysSchema } from "@calendar/schemas/blocked-days.schema";
import type { ColumnDef } from "@tanstack/react-table";

interface IProps {
  userId: string;
}

export function BlockedDays({ userId }: IProps) {
  const [open, setOpen] = useState<boolean>(false);

  const blockedDays = [
    { date: "2026-03-06T00:00:00-03:00", reason: "Blocked day" },
    { date: "2026-03-06T00:00:00-03:00", reason: "Blocked day" },
    { date: "2026-03-06T00:00:00-03:00", reason: "Blocked day" },
    { date: "2026-03-06T00:00:00-03:00", reason: "Blocked day" },
    { date: "2026-03-06T00:00:00-03:00", reason: "Blocked day" },
    { date: "2026-03-06T00:00:00-03:00", reason: "Blocked day" },
  ];
  const columns: ColumnDef<{ date: string; reason: string }>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(row.original.date, "P", { locale: esDateFns }),
    },
    {
      accessorKey: "reason",
      header: "Reason",
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
        className="**:data-[slot=table-container]:min-h-58"
        columns={columns}
        data={blockedDays}
        searchable={false}
      />
    </section>
  );
}
