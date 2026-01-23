import { auth } from "@/auth";
import { cn } from "@/lib/utils"
import { LoginForm } from "./_components/login-form";
import OAuthSignInBtn from "./_components/OAuthSignInBtn";
import { SignOutBtn } from "@/components/SignOutBtn";
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
} from "@/components/ui/field"
import { ResendSignInBtn } from "./_components/ResendSignInBtn";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries/dictionaries";

export default async function Page({ params }: { params: Promise<{ lang: "en" | "bn" }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);

  const session = await auth();
  console.log("session", session);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignOutBtn />
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm lang={lang} />
              <Field className="mt-4">
                <ResendSignInBtn />
              </Field> 
              <Field className="mt-4">
                <div className="flex justify-between gap-4">
                  <OAuthSignInBtn provider="google" />
                  <OAuthSignInBtn provider="github" />
                </div>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
