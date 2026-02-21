import type { ReactNode } from "react";

import type { TPermission } from "@permissions/interfaces/permission.type";
import { useAuthStore } from "@auth/stores/auth.store";

interface IProps {
  children: ReactNode;
  mode?: "some" | "every";
  requiredPermission?: TPermission | TPermission[];
  variant?: "invisible" | "disabled";
}

export function Protected({ children, mode = "some", requiredPermission, variant = "invisible" }: IProps) {
  const admin = useAuthStore((state) => state.admin);
  const adminPermissions = admin?.role?.rolePermissions ?? [];

  const required = Array.isArray(requiredPermission)
    ? requiredPermission
    : requiredPermission
      ? [requiredPermission]
      : [];

  if (required.length === 0 || required.includes("*")) {
    return children;
  }

  const hasPermission = (r: TPermission) => adminPermissions.some((p) => p.permission?.actionKey === r);
  const hasRequiredPermissions = mode === "every" ? required.every(hasPermission) : required.some(hasPermission);

  if (!hasRequiredPermissions) {
    if (variant === "disabled") {
      return <div className="contents *:pointer-events-none *:cursor-not-allowed *:opacity-50">{children}</div>;
    }
    return null;
  }

  return children;
}
