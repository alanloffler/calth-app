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
  const hasRun = useRef(false);
  const setAdmin = useAuthStore((state) => state.setAdmin);
  const { setTheme } = useTheme();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    let isMounted = true;

    async function initAuth() {
      const admin = useAuthStore.getState().admin;

      const storedTheme = localStorage.getItem("calth-app-theme");
      if (storedTheme && (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system")) {
        setTheme(storedTheme);
      }

      try {
        if (admin) {
          const response = await AuthService.getMe();

          const { loadAppSettings, loadDashboardSettings, loadNotificationsSettings } = useSettingsStore.getState();
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
          }
        }
      } catch {
        if (isMounted) setAdmin(undefined);
      } finally {
        if (isMounted) setIsInitialized(true);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [setTheme, setAdmin]);

  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}
