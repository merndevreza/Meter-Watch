import React from 'react';
import CustomerInfo from './_components/CustomerInfo';
import { MonthlyConsumptionTable } from './_components/MonthlyConsumptionTable';
import { RechargeHistoryTable } from './_components/RechargeHistoryTable';
import { getNescoMeterByID } from '@/app/actions/getNescoMeterByID';

export default async function Page({ params }: {
   params: Promise<{ lang: "en" | "bn", consumerId: string }>
}) {
   const { lang, consumerId } = await params;
   const nescoMeterResponse = await getNescoMeterByID(consumerId);
   if (!nescoMeterResponse.success) {
      return (
         <div className='flex items-center justify-center h-[60vh]'>
            <p className='text-red-500 text-lg'>{nescoMeterResponse.error || "Failed to fetch meter data"}</p>
         </div>
      );
   }
   return (
      <div className='space-y-8'>
         {nescoMeterResponse.data?.customer && <CustomerInfo monthlyConsumption={nescoMeterResponse.data?.monthlyConsumption || []} customer={nescoMeterResponse.data.customer} />}
         {nescoMeterResponse.data && <MonthlyConsumptionTable data={nescoMeterResponse.data.monthlyConsumption} />}
         {nescoMeterResponse.data && <RechargeHistoryTable data={nescoMeterResponse.data.rechargeHistory} />}
      </div>
   );
};
