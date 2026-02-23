"use client";
import {
   ArrowLeft,
   Zap,
   User,
   Trash,
   CalendarClock,
   Wallet
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChartAreaInteractive } from "./ChartAreaInteractive";
import { NescoMeterDataType } from "@/types/meter-type";
import RefreshButton from "@/components/Buttons/RefreshButton";
import { ScrapedData, ScrapedMonthlyConsumption, ScrapedRechargeRecord } from "@/types";


export default function CustomerInfo({ customerData, chartData, setCustomerData, setMonthlyConsumptionData, setRechargeHistoryData }: { customerData: NescoMeterDataType, chartData: { month: string, usage: number }[], setCustomerData: (customerData: NescoMeterDataType) => void, setMonthlyConsumptionData: (monthlyConsumptionData: ScrapedMonthlyConsumption[]) => void, setRechargeHistoryData: (rechargeHistoryData: ScrapedRechargeRecord[]) => void }) {
   const isLowBalance = Number(customerData.remainingBalance) <= Number(customerData.minimumRechargeAmount);

   const onRefreshMeter = (responseData: ScrapedData) => {
      try {
         const { customer: updatedCustomer, rechargeHistory: updatedRechargeHistory, monthlyConsumption: updatedMonthlyConsumption, notice } = responseData;

         // Validate required data
         if (!updatedCustomer) {
            throw new Error('Customer data is missing from response');
         }

         // Update customer data with type safety, preserving meterName from existing data
         const updatedCustomerState: NescoMeterDataType = {
            id: customerData.id,
            consumerNumber: updatedCustomer.consumerNumber,
            customerName: updatedCustomer.customerName,
            meterName: customerData.meterName,  
            mobile: updatedCustomer.mobile,
            meterNumber: updatedCustomer.meterNumber,
            meterStatus: updatedCustomer.meterStatus,
            meterType: updatedCustomer.meterType,
            sanctionedLoadKw: updatedCustomer.sanctionedLoadKw,
            tariff: updatedCustomer.tariff,
            meterInstallationDate: updatedCustomer.meterInstallationDate,
            minimumRechargeAmount: customerData.minimumRechargeAmount,
            remainingBalance: String(updatedCustomer.remainingBalance),
            updatedAt: new Date().toISOString(),
            hasNotice: notice.hasNotice,
            noticeMessage: notice.noticeMessage ?? null,
            feederName: updatedCustomer.feederName,
            electricityOffice: updatedCustomer.electricityOffice,
         };
         setCustomerData(updatedCustomerState);

         // Update monthly consumption data
         if (updatedMonthlyConsumption && Array.isArray(updatedMonthlyConsumption)) {
            setMonthlyConsumptionData(updatedMonthlyConsumption);
         }

         // Update recharge history data
         if (updatedRechargeHistory && Array.isArray(updatedRechargeHistory)) {
            setRechargeHistoryData(updatedRechargeHistory);
         }
      } catch (error) {
         console.error('Error updating meter data:', error);
         throw error;
      }
   }
   return (
      <div className=" w-full space-y-8">

         {/* 1. Top Navigation / Breadcrumb Area */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back to Dashboard
               </Link>
               <span className="text-muted-foreground/40">/</span>
               <span className="font-medium text-foreground">{customerData.meterName}</span>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-2">
               <RefreshButton consumerNumber={customerData.consumerNumber} meterName={customerData.meterName} onRefreshMeter={onRefreshMeter} isShowLabel={true} className="flex gap-2" />
               <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                  <Wallet className="h-4 w-4" /> Update Threshold
               </Button>
               <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                  <Trash className="h-4 w-4" /> Delete Meter
               </Button>
            </div>
         </div>

         {/* 2. Page Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
            <div>
               <h1 className="text-3xl font-bold tracking-tight text-foreground">{customerData.meterName}</h1>
               <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className="font-mono text-xs">Consumer ID: {customerData.consumerNumber}</Badge>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="overflow-hidden text-right">
                  <p className="text-sm font-medium truncate">{customerData.customerName}</p>
                  <p className="text-xs text-muted-foreground">{customerData.mobile}</p>
               </div>
               <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
               </div>
            </div>
         </div>
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Financial Overview Card */}
            <Card className="overflow-hidden p-0">
               <CardHeader className="bg-muted py-3">
                  <CardTitle className="leading-normal">Financial Overview</CardTitle>
               </CardHeader>
               <CardContent className="p-5 pb-0">
                  <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
                     <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Current Balance</p>
                        <div className="flex items-baseline gap-1 mb-2">
                           <span className={`text-4xl font-bold tracking-tight ${isLowBalance ? "text-red-600 animate-caret-blink" : "text-foreground"}`}>
                              {customerData.remainingBalance}
                           </span>
                           <span className="text-lg font-medium text-muted-foreground">Tk</span>
                        </div>
                        <div className="mt-2 text-muted-foreground bg-muted/50 inline-block px-2 py-1 rounded">
                           Threshold: <span className="font-semibold text-foreground pl-1">{customerData.minimumRechargeAmount} Tk</span>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                           <span className="text-sm text-muted-foreground">Meter Number</span>
                           <span className="font-semibold">{customerData.meterNumber}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                           <span className="text-sm text-muted-foreground">Meter Type</span>
                           <span className="font-semibold">{customerData.meterType}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                           <span className="text-sm text-muted-foreground">Sanctioned Load</span>
                           <span className="font-semibold flex items-center gap-1">
                              <Zap className="h-3 w-3 text-amber-500" /> {customerData.sanctionedLoadKw} KW
                           </span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                           <span className="text-sm text-muted-foreground">Tariff Category</span>
                           <span className="font-semibold">{customerData.tariff}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                           <span className="text-sm text-muted-foreground">Feeder Name</span>
                           <span className="font-semibold">{customerData.feederName}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                           <span className="text-sm text-muted-foreground">Electricity Office</span>
                           <span className="font-semibold">{customerData.electricityOffice}</span>
                        </div>
                     </div>
                  </div>
               </CardContent>
               <Separator />
               <div className="px-5 pb-5">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
                     <CalendarClock className="h-4 w-4" /> Last updated
                  </h4>
                  <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md border border-dashed">
                     {new Date(customerData.updatedAt).toLocaleString()}
                  </p>
               </div>
            </Card>
            <ChartAreaInteractive chartData={chartData} />
         </div>
      </div>
   );
}
