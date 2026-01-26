"use client";
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [showFieldType, setShowFieldType] = useState({
    password: false,
    confirmPassword: false
  })
  const router = useRouter();


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (data.success) {
        setError(null);
      } else {
        setError(data.message);
      }

    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
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
            <Input id="name" type="text" name="name" placeholder="Name" required />
          </Field>
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
            <Input id="password" type={showFieldType.password ? "text" : "password"} name="password" placeholder="Password" required />
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
          <Field className="relative">
            <Input id="confirm-password" type={showFieldType.confirmPassword ? "text" : "password"} name="confirm-password" placeholder="Confirm Password" required />
            <Button variant="link" className="absolute right-0 top-0 max-w-10" onClick={(e) => {
              e.preventDefault()
              setShowFieldType({
                ...showFieldType,
                confirmPassword: !showFieldType.confirmPassword
              })
            }}>
              {showFieldType.confirmPassword ? <EyeOff /> : <Eye />}
            </Button>
          </Field>
          <Field className="mt-1">
            <Button type="submit">Sign Up</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
