"use client";
import { doCredentialsLogin } from "@/app/actions/login";
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ lang }: { lang: "en" | "bn" }) {
  const [error, setError] = useState("");
  const router = useRouter();
  const [showFieldType, setShowFieldType] = useState({
    password: false,
    confirmPassword: false
  })
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
        <FieldGroup className="gap-6">
          <Field>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              required
            />
          </Field>
          <Field className="relative">
            <Input name="password" id="password" type={showFieldType.password ? "text" : "password"} placeholder="password" required />
              <Button variant="link" className="absolute right-0 top-0 max-w-10" onClick={(e) => {
              e.preventDefault()
              setShowFieldType({
                ...showFieldType,
                password: !showFieldType.password
              })
            }}>
              {showFieldType.password ? <EyeOff /> : <Eye />}
            </Button>
          </Field>
          <Field className="mt-1">
            <Button type="submit">Login</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
