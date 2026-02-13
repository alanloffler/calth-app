import { cn } from "@lib/utils";
import { useTheme } from "@core/providers/theme-provider";

interface IProps {
  absolute?: boolean;
  className?: string;
  color?: string;
  size?: number;
  spinnerSize?: number;
  text?: string;
}

export function Loader({ absolute, className, color, size = 16, spinnerSize = 2, text }: IProps) {
  const { theme } = useTheme();

  const borderColor = color || (theme === "dark" ? "white" : "black");

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        className,
        absolute && "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
      )}
    >
      <div
        className="animate-spin rounded-full"
        style={{
          borderColor: borderColor,
          borderTopColor: "transparent",
          borderWidth: spinnerSize + "px",
          height: size + "px",
          width: size + "px",
        }}
      ></div>
      {text && <span>{text}</span>}
    </div>
  );
}
