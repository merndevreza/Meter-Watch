import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FieldDescription,
} from "@/components/ui/field";
import { LoginForm } from "./_components/login-form";
import OAuthAndMagicLogin from "../_components/OAuthAndMagicLogin";
import { getDictionary, hasLocale } from "../../dictionaries/dictionaries"; 
import { Dictionary } from "@/types/dictionary";

export default async function Page({ searchParams, params }: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
  params: Promise<{ lang: "en" | "bn" }>
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);
  const { verified } = await searchParams;
 
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{dictionary.loginTitle}</CardTitle>
          <CardDescription>
            {dictionary.loginDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm dictionary={dictionary as Dictionary} verified={verified} lang={lang} />
          <OAuthAndMagicLogin dictionary={dictionary as Dictionary} />
          <FieldDescription className="text-center pt-8">
            {dictionary.noAccount} <Link href={`/${lang}/signup`}>{dictionary.signUp}</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    </div>
  )
}
