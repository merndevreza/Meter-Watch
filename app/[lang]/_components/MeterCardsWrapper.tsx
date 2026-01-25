"use client";
import { Badge } from "@/components/ui/badge"
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card"
import { Zap, Calendar, Activity, Gauge, Grid2x2Check } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { MeterDataType } from '@/types/meter-type';
import CardButtons from './CardButtons';
import { useState } from "react";

const MeterCardsWrapper = ({ metersData=[] }: { metersData: MeterDataType[] | [] }) => {
   const [allMeters, setAllMeters] = useState<MeterDataType[]>(metersData);

   
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
   const onDeleteMeter = (mongoId: string) => {
      const updatedMeters = allMeters.filter(meter => meter.id !== mongoId);
      setAllMeters(updatedMeters);
   }
   const onBalanceUpdate = (mongoId: string, newBalance: number) => {
      const updatedMeters = allMeters.map(meter => {
         if (meter.id === mongoId) {
            return { ...meter, currentBalance: newBalance };
         }
         return meter;
      });
      setAllMeters(updatedMeters);
   }
 
   return (
      <div className="grid grid-cols-1 gap-6 px-4 lg:px-6 xl:grid-cols-3 2xl:grid-cols-4">
         {allMeters?.length > 0 ? (
            allMeters.map((meter: MeterDataType) => (
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
                           variant={meter.isActive ? "default" : "destructive"}
                           className={`uppercase px-3 py-1 text-xs font-medium flex items-center gap-2 shadow-inner bg-primary/3 ${meter.isActive ? "text-emerald-700 border-white " : ""}`}>
                           <span className={`h-2.5 w-2.5 rounded-full ${meter.isActive ? "bg-emerald-700 animate-pulse" : "bg-red-600"}`} />
                           {meter.isActive ? "Active" : "Inactive"}
                        </Badge>
                     </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                     <div className={`rounded-xl bg-primary/3 py-6 px-4 text-center border shadow-inner ${meter.currentBalance <= meter.minimumRechargeThreshold ? "border-red-500 animate-caret-blink" : "border-primary/10"}`}>
                        <p className="text-sm font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">Current Balance</p>
                        <div className="text-4xl font-extrabold text-primary tracking-tight">
                           <span className={`${meter.currentBalance <= meter.minimumRechargeThreshold ? "text-red-500" : "text-white"}`}>{meter.currentBalance}</span> <span className="text-lg font-bold text-primary/60">TK</span>
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

                     <CardButtons meterCurrentBalance={meter.currentBalance} onBalanceUpdate={onBalanceUpdate} mongoId={meter.id} onDeleteMeter={onDeleteMeter} isActive={meter.isActive} />
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
   );
};

export default MeterCardsWrapper;