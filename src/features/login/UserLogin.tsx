import { LoginForm } from "@login/components/LoginForm";
import { ModeToggle } from "@components/ModeToggle";

export function UserLogin() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center p-4 sm:p-6 md:p-10">
      <ModeToggle className="absolute top-5 right-5" />
      <LoginForm type="user" />
    </div>
  );
}
