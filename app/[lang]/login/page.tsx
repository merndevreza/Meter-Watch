import { auth } from "@/auth";
import { LoginForm } from "./_components/login-form";

export default async function Page() {
const session = await auth();
console.log("session", session);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
