import { Eye, EyeOff } from "lucide-react";

import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Loader } from "@components/Loader";

import { toast } from "sonner";
import { type MouseEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { TAuthType } from "@auth/interfaces/auth.type";
import { AuthService } from "@auth/services/auth.service";
import { cn } from "@core/lib/utils";
import { loginSchema } from "@login/schemas/login.schema";
import { useAuthStore } from "@auth/stores/auth.store";
import { useSettingsStore } from "@settings/stores/settings.store";

interface IProps {
  className?: string;
  type: TAuthType;
}

export function LoginForm({ className, type }: IProps) {
  const [passwordField, setPasswordField] = useState<boolean>(true);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isPending } = useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const loginResponse = await AuthService.login({
        email: data.email,
        password: data.password,
        type,
      });
      if (loginResponse.statusCode !== 200) {
        throw new Error(loginResponse.message);
      }

      const userResponse = await AuthService.getMe();
      if (userResponse.statusCode !== 200) {
        throw new Error(userResponse.message);
      }

      return {
        user: userResponse.data,
        type: loginResponse.data?.type as TAuthType,
      };
    },
    onSuccess: async ({ user, type }) => {
      const authStore = useAuthStore.getState();
      const settingsStore = useSettingsStore.getState();

      authStore.setAdmin(user);
      authStore.setType(type);

      await settingsStore.loadAppSettings();
      await settingsStore.loadDashboardSettings();
      await settingsStore.loadNotificationsSettings(true);

      toast.success(`Bienvenido ${user?.firstName} ${user?.lastName}`);
      navigate("/dashboard");
    },
  });

  function togglePasswordField(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setPasswordField(!passwordField);
  }

  return (
    <div className={cn("flex w-full flex-col gap-6", className)}>
      <Card className="mx-auto w-full max-w-6xl overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8 lg:p-10" onSubmit={form.handleSubmit((data) => login(data))}>
            <FieldGroup>
              <div className="mb-6 flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold md:text-3xl">Calth</h1>
                <p className="text-muted-foreground text-sm text-balance md:text-base">Ingresá al sistema</p>
              </div>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input {...field} aria-invalid={fieldState.invalid} className="h-11 md:h-12" id="email" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id="password"
                        className="h-11 md:h-12"
                        type={passwordField ? "password" : "text"}
                      />
                      <button
                        className="p-1 transition-colors duration-150 hover:text-sky-500"
                        onClick={(e) => togglePasswordField(e)}
                        type="button"
                      >
                        {passwordField ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Field>
                <Button type="submit" className="h-11 w-full md:h-12">
                  {isPending ? <Loader color="white" text="Ingresando" /> : "Ingresar"}
                </Button>
              </Field>
              <a href="#" className="text-xs underline-offset-2 hover:underline md:text-xs">
                ¿Olvidaste tu contraseña?
              </a>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/login.webp"
              alt="Login"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
