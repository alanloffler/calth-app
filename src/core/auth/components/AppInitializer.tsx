import { useEffect, useRef, useState, type ReactNode } from "react";

import { AuthService } from "@auth/services/auth.service";
import { useAuthStore } from "@auth/stores/auth.store";
import { useSettingsStore } from "@settings/stores/settings.store";
import { useTheme } from "@core/providers/theme-provider";

interface IProps {
  children: ReactNode;
}

export function AppInitializer({ children }: IProps) {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const admin = useAuthStore((state) => state.admin);
  const isInitializing = useRef(false);
  const lastAdminId = useRef<string | null>(null);
  const loadAppSettings = useSettingsStore((state) => state.loadAppSettings);
  const loadDashboardSettings = useSettingsStore((state) => state.loadDashboardSettings);
  const loadNotificationsSettings = useSettingsStore((state) => state.loadNotificationsSettings);
  const setAdmin = useAuthStore((state) => state.setAdmin);
  const { setTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (isInitializing.current || (admin && lastAdminId.current === admin.id)) {
        return;
      }

      isInitializing.current = true;

      const storedTheme = localStorage.getItem("calth-app-theme");
      if (storedTheme && (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system")) {
        setTheme(storedTheme);
      }

      try {
        if (admin) {
          const response = await AuthService.getMe();

          await loadAppSettings();
          await loadDashboardSettings();
          await loadNotificationsSettings(true);

          const { appSettings } = useSettingsStore.getState();
          const themeSetting = appSettings.find((setting) => setting.submodule === "theme");
          if (
            themeSetting &&
            (themeSetting.value === "light" || themeSetting.value === "dark" || themeSetting.value === "system")
          ) {
            setTheme(themeSetting.value);
          }

          if (isMounted && response.data) {
            setAdmin(response.data);
            lastAdminId.current = response.data.id;
          }
        } else {
          lastAdminId.current = null;
        }
      } catch {
        if (isMounted) {
          setAdmin(undefined);
          lastAdminId.current = null;
        }
      } finally {
        if (isMounted) setIsInitialized(true);
        isInitializing.current = false;
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [admin, setTheme, setAdmin, loadAppSettings, loadDashboardSettings, loadNotificationsSettings]);

  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}
