import { NotebookText } from "lucide-react";

import { Separator } from "@components/ui/separator";

interface IProps {
  notes: string;
}

export function HistoryNotes({ notes }: IProps) {
  return (
    <div className="bg-background flex min-h-0 flex-1 flex-col rounded-md border">
      <span className="bg-secondary flex items-center justify-center gap-2 rounded-t-md p-2 text-center font-semibold">
        <NotebookText className="size-4" />
        Notas
      </span>
      <Separator />
      <div className="min-h-0 flex-1 overflow-y-auto p-3" dangerouslySetInnerHTML={{ __html: notes }}></div>
    </div>
  );
}
