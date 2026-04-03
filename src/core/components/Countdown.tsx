import { useEffect, useState } from "react";

interface IProps {
  callback?: () => void;
  seconds: number;
}

export function Countdown({ callback, seconds }: IProps) {
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

  return <div>{count}</div>;
}
