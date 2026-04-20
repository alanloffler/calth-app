import { Calendar1 } from "lucide-react";

import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Checkbox } from "@components/ui/checkbox";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Loader } from "@components/Loader";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";

import axios from "axios";
import z from "zod";
import { es as esDateFns } from "date-fns/locale";
import { es } from "react-day-picker/locale";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import type { IApiResponse } from "@core/interfaces/api-response.interface";
import { CalendarService } from "@calendar/services/calendar.service";
import { blockedDaysSchema } from "@calendar/schemas/blocked-days.schema";
import { queryClient } from "@core/lib/query-client";

interface IProps {
  blockedDay: { id: string; date: string; reason: string; recurrent: boolean } | null;
  dayId: string;
  professionalId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function EditBlockedDayForm({ blockedDay, dayId, professionalId, setOpen }: IProps) {
  const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);

  const form = useForm<z.infer<typeof blockedDaysSchema>>({
    resolver: zodResolver(blockedDaysSchema),
    defaultValues: {
      date: blockedDay ? new Date(blockedDay.date) : undefined,
      reason: blockedDay?.reason ?? "",
      professionalId,
      recurrent: blockedDay?.recurrent ?? false,
    },
  });

  // Keep the form in sync with the incoming `blockedDay` prop.
  // When the prop changes (for example, when opening the edit dialog for a different day),
  // reset the form values so the UI correctly reflects the current item being edited.
  useEffect(() => {
    form.reset({
      date: blockedDay ? new Date(blockedDay.date) : undefined,
      reason: blockedDay?.reason ?? "",
      professionalId,
      recurrent: blockedDay?.recurrent ?? false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockedDay, professionalId]);

  const { mutate: updateBlockedDay, isPending: isUpdating } = useMutation({
    mutationKey: ["blocked-days", blockedDay?.id],
    mutationFn: (data: z.infer<typeof blockedDaysSchema>) => CalendarService.updateBlockedDay(dayId, data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["blocked-days", professionalId] });
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      if (axios.isAxiosError<IApiResponse>(error)) {
        if (error.response?.status !== 409) {
          setOpen(false);
        }
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex items-start gap-4"
        id="update-blocked-day"
        onSubmit={form.handleSubmit((data) => updateBlockedDay(data))}
      >
        <div className="flex flex-row gap-6">
          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="max-w-40" data-invalid={fieldState.invalid}>
                <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
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
                        setOpenDatePicker(false);
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
              <Field className="" data-invalid={fieldState.invalid}>
                <Input aria-invalid={fieldState.invalid} id="reason" placeholder="Motivo" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="recurrent"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                className="my-auto flex w-fit flex-row items-center justify-center gap-2"
                data-invalid={fieldState.invalid}
              >
                <Checkbox
                  className="size-4.5!"
                  aria-invalid={fieldState.invalid}
                  id="recurrent"
                  checked={field.value ?? false}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                <Label className="font-normal" htmlFor="recurrent">
                  Recurrente
                </Label>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </form>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button onClick={() => setOpen(false)} variant="ghost">
          Cancelar
        </Button>
        <Button disabled={isUpdating} form="update-blocked-day" type="submit" variant="warning">
          {isUpdating ? <Loader color="white" text="Guardando" /> : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
