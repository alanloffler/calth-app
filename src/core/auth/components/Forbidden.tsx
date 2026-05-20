import type { ReactNode } from "react";

import type { EUserRole } from "@roles/enums/user-role.enum";
import { useAuthStore } from "@auth/stores/auth.store";

type TEUserRole = (typeof EUserRole)[keyof typeof EUserRole];
type TVariant = "disabled" | "invisible";

interface IProps {
  children: ReactNode;
  to: TEUserRole[];
  variant?: TVariant;
}

export function Forbidden({ children, to, variant = "disabled" }: IProps) {
  const admin = useAuthStore((state) => state.admin);

  if (admin && to.includes(admin.role.value as TEUserRole)) {
    if (variant === "disabled") {
      return <div className="pointer-events-none cursor-pointer opacity-50">{children}</div>;
    }

    return;
  }

  return <>{children}</>;
}
