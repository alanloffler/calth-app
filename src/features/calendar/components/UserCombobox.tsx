import { Check, ChevronDown } from "lucide-react";

import { Button } from "@components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { EUserRole } from "@roles/enums/user-role.enum";
import { UsersService } from "@users/services/users.service";
import { cn } from "@core/lib/utils";

interface IProps {
  "aria-invalid"?: boolean;
  defaultSelected?: string;
  id?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  userType?: "patient" | "professional";
  value?: string | null;
  width?: string;
}

export function UserCombobox({
  "aria-invalid": ariaInvalid,
  defaultSelected,
  id,
  onChange,
  placeholder,
  userType = "patient",
  value = undefined,
  width,
}: IProps) {
  const [open, setOpen] = useState<boolean>(false);

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", "dropdown", userType],
    queryFn: () => UsersService.findAll(userType),
    select: (response) => response.data,
  });

  useEffect(() => {
    if (defaultSelected) onChange?.(defaultSelected);
  }, [defaultSelected, onChange, users]);

  function getSelectedUser(value: string): string {
    const user = users?.find((user) => user.id === value);
    if (!users || !value || !user) return "";

    return userType === EUserRole.professional
      ? `${user.professionalProfile?.professionalPrefix} ${user.firstName} ${user.lastName}`
      : `${user.firstName} ${user.lastName}`;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={cn(width ? width : "w-full")}>
        <Button
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          className={cn(
            "font-normal disabled:opacity-100",
            value || isError || isLoading || placeholder ? "justify-between!" : "justify-end!",
            isError || ariaInvalid ? "text-destructive border-destructive" : "",
          )}
          disabled={isLoading || isError}
          id={id}
          role="combobox"
          variant="outline"
        >
          {isLoading && "Cargando..."}
          {isError && "Error"}
          <span className="truncate">{value ? getSelectedUser(value) : (placeholder ?? "")}</span>
          <ChevronDown className="opacity-50" />
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
