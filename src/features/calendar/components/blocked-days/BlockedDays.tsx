import { Plus } from "lucide-react";

import { Button } from "@components/ui/button";
import { Controller } from "react-hook-form";
import { DataTable } from "@components/data-table/DataTable";
import { Field, FieldError, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";

import { useForm } from "react-hook-form";

interface IProps {
  userId: string;
}

export function BlockedDays({ userId }: IProps) {
  const blockedDays = [{ date: "2026-01-01", reason: "Blocked day" }];

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
  ];

  const form = useForm({
    defaultValues: {
      date: "",
      reason: "",
    },
  });

  function onSubmit(data: { date: string; reason: string }) {
    console.log(data);
  }

  return (
    <section className="flex flex-col gap-6">
      <form className="flex items-end gap-4" id="create-blocked-day" onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="reason"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="max-w-60" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="reason">Motivo</FieldLabel>
              <Input aria-invalid={fieldState.invalid} id="reason" {...field} />
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
      <DataTable columns={columns} data={blockedDays} searchable={false} />
    </section>
  );
}
