import { useEffect, useState } from "react";

import { cn } from "@core/lib/utils";

interface IProps {
  callback?: () => void;
  className?: string;
  seconds: number;
}

export function Countdown({ callback, className, seconds }: IProps) {
  const [count, setCount] = useState<number>(seconds);

  useEffect(() => {
    if (count === 0 && callback) callback();

    if (count > 0) {
      const timer = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [count, callback]);

  return (
    <div
      className={cn(
        "text-background aspect-square rounded-sm bg-gray-400 p-1 text-center text-xl font-semibold",
        className,
      )}
    >
      {count}
    </div>
  );
}
