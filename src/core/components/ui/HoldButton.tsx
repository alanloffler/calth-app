import { type MouseEvent, type PointerEvent, type ReactNode, useRef } from "react";
import { cn } from "@core/lib/utils";

interface IProps {
  callback: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  duration?: number;
  shortcut?: boolean;
  size?: "default" | "icon";
  type?: "confirm" | "default" | "delete" | "hard-delete" | "restore";
  variant?: string;
}

export function HoldButton({
  callback,
  children,
  className,
  disabled,
  duration = 1000,
  shortcut = false,
  size = "default",
  type = "default",
  variant = "outline",
}: IProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;

    timeoutRef.current = setTimeout(() => {
      callback();
    }, duration);
  };

  const handlePointerUp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    handlePointerUp();

    if (shortcut) {
      callback();
    }
  };

  return (
    <button
      className={cn(
        "group relative flex items-center justify-center gap-2 overflow-hidden rounded-md bg-[#f6f5f5] px-6 py-3 text-sm font-medium text-[#21201c] transition-all duration-160 ease-out select-none [-webkit-touch-callout:none] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        className,
        variant === "outline" &&
          "bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-accent h-9 border px-4 py-2 shadow-xs has-[>svg]:px-3",
        size === "icon" && "px-5!",
        type === "delete" && "gap-0 hover:text-rose-500 dark:text-white dark:hover:bg-none",
        type === "hard-delete" && "gap-0 text-rose-500 hover:text-rose-500",
        type === "restore" && "hover:text-amber-500 dark:text-white dark:hover:text-amber-500",
      )}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-2 rounded-md transition-[clip-path] duration-160 ease-out [clip-path:inset(0px_100%_0px_0px)] group-active:ease-linear group-active:[clip-path:inset(0px_0px_0px_0px)]",
          size === "icon" && "px-5!",
          type === "confirm" && "bg-sky-200 text-sky-700",
          type === "default" && "bg-gray-200",
          // type === "delete" && "bg-[#ffdbdc] text-[#e5484d]",
          type === "delete" && "gap-0 bg-rose-200 text-rose-700 dark:bg-rose-950/90",
          type === "hard-delete" && "gap-0 bg-rose-500 text-white",
          type === "restore" && "bg-amber-200 text-amber-700",
        )}
        style={{
          transitionDuration: duration + "ms",
        }}
      >
        {children}
      </div>
      {children}
    </button>
  );
}
