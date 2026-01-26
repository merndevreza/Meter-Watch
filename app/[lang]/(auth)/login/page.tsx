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
import { toast } from "sonner";

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
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Login with your any option below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm verified={verified} lang={lang} />
          <OAuthAndMagicLogin />
          <FieldDescription className="text-center pt-8">
            Don&apos;t have an account? <Link href={`/${lang}/signup`}>Sign up</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    </div>
  )
}
