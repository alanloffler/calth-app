import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "sonner";

import type { ISetting } from "@settings/interfaces/setting.interface";
import type { TSyncMode } from "@settings/interfaces/sync-mode.type";
import { SettingsService } from "@settings/services/settings.service";
import { tryCatch } from "@core/utils/try-catch";

interface IStates {
  _hasHydrated: boolean;
  appSettings: ISetting[];
  dashboardSettings: ISetting[];
  notificationsSettings: ISetting[];
  error?: string | null;
  hasLocalSettings: boolean;
  loading?: boolean;
  loadingAppSettings: Record<string, boolean>;
  loadingDashboardSettings: Record<string, boolean>;
  loadingNotificationsSettings: Record<string, boolean>;
  settings: ISetting[];

  loadAppSettings: (forceFromApi?: boolean) => Promise<void>;
  loadDashboardSettings: (forceFromApi?: boolean) => Promise<void>;
  loadNotificationsSettings: (forceFromApi?: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
  updateAppSetting: (id: string, value: string, syncMode?: "local" | "remote") => Promise<void>;
  updateDashboardSetting: (id: string, value: string, syncMode?: "local" | "remote") => Promise<void>;
  updateNotificationsSetting: (id: string, value: string, syncMode?: "local" | "remote") => Promise<void>;
}

export const useSettingsStore = create(
  persist<IStates>(
    (set, get) => ({
      _hasHydrated: false,
      appSettings: [],
      dashboardSettings: [],
      notificationsSettings: [],
      error: null,
      hasLocalSettings: false,
      loading: false,
      loadingAppSettings: {},
      loadingDashboardSettings: {},
      loadingNotificationsSettings: {},
      settings: [],

      loadSettings: async () => {
        set({ loading: true, error: null });

        const [response, error] = await tryCatch(SettingsService.findAll());
        if (error) {
          set({ error: error.message, loading: false });
          return;
        }

        if (response && response.statusCode === 200 && response.data) {
          set({ settings: response.data, loading: false });
        }
      },
      loadAppSettings: async (forceFromApi: boolean = false) => {
        if (!get()._hasHydrated) {
          await new Promise((resolve) => {
            const checkHydrated = setInterval(() => {
              if (get()._hasHydrated) {
                clearInterval(checkHydrated);
                resolve(true);
              }
            }, 10);
          });
        }

        const state = get();

        if (!forceFromApi && state.hasLocalSettings && state.appSettings.length > 0) {
          const [response, error] = await tryCatch(SettingsService.findByModule("app"));
          if (!error && response?.statusCode === 200 && response.data) {
            const merged = response.data.map((apiSetting) => state.appSettings.find((s) => s.id === apiSetting.id) ?? apiSetting);
            set({ appSettings: merged });
          }
          return;
        }

        set({ loading: true, error: null });

        const [response, error] = await tryCatch(SettingsService.findByModule("app"));

        if (error) {
          set({ error: error.message, loading: false });
          return;
        }

        if (response && response.statusCode === 200 && response.data) {
          set({ appSettings: response.data, loading: false, hasLocalSettings: true });
        }
      },
      loadDashboardSettings: async (forceFromApi: boolean = false) => {
        if (!get()._hasHydrated) {
          await new Promise((resolve) => {
            const checkHydrated = setInterval(() => {
              if (get()._hasHydrated) {
                clearInterval(checkHydrated);
                resolve(true);
              }
            }, 10);
          });
        }

        const state = get();

        if (!forceFromApi && state.hasLocalSettings && state.dashboardSettings.length > 0) {
          const [response, error] = await tryCatch(SettingsService.findByModule("dashboard"));
          if (!error && response?.statusCode === 200 && response.data) {
            const merged = response.data.map((apiSetting) => state.dashboardSettings.find((s) => s.id === apiSetting.id) ?? apiSetting);
            set({ dashboardSettings: merged });
          }
          return;
        }

        set({ loading: true, error: null });

        const [response, error] = await tryCatch(SettingsService.findByModule("dashboard"));

        if (error) {
          set({ error: error.message, loading: false });
          return;
        }

        if (response && response.statusCode === 200 && response.data) {
          set({ dashboardSettings: response.data, loading: false, hasLocalSettings: true });
        }
      },
      loadNotificationsSettings: async (forceFromApi: boolean = false) => {
        if (!get()._hasHydrated) {
          await new Promise((resolve) => {
            const checkHydrated = setInterval(() => {
              if (get()._hasHydrated) {
                clearInterval(checkHydrated);
                resolve(true);
              }
            }, 10);
          });
        }

        const state = get();

        if (!forceFromApi && state.hasLocalSettings && state.notificationsSettings.length > 0) {
          const [response, error] = await tryCatch(SettingsService.findByModule("notification"));
          if (!error && response?.statusCode === 200 && response.data) {
            const merged = response.data.map((apiSetting) => state.notificationsSettings.find((s) => s.id === apiSetting.id) ?? apiSetting);
            set({ notificationsSettings: merged });
          }
          return;
        }

        set({ loading: true, error: null });

        const [response, error] = await tryCatch(SettingsService.findByModule("notification"));

        if (error) {
          set({ error: error.message, loading: false });
          return;
        }

        if (response && response.statusCode === 200 && response.data) {
          set({ notificationsSettings: response.data, loading: false, hasLocalSettings: true });
        }
      },
      updateAppSetting: async (id: string, value: string, syncMode: TSyncMode = "remote") => {
        set((state) => ({
          loadingAppSettings: { ...state.loadingAppSettings, [id]: true },
          error: null,
        }));

        if (syncMode === "local") {
          set((state) => ({
            appSettings: state.appSettings.map((setting) => (setting.id === id ? { ...setting, value } : setting)),
            loadingAppSettings: { ...state.loadingAppSettings, [id]: false },
            hasLocalSettings: true,
          }));

          toast.success("Configuración actualizada");
          return;
        }

        const [response, error] = await tryCatch(SettingsService.update(id, value));

        if (error) {
          set((state) => ({
            error: error.message,
            loadingAppSettings: { ...state.loadingAppSettings, [id]: false },
          }));

          toast.error(error.message);
          return;
        }

        if (response && response.statusCode === 200 && response.data) {
          set((state) => ({
            appSettings: state.appSettings.map((setting) => (setting.id === id ? { ...setting, value } : setting)),
            loadingAppSettings: { ...state.loadingAppSettings, [id]: false },
            hasLocalSettings: true,
          }));

          toast.success("Configuración actualizada");
        }
      },
      updateDashboardSetting: async (id: string, value: string, syncMode: TSyncMode = "remote") => {
        set((state) => ({
          loadingDashboardSettings: { ...state.loadingDashboardSettings, [id]: true },
          error: null,
        }));

        if (syncMode === "local") {
          set((state) => ({
            dashboardSettings: state.dashboardSettings.map((setting) =>
              setting.id === id ? { ...setting, value } : setting,
            ),
            loadingDashboardSettings: { ...state.loadingDashboardSettings, [id]: false },
            hasLocalSettings: true,
          }));

          toast.success("Configuración actualizada");
          return;
        }

        const [response, error] = await tryCatch(SettingsService.update(id, value));

        if (error) {
          set((state) => ({
            error: error.message,
            loadingDashboardSettings: { ...state.loadingDashboardSettings, [id]: false },
          }));

          toast.error(error.message);
          return;
        }

        if (response && response.statusCode === 200 && response.data) {
          set((state) => ({
            dashboardSettings: state.dashboardSettings.map((setting) =>
              setting.id === id ? { ...setting, value } : setting,
            ),
            loadingDashboardSettings: { ...state.loadingDashboardSettings, [id]: false },
            hasLocalSettings: true,
          }));

          toast.success("Configuración actualizada");
        }
      },
      updateNotificationsSetting: async (id: string, value: string, syncMode: TSyncMode = "remote") => {
        set((state) => ({
          loadingNotificationsSettings: { ...state.loadingNotificationsSettings, [id]: true },
          error: null,
        }));

        if (syncMode === "local") {
          set((state) => ({
            notificationsSettings: state.notificationsSettings.map((setting) =>
              setting.id === id ? { ...setting, value } : setting,
            ),
            loadingNotificationsSettings: { ...state.loadingNotificationsSettings, [id]: false },
            hasLocalSettings: true,
          }));

          toast.success("Configuración actualizada");
          return;
        }

        const [response, error] = await tryCatch(SettingsService.update(id, value));

        if (error) {
          set((state) => ({
            error: error.message,
            loadingNotificationsSettings: { ...state.loadingNotificationsSettings, [id]: false },
          }));

          toast.error(error.message);
          return;
        }

        if (response && response.statusCode === 200 && response.data) {
          set((state) => ({
            notificationsSettings: state.notificationsSettings.map((setting) =>
              setting.id === id ? { ...setting, value } : setting,
            ),
            loadingNotificationsSettings: { ...state.loadingNotificationsSettings, [id]: false },
            hasLocalSettings: true,
          }));

          toast.success("Configuración actualizada");
        }
      },
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: "calth-app-settings",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
