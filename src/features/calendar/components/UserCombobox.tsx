import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";

import { useCallback, useEffect, useState } from "react";

import type { IUser } from "@users/interfaces/user.interface";
import { EUserRole } from "@roles/enums/user-role.enum";
import { UsersService } from "@users/services/users.service";
import { cn } from "@lib/utils";
import { useTryCatch } from "@core/hooks/useTryCatch";

interface IProps {
  "aria-invalid"?: boolean;
  defaultSelected?: string;
  id?: string;
  onChange?: (value: string) => void;
  userType?: "patient" | "professional";
  value?: string | null;
  width?: string;
}

export function UserCombobox({
  "aria-invalid": ariaInvalid,
  defaultSelected,
  id,
  onChange,
  userType = "patient",
  value = undefined,
  width,
}: IProps) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<IUser[] | undefined>(undefined);
  const { isLoading, tryCatch } = useTryCatch();

  const findUsers = useCallback(async () => {
    const [response, error] = await tryCatch(UsersService.findAll(userType));

    if (error) {
      setError("Error");
    }

    if (response && response?.statusCode === 200) {
      setUsers(response?.data);
      if (defaultSelected) onChange?.(defaultSelected);
    }
  }, [defaultSelected, tryCatch, userType, onChange]);

  function getSelectedUser(value: string): string {
    const user = users?.find((user) => user.id === value);
    if (!users || !value || !user) return "";

    return userType === EUserRole.professional
      ? `${user.professionalProfile?.professionalPrefix} ${user.firstName} ${user.lastName}`
      : `${user.firstName} ${user.lastName}`;
  }

  useEffect(() => {
    findUsers();
  }, [findUsers]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={cn(width ? width : "w-full")}>
        <Button
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          className={cn(
            "font-normal disabled:opacity-100",
            value || error || isLoading ? "justify-between!" : "justify-end!",
            error || ariaInvalid ? "text-destructive border-destructive" : "",
          )}
          disabled={isLoading || error !== null}
          id={id}
          role="combobox"
          variant="outline"
        >
          {isLoading && "Cargando..."}
          {error && "Error"}
          <span>{value ? getSelectedUser(value) : ""}</span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0", width ? width : "w-full")}
        onTouchMove={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput className="h-9" />
          <CommandList>
            <CommandEmpty>Sin resultados</CommandEmpty>
            <CommandGroup>
              {users?.map((user) => (
                <CommandItem
                  key={user.id}
                  keywords={[user.firstName, user.lastName]}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue;
                    onChange?.(newValue);
                    setOpen(false);
                  }}
                  value={user.id}
                >
                  {userType === EUserRole.professional
                    ? `${user.professionalProfile?.professionalPrefix} ${user.firstName} ${user.lastName}`
                    : `${user.firstName} ${user.lastName}`}
                  <Check className={cn("ml-auto", value === user.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
