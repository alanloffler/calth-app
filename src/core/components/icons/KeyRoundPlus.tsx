import type { SVGProps } from "react";

import { cn } from "@core/lib/utils";

interface IProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function KeyRoundPlus({ className }: IProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-key-round-icon lucide-key-round", className)}
    >
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />

      <g>
        <line x1="18.5" y1="17.5" x2="18.5" y2="25.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15.5" y1="20.5" x2="21.5" y2="20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
