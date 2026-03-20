import { Activity } from "react";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";

import { useState } from "react";

export function ChooseRecurringDate() {
  const [display, setDisplay] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Checkbox id="recurring" name="recurring" onCheckedChange={() => setDisplay(!display)} />
        <FieldLabel htmlFor="recurring">Recurrente</FieldLabel>
      </div>
      <Activity mode={display ? "visible" : "hidden"}>
        <div className="flex items-center gap-3">
          <Input className="max-w-25" placeholder="Dias" type="number" />
          <Button type="button" size="sm" variant="secondary">
            Comprobar disponibilidad
          </Button>
        </div>
      </Activity>
    </div>
  );
}
