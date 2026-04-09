import { Moon, SunMedium } from "lucide-react";

import * as SwitchPrimitive from "@radix-ui/react-switch";

import { useAuthStore } from "@auth/stores/auth.store";
import { useSettingsStore } from "@settings/stores/settings.store";
import { useTheme } from "@core/providers/theme-provider";

export function ModeToggle() {
  const admin = useAuthStore((state) => state.admin);
  const { appSettings, updateAppSetting } = useSettingsStore();
  const { setTheme, theme } = useTheme();

  async function handleThemeChange(theme: "light" | "dark" | "system") {
    setTheme(theme);

    if (admin) {
      const themeSetting = appSettings.find((setting) => setting.submodule === "theme");
      if (themeSetting) {
        await updateAppSetting(themeSetting.id, theme, "local");
      }
    }
  }

  return (
    <SwitchPrimitive.Root
      checked={theme === "dark"}
      onCheckedChange={(checked) => handleThemeChange(checked ? "dark" : "light")}
      data-slot="switch"
      className="peer data-[state=checked]:bg-secondary data-[state=unchecked]:bg-secondary focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-secondary inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none flex size-7 items-center justify-center rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-3px)] data-[state=unchecked]:translate-x-px"
      >
        {theme === "light" ? (
          <SunMedium className="h-5 w-5 shrink-0" strokeWidth={1.5} />
        ) : (
          <Moon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}
