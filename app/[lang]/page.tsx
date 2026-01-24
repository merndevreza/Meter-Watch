
import { notFound, redirect } from 'next/navigation';
import { getDictionary, hasLocale } from "./dictionaries/dictionaries";
import { auth } from '@/auth';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BanknoteArrowDown, SquarePen, Trash, Zap, Calendar, Activity, Gauge, Grid2x2Check, BanknoteArrowUp } from "lucide-react";
import { fetchUserMeters } from '../actions/meter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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

  const getMeterTypeText = (type: string) => {
    switch (type) {
      case 'single-phase':
        return "Single Phase Meter";
      case 'two-phase':
        return "Two Phase Meter";
      case 'three-phase':
        return "Three Phase Meter";
      default:
        return type;
    }
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="grid grid-cols-1 gap-6 px-4 lg:px-6 xl:grid-cols-3 2xl:grid-cols-4">
                {meters?.data?.length > 0 ? (
                  meters.data.map((meter: MeterDataType) => (
                    <Card key={meter.id} className="overflow-hidden transition-all pb-0 hover:shadow-lg border-muted-foreground/20">
                      <CardHeader className="space-y-2 pb-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                              {meter.meterName}
                            </CardTitle>
                            <CardDescription className="font-mono text-sm font-medium text-muted-foreground/80">
                              ID: {meter.meterNumber}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={meter.meterStatus === 'active' ? "default" : "destructive"}
                            className={`uppercase px-3 py-1 text-xs font-medium flex items-center gap-2 shadow-inner bg-primary/3 ${meter.meterStatus === 'active' ? "text-emerald-700 border-white " : ""
                              }`}
                          >
                            <span className={`h-2.5 w-2.5 rounded-full ${meter.meterStatus === 'active' ? "bg-emerald-700 animate-pulse" : "bg-red-600"}`} />
                            {meter.meterStatus}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <div className="rounded-xl bg-primary/3 py-6 px-4 text-center border border-primary/10 shadow-inner">
                          <p className="text-sm font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">Current Balance</p>
                          <div className="text-4xl font-extrabold text-primary tracking-tight">
                            {meter.currentBalance} <span className="text-lg font-bold text-primary/60">TK</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-5 gap-x-2">
                          <div className="space-y-1.5">
                            <p className="text-xs uppercase text-muted-foreground font-extrabold tracking-tight">Threshold</p>
                            <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                              <Gauge className="h-4 w-4 text-red-500" />
                              {meter.minimumRechargeThreshold} <span className="text-xs text-muted-foreground">TK</span>
                            </div>
                          </div>
                          <div className="space-y-1.5 text-right sm:text-left">
                            <p className="text-xs uppercase text-muted-foreground font-extrabold tracking-tight">Sanction Load</p>
                            <div className="flex items-center gap-2 text-base font-semibold text-foreground justify-end sm:justify-start">
                              <Zap className="h-4 w-4 text-amber-500" />
                              {meter.sanctionLoad} <span className="text-xs text-muted-foreground">KW</span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-xs uppercase text-muted-foreground font-extrabold tracking-tight">Tariff Type</p>
                            <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                              <Activity className="h-4 w-4 text-blue-500" />
                              {meter.sanctionTariff}
                            </div>
                          </div>
                          <div className="space-y-1.5 text-right sm:text-left">
                            <p className="text-xs uppercase text-muted-foreground font-extrabold tracking-tight">Meter Type</p>
                            <div className="flex items-center gap-2 text-base font-semibold text-foreground justify-end sm:justify-start">
                              <Grid2x2Check className="h-4 w-4 text-blue-500" />
                              {getMeterTypeText(meter.meterType)}
                            </div>
                          </div>
                        </div>

                        <Separator className="opacity-60" />

                        <div className="flex flex-wrap gap-3 pt-1">
                          <Button className="flex-1 h-11 gap-2 text-sm font-bold shadow-md active:scale-95 transition-transform">
                            <BanknoteArrowUp className="h-5 w-5" />
                            Recharge
                          </Button>
                          <Button variant="secondary" className="flex-1 h-11 gap-2 text-sm font-bold active:scale-95 transition-transform">
                            <BanknoteArrowDown className="h-5 w-5" />
                            Usage
                          </Button>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" size="icon" className="h-11 w-11 flex-1 sm:flex-none border-muted-foreground/20 hover:bg-accent">
                              <SquarePen className="h-5 w-5" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-11 w-11 flex-1 sm:flex-none text-destructive border-destructive/20 hover:bg-destructive/5">
                              <Trash className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/40 pb-4 [.border-t]:pt-4 border-t">
                        <div className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground font-semibold">
                          <Calendar className="h-4 w-4 opacity-70" />
                          <span>Installed: {new Date(meter.meterInstallationDate).toLocaleDateString()}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                      <Zap className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">No electric meters found.</p>
                  </div>
                )}
              </div> 
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

