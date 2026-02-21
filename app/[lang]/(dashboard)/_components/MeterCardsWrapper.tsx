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
import {
   Popover,
   PopoverContent,
   PopoverDescription,
   PopoverHeader,
   PopoverTitle,
   PopoverTrigger,
} from "@/components/ui/popover"
import { Zap, Calendar, Activity, Gauge, Grid2x2Check, Bell } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { NescoMeterDataType } from '@/types/meter-type';
import CardButtons from './CardButtons';
import { useState } from "react";
import { Dictionary } from "@/types/dictionary";

const MeterCardsWrapper = ({ dictionary, metersData = [] }: { dictionary: Dictionary; metersData: NescoMeterDataType[] | [] }) => {
   const [allMeters, setAllMeters] = useState<NescoMeterDataType[]>(metersData);


   const onDeleteMeter = (consumerNumber: string) => {
      const updatedMeters = allMeters.filter(meter => meter.consumerNumber !== consumerNumber);
      setAllMeters(updatedMeters);
   }
   const onThresholdUpdate = (consumerNumber: string, newThreshold: number) => {
      const updatedMeters = allMeters.map(meter => {
         if (meter.consumerNumber === consumerNumber) {
            return { ...meter, minimumRechargeAmount: String(newThreshold) };
         }
         return meter;
      });
      setAllMeters(updatedMeters);
   }
   const onRefreshMeter = (updatedMeter: NescoMeterDataType) => {
      const updatedMeters = allMeters.map(meter => {
         if (meter.consumerNumber === updatedMeter.consumerNumber) {
            return { ...meter, ...updatedMeter, id: meter.id };
         }
         return meter;
      });
      setAllMeters(updatedMeters);
   }
   // onRefresh

   return (
      <div className="grid grid-cols-1 gap-6 xl:gap-8 xl:grid-cols-2 2xl:grid-cols-4">
         {allMeters?.length > 0 ? (
            allMeters.map((meter: NescoMeterDataType) => (
               <Card key={meter.id} className="overflow-hidden transition-all pb-0 hover:shadow-lg border-muted-foreground/20">
                  <CardHeader className="space-y-2">
                     <div className="flex items-start justify-between">
                        <div className="space-y-1">
                           <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                              {meter?.meterName}
                           </CardTitle>
                           <CardDescription className="font-mono text-sm font-medium text-muted-foreground/80">
                              Consumer ID: {meter.consumerNumber} <br />
                              Consumer Name: {meter.customerName}
                           </CardDescription>
                        </div>
                        <div>
                           <Badge
                              variant="default"
                              className={`px-3 py-1 text-sm font-medium flex items-center gap-2 shadow-inner border-secondary bg-secondary text-foreground`}>
                              Meter ID: {meter.meterNumber}
                           </Badge>
                           <div className="inline-block mt-2 float-right">
                              <Popover>
                                 <PopoverTrigger asChild >
                                    <button className="relative p-0 cursor-pointer">
                                       <Bell size={22} />
                                       {meter.hasNotice && (<span className="w-2 h-2 rounded-full bg-red-700 inline-block absolute top-0 right-0"></span>)}
                                    </button>
                                 </PopoverTrigger>
                                 <PopoverContent className="bg-accent" align="end" >
                                    {meter.hasNotice ? (
                                       <PopoverHeader>
                                          <PopoverTitle>Notice</PopoverTitle>
                                          <PopoverDescription className="text-accent-foreground leading-relaxed">{meter.noticeMessage}</PopoverDescription>
                                       </PopoverHeader>
                                    ) : (
                                       <PopoverHeader>
                                          <PopoverTitle>No Notice</PopoverTitle>
                                       </PopoverHeader>
                                    )}
                                 </PopoverContent>
                              </Popover>
                           </div>
                        </div>
                     </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                     <div className={`rounded-xl bg-primary/3 py-6 px-4 text-center border shadow-inner ${meter.remainingBalance <= meter.minimumRechargeAmount ? "border-red-500 animate-caret-blink" : "border-primary/10"}`}>
                        <p className="text-sm font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">{dictionary.currentBalance}</p>
                        <div className="text-4xl font-extrabold text-primary tracking-tight">
                           <span className={`${meter.remainingBalance <= meter.minimumRechargeAmount ? "text-red-500" : "text-foreground"}`}>{meter.remainingBalance}</span> <span className="text-lg font-bold text-primary/60">{dictionary.tk}</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-y-5 gap-x-2">
                        <div className="space-y-1.5">
                           <p className="text-xs uppercase text-muted-foreground font-extrabold tracking-tight">{dictionary.threshold}</p>
                           <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                              <Gauge className="h-4 w-4 text-red-500" />
                              {meter.minimumRechargeAmount} <span className="text-xs text-muted-foreground">{dictionary.tk}</span>
                           </div>
                        </div>
                        <div className="space-y-1.5 text-right sm:text-left">
                           <p className="text-xs uppercase text-muted-foreground font-extrabold tracking-tight">{dictionary.sanctionLoad}</p>
                           <div className="flex items-center gap-2 text-base font-semibold text-foreground justify-end sm:justify-start">
                              <Zap className="h-4 w-4 text-amber-500" />
                              {meter.sanctionedLoadKw} <span className="text-xs text-muted-foreground">KW</span>
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <p className="text-xs uppercase text-muted-foreground font-extrabold tracking-tight">{dictionary.tariffType}</p>
                           <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                              <Activity className="h-4 w-4 text-blue-500" />
                              {meter.tariff}
                           </div>
                        </div>
                        <div className="space-y-1.5 text-right sm:text-left">
                           <p className="text-xs uppercase text-muted-foreground font-extrabold tracking-tight">{dictionary.meterType}</p>
                           <div className="flex items-center gap-2 text-base font-semibold text-foreground justify-end sm:justify-start">
                              <Grid2x2Check className="h-4 w-4 text-blue-500" />
                              {meter.meterType}
                           </div>
                        </div>
                     </div>

                     <Separator className="opacity-60" />

                     <CardButtons dictionary={dictionary} consumerNumber={meter.consumerNumber} currentThreshold={meter.minimumRechargeAmount} onThresholdUpdate={onThresholdUpdate} onDeleteMeter={onDeleteMeter} onRefreshMeter={onRefreshMeter} meterName={meter.meterName} />
                  </CardContent>
                  <CardFooter className="bg-muted/40 pb-4 [.border-t]:pt-4 border-t">
                     <div className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground font-semibold">
                        <Calendar className="h-4 w-4 opacity-70" />
                        <span>Last Updated: {new Date(meter.updatedAt).toLocaleDateString()}</span>
                     </div>
                  </CardFooter>
               </Card>
            ))
         ) : (
            <div className="col-span-full py-24 text-center">
               <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <Zap className="h-6 w-6 text-muted-foreground" />
               </div>
               <p className="text-lg font-medium text-muted-foreground">{dictionary.noMeterFound}</p>
            </div>
         )}
      </div>
   );
};

export default MeterCardsWrapper;