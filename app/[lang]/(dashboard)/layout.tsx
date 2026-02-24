import { notFound, redirect } from 'next/navigation';
import { hasLocale } from "../dictionaries/dictionaries";
import { auth } from '@/auth';
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SiteHeader } from "@/components/header/site-header"
import {
   SidebarInset,
   SidebarProvider,
} from "@/components/ui/sidebar"
import { User } from '@/types';

export default async function DashboardLayout({
   params,
   children
}: {
   params: Promise<{ lang: string }>;
   children: React.ReactNode;
}) {
   const { lang } = await params;

   if (!hasLocale(lang)) notFound();
   const session = await auth();

   if (!session?.user) {
      redirect(`/${lang}/login`);
   } else {
      if (!session?.user?.emailVerified) {
         redirect(`/${lang}/verify-email`);
      }
   }
   return (
      <SidebarProvider
         style={
            {
               "--sidebar-width": "calc(var(--spacing) * 72)",
               "--header-height": "calc(var(--spacing) * 18)",
            } as React.CSSProperties
         }
      >
         <AppSidebar lang={lang} user={session?.user as User} />
         <SidebarInset>
            <SiteHeader lang={lang} user={session?.user as User} />
            <main className='bg-muted/20 p-6 md:p-10 min-h-screen'>
               {children}
            </main>
         </SidebarInset>
      </SidebarProvider>
   )
}

