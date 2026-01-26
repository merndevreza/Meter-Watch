import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { getDictionary, hasLocale } from "../../dictionaries/dictionaries";
import { SignupForm } from "./_components/signup-form";
import OAuthAndMagicLogin from "../_components/OAuthAndMagicLogin";
import { Dictionary } from "@/types/dictionary";

export default async function Page({ params }: { params: Promise<{ lang: "en" | "bn" }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{dictionary.signUpTitle}</CardTitle>
          <CardDescription>
           {dictionary.signUpDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
          <OAuthAndMagicLogin dictionary={dictionary as Dictionary}/>
          <FieldDescription className="px-6 text-center pt-8">
            {dictionary.alreadyHaveAccount} <Link href={`/${lang}/login`}>{dictionary.loginTitle}</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    </div>
  )
}
