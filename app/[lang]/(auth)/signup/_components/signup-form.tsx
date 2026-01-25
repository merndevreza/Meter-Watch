"use client";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup, 
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Sign up with your valid email address
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 text-sm text-red-500">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-2">
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
            <Field className="mt-3">
              <Input id="password" type="password" name="password" placeholder="Password" required />
            </Field>
            <Field>
              <Input id="confirm-password" type="password" name="confirm-password" placeholder="Confirm Password" required />
            </Field>
            <Field className="mt-1">
              <Button type="submit">Sign Up</Button>
              <FieldDescription className="px-6 text-center pt-8">
                Already have an account? <Link href="/login">Sign in</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
