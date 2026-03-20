import { Checkbox } from "@components/ui/checkbox";
import { FieldLabel } from "@components/ui/field";
import { Activity, useState } from "react";

export function ChooseRecurringDate() {
  const [display, setDisplay] = useState<boolean>(false);
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3">
        <Checkbox id="recurring" name="recurring" onChange={() => setDisplay(!display)} />
        <FieldLabel htmlFor="recurring">Recurrente</FieldLabel>
      </div>
      <Activity mode={display ? "visible" : "hidden"}>
        <div>Here the form inputs</div>
      </Activity>
    </div>
  );
}
