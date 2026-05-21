import { Button } from "@components/ui/button";

import { useNavigate } from "react-router";

export function RescheduleNotification() {
  const navigate = useNavigate();

  function handleReschedule(): void {
    navigate("/events?needsReschedule=true");
  }

  return (
    <div className="flex flex-col rounded-md border bg-white p-2 text-sm">
      <h3 className="flex items-center gap-2 font-semibold text-yellow-600">
        <div className="flex size-6 items-center justify-center rounded-full border border-yellow-400 bg-yellow-300 text-lg font-bold text-yellow-600">
          !
        </div>
        Acción requerida
      </h3>
      <span className="">Tenés que reasignar turnos</span>
      <Button className="mt-3 w-fit place-self-center" onClick={handleReschedule} size="sm" variant="default">
        Reasignar
      </Button>
    </div>
  );
}
