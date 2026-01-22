
import { notFound } from 'next/navigation';
import { DarkLightToggle } from "@/components/theme-toggle/DarkLightToggle";
import { LoginForm } from "./login/_components/login-form";
import { getDictionary, hasLocale } from "./dictionaries/dictionaries";
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { auth } from '@/auth';

export default async function Home({ params }: { params: Promise<{ lang: "en" | "bn" }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);

  const session = await auth();
  console.log("session", session);
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <h2>{dictionary.home}</h2>
        <LanguageSwitcher dictionary={dictionary} lang={lang} />
        <DarkLightToggle />
        <LoginForm />
      </div>
    </div>
  );
}
