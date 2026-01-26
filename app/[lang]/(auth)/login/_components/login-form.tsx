"use client";
import { doCredentialsLogin } from "@/app/actions/login";
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ lang }: { lang: "en" | "bn" }) {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const response = await doCredentialsLogin(formData);

      if (response.error) {
        setError(response.error);
      } else if (response.success) {
        router.push(`/${lang}`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-4 text-sm text-red-500">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <FieldGroup className="gap-1">
          <Field>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              required
            />
          </Field>
          <Field>
            <Input name="password" id="password" type="password" placeholder="password" required />
          </Field>
          <Field className="mt-1">
            <Button type="submit">Login</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
