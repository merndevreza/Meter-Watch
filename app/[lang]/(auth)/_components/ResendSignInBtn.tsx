"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail } from "lucide-react";
import { useFormStatus } from "react-dom";


export function ResendSignInBtn() {
  const { pending } = useFormStatus();

  const handleSignIn = async (formData: FormData) => {
    const email = formData.get("email") as string;
    await signIn("resend", { email, redirectTo: "/" });
  };

  return (
    <form action={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          required
          autoComplete="email"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Link...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Sign in with Magic Link
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        We&apos;ll email you a magic link for a password-free sign in.
      </p>
    </form>
  );
}