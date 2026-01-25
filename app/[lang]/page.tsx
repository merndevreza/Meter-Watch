
import { notFound, redirect } from 'next/navigation';
import { getDictionary, hasLocale } from "./dictionaries/dictionaries";
import { auth } from '@/auth';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { fetchUserMeters } from '../actions/meter';
import MeterCardsWrapper from './_components/MeterCardsWrapper';
import { MeterDataType } from '@/types/meter-type';

export default async function Overview({ params }: { params: Promise<{ lang: "en" | "bn" }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);

  const session = await auth();
  console.log("session", session);
  const meters = await fetchUserMeters();
  console.log("meters.data", meters.data);

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
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className='py-4 md:py-6'>
          <MeterCardsWrapper metersData={(meters.success ? meters.data : []) as MeterDataType[]} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

