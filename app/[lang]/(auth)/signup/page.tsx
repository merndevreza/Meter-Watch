import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries/dictionaries";
import { SignupForm } from "./_components/signup-form";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OAuthAndMagicLogin from "../_components/OAuthAndMagicLogin";
import { FieldDescription } from "@/components/ui/field";
import Link from "next/link";

export default async function Page({ params }: { params: Promise<{ lang: "en" | "bn" }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);
  
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Sign up with your valid email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
          <OAuthAndMagicLogin />
          <FieldDescription className="px-6 text-center pt-8">
            Already have an account? <Link href={`/${lang}/login`}>Sign in</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    </div>
  )
}
