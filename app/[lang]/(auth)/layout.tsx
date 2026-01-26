import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import { hasLocale } from "../dictionaries/dictionaries";
import AuthHeader from './_components/AuthHeader';

export default async function AuthLayout({
   params,
   children
}: {
   params: Promise<{ lang: string }>;
   children: React.ReactNode;
}) {
   const { lang } = await params; 
   if (!hasLocale(lang)) notFound();
 
   const session = await auth();  
   if (session?.user?.emailVerified) {
      redirect(`/${lang}`);
   }
   return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
         <div className="w-full max-w-xl">
            <AuthHeader lang={lang} />
            {children}
         </div>
      </div>
   )
}

