import { cn } from "@core/lib/utils";

interface IProps {
  className?: string;
  text?: string;
}

export function PageLoader({ className, text = "Cargando" }: IProps) {
  return (
    <div
      className={cn(
        "absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3",
        className,
      )}
    >
      <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent"></div>
      <span className="text-xs font-medium uppercase">{text}</span>
    </div>
  );
}
