import { Eye, EyeOff, LockKeyhole } from "lucide-react";

import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Controller } from "react-hook-form";
import { Field, FieldError } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";
import { PageHeader } from "@components/pages/PageHeader";

import z from "zod";
import { type MouseEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiKeySchema } from "@core/schemas/api-key.schema";
import { emailSchema } from "@core/schemas/email.schema";
import { usePermission } from "@permissions/hooks/usePermission";
import { useSettingsStore } from "@settings/stores/settings.store";

export default function NotificationsSettings() {
  const [passwordField, setPasswordField] = useState<boolean>(true);
  const canEditSettings = usePermission("settings-update");
  const { notificationsSettings, loadingNotificationsSettings, updateNotificationsSetting } = useSettingsStore();

  const resendApiKeySetting = notificationsSettings.find((setting) => setting.key === "resendApiKey");
  const emailFromSetting = notificationsSettings.find((setting) => setting.key === "emailFrom");

  const apiKeyForm = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (resendApiKeySetting) {
      apiKeyForm.setValue("apiKey", resendApiKeySetting.value);
    }
  }, [apiKeyForm, resendApiKeySetting]);

  useEffect(() => {
    if (emailFromSetting) {
      emailForm.setValue("email", emailFromSetting.value);
    }
  }, [emailForm, emailFromSetting]);

  function togglePasswordField(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setPasswordField(!passwordField);
  }

  function onSubmitApiKey(data: z.infer<typeof apiKeySchema>): void {
    if (!resendApiKeySetting) return;
    updateNotificationsSetting(resendApiKeySetting.id, data.apiKey, "remote");
  }

  function onSubmitEmail(data: z.infer<typeof emailSchema>): void {
    if (!emailFromSetting) return;
    updateNotificationsSetting(emailFromSetting.id, data.email, "remote");
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Configuraciones de la aplicación" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
        <Card className="relative col-span-1 gap-3 lg:col-span-3 2xl:col-span-3">
          <CardHeader>
            <CardTitle>Notificaciones por email</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-8">
            {resendApiKeySetting && (
              <form
                className="flex items-start justify-start gap-5"
                id="api-key-form"
                onSubmit={apiKeyForm.handleSubmit(onSubmitApiKey)}
              >
                <label className="mt-2 text-nowrap select-none hover:cursor-pointer" htmlFor="resendApiKey">
                  {resendApiKeySetting.title}
                </label>
                <Controller
                  name="apiKey"
                  control={apiKeyForm.control}
                  render={({ field, fieldState }) => (
                    <Field className="w-90!" data-invalid={fieldState.invalid}>
                      <Input
                        className="w-90"
                        disabled={!canEditSettings || loadingNotificationsSettings[resendApiKeySetting.id]}
                        id="resendApiKey"
                        type={passwordField ? "password" : "text"}
                        {...field}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Button
                  className="mt-0"
                  disabled={!canEditSettings || loadingNotificationsSettings[resendApiKeySetting.id]}
                  type="submit"
                  variant="default"
                >
                  {loadingNotificationsSettings[resendApiKeySetting.id] ? (
                    <Loader color="white" text="Guardando" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
                {!canEditSettings && <LockKeyhole className="text-muted-foreground mt-2 h-3.5 w-3.5 shrink-0" />}
                <button
                  className="mt-1 p-1 transition-colors duration-150 hover:text-sky-500"
                  onClick={(e) => togglePasswordField(e)}
                  type="button"
                >
                  {passwordField ? <Eye className="size-5 shrink-0" /> : <EyeOff className="size-5 shrink-0" />}
                </button>
              </form>
            )}
            {emailFromSetting && (
              <form
                className="flex items-start justify-start gap-5"
                id="email-form"
                onSubmit={emailForm.handleSubmit(onSubmitEmail)}
              >
                <label className="mt-2 text-nowrap select-none hover:cursor-pointer" htmlFor="emailFrom">
                  {emailFromSetting.title}
                </label>
                <Controller
                  name="email"
                  control={emailForm.control}
                  render={({ field, fieldState }) => (
                    <Field className="w-90!" data-invalid={fieldState.invalid}>
                      <Input
                        id="emailFrom"
                        disabled={!canEditSettings || loadingNotificationsSettings[emailFromSetting.id]}
                        {...field}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Button
                  className="mt-0"
                  disabled={!canEditSettings || loadingNotificationsSettings[emailFromSetting.id]}
                  type="submit"
                  variant="default"
                >
                  {loadingNotificationsSettings[emailFromSetting.id] ? (
                    <Loader color="white" text="Guardando" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
                {!canEditSettings && <LockKeyhole className="text-muted-foreground mt-2 h-3.5 w-3.5 shrink-0" />}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
