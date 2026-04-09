import { LockKeyhole } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Loader } from "@components/Loader";
import { PageHeader } from "@components/pages/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Switch } from "@components/ui/switch";

import { useState } from "react";

import type { TSyncMode } from "@settings/interfaces/sync-mode.type";
import { ERoles } from "@auth/enums/role.enum";
import { useAuthStore } from "@auth/stores/auth.store";
import { usePermission } from "@permissions/hooks/usePermission";
import { useSettingsStore } from "@settings/stores/settings.store";
import { useTheme, type Theme } from "@core/providers/theme-provider";

export default function AppSettings() {
  const [syncMode, setSyncMode] = useState<TSyncMode>("local");
  const admin = useAuthStore((state) => state.admin);
  const canEditSettings = usePermission("settings-update");
  const { appSettings, loadingAppSettings, updateAppSetting } = useSettingsStore();
  const { setTheme } = useTheme();

  const localeSettings = appSettings.filter((setting) => setting.submodule === "locale");
  const menuSettings = appSettings.filter((setting) => setting.submodule === "menu");
  const themeSettings = appSettings.filter((setting) => setting.submodule === "theme");

  async function handleThemeChange(settingId: string, value: string) {
    setTheme(value as Theme);
    await updateAppSetting(settingId, value, syncMode);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Configuraciones de la aplicación">
        {admin?.role.value === ERoles.super && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">
              Actualizar en {syncMode === "remote" ? "base de datos" : "local"}
            </label>
            <Switch
              checked={syncMode === "remote" ? true : false}
              onCheckedChange={(value) => setSyncMode(value === true ? "remote" : "local")}
            />
          </div>
        )}
      </PageHeader>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
        <Card className="relative col-span-1 gap-3 lg:col-span-3">
          <CardHeader>
            <CardTitle>Aspecto</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-2">
            {themeSettings.map((setting) => (
              <div className="flex items-center gap-3" key={setting.id}>
                <label className="select-none hover:cursor-pointer" htmlFor={setting.id}>
                  {setting.title}
                </label>
                <Select onValueChange={(value) => handleThemeChange(setting.id, value)} value={setting.value}>
                  <SelectTrigger disabled={!canEditSettings || loadingAppSettings[setting.id]}>
                    <SelectValue placeholder={setting.title} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                  </SelectContent>
                </Select>
                {loadingAppSettings[setting.id] && <Loader color="#000" />}
                {!canEditSettings && <LockKeyhole className="text-muted-foreground h-3.5 w-3.5" />}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="relative col-span-1 gap-3 lg:col-span-3">
          <CardHeader>
            <CardTitle>Idioma</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-2">
            {localeSettings.map((setting) => (
              <div className="flex items-center gap-3" key={setting.id}>
                <label className="select-none hover:cursor-pointer" htmlFor={setting.id}>
                  {setting.title}
                </label>
                <Select onValueChange={(value) => handleThemeChange(setting.id, value)} value={setting.value}>
                  <SelectTrigger disabled={!canEditSettings || loadingAppSettings[setting.id]}>
                    <SelectValue placeholder={setting.title} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">Inglés</SelectItem>
                  </SelectContent>
                </Select>
                {loadingAppSettings[setting.id] && <Loader color="#000" />}
                {!canEditSettings && <LockKeyhole className="text-muted-foreground h-3.5 w-3.5" />}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="relative col-span-1 gap-3 lg:col-span-3">
          <CardHeader>
            <CardTitle>Menú</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-2">
            {menuSettings.map((setting) => (
              <div className="flex items-center gap-3" key={setting.id}>
                <Switch
                  disabled={!canEditSettings || loadingAppSettings[setting.id]}
                  id={setting.id}
                  checked={setting.value === "true"}
                  onCheckedChange={(checked) => {
                    updateAppSetting(setting.id, checked.toString(), syncMode);
                  }}
                />
                <label className="select-none hover:cursor-pointer" htmlFor={setting.id}>
                  {setting.title}
                </label>
                {loadingAppSettings[setting.id] && <Loader color="#000" />}
                {!canEditSettings && <LockKeyhole className="text-muted-foreground h-3.5 w-3.5" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
