import { LoginForm } from "@/app/login/_components/login-form"; 
import { DarkLightToggle } from "@/components/theme-toggle/DarkLightToggle";

export default function Home() {
  return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <DarkLightToggle />
        <LoginForm />
      </div>
    </div>
  );
}
