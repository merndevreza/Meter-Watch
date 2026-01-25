import { auth } from "@/auth";
import { cn } from "@/lib/utils"
import { LoginForm } from "./_components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FieldDescription,
} from "@/components/ui/field"
import { notFound } from "next/navigation";
import Link from "next/link";
import OAuthAndMagicLogin from "../_components/OAuthAndMagicLogin";
import { getDictionary, hasLocale } from "../../dictionaries/dictionaries";

export default async function Page({ params }: { params: Promise<{ lang: "en" | "bn" }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);

  const session = await auth();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xl">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Login with your any option below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm lang={lang} />
              <OAuthAndMagicLogin />
              <FieldDescription className="text-center pt-8">
                Don&apos;t have an account? <Link href="/signup">Sign up</Link>
              </FieldDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
