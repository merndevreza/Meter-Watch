import { notFound, redirect } from 'next/navigation';
import { getDictionary, hasLocale } from "../dictionaries/dictionaries";
import { auth } from '@/auth';
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SiteHeader } from "@/components/header/site-header"
import {
   SidebarInset,
   SidebarProvider,
} from "@/components/ui/sidebar"
import { User } from '@/types/user';

export default async function DashboardLayout({
   params,
   children
}: {
   params: Promise<{ lang: string }>;
   children: React.ReactNode;
}) {
   const { lang } = await params;

   if (!hasLocale(lang)) notFound();

   const currentLang = lang as "en" | "bn";

   const dictionary = await getDictionary(currentLang);
   const session = await auth();
   
   if (!session?.user?.emailVerified) {
      redirect(`/${lang}/login`);
   }
   return (
      <SidebarProvider
         style={
            {
               "--sidebar-width": "calc(var(--spacing) * 72)",
               "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
         }
      >
         <AppSidebar lang={lang} user={session?.user as User} />
         <SidebarInset>
            <SiteHeader lang={lang} dictionary={dictionary}/>
            <main className='py-4 md:py-6'>
               {children}
            </main>
         </SidebarInset>
      </SidebarProvider>
   )
}

