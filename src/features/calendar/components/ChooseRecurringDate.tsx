import { Activity, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";

import { useState } from "react";

interface IProps {
  disabled: boolean;
}

export function ChooseRecurringDate({ disabled }: IProps) {
  const [days, setDays] = useState<number>(0);
  const [display, setDisplay] = useState<boolean>(false);

  function handleChecked(checked: boolean) {
    setDisplay(checked);
  }

  function handleCheckAvailability(): void {
    console.log(`Days: ${days}`);
  }

  useEffect(() => {
    if (disabled) handleChecked(false);
  }, [disabled]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={display}
          disabled={disabled}
          id="recurring"
          name="recurring"
          onCheckedChange={() => handleChecked(!display)}
        />
        <FieldLabel htmlFor="recurring">Recurrente</FieldLabel>
      </div>
      <Activity mode={display && !disabled ? "visible" : "hidden"}>
        <div className="flex items-center gap-3">
          <Input
            className="max-w-25"
            onChange={(e) => setDays(Number(e.target.value))}
            placeholder="Dias"
            type="number"
            value={days}
          />
          <Button disabled={days === 0} onClick={handleCheckAvailability} type="button" size="sm" variant="secondary">
            Comprobar disponibilidad
          </Button>
        </div>
      </Activity>
    </div>
  );
}
