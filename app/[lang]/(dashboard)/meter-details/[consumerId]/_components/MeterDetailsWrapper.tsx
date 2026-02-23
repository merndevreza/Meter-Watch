"use client";
import React from 'react';
import CustomerInfo from './CustomerInfo';
import { MonthlyConsumptionTable } from './MonthlyConsumptionTable';
import { RechargeHistoryTable } from './RechargeHistoryTable';
import { ScrapedMonthlyConsumption, ScrapedRechargeRecord, NescoMeterDataType } from '@/types';

const MeterDetailsWrapper = ({ monthlyConsumption, rechargeHistory, customer }: { monthlyConsumption: ScrapedMonthlyConsumption[], rechargeHistory: ScrapedRechargeRecord[], customer: NescoMeterDataType }) => {
   const [customerData, setCustomerData] = React.useState<NescoMeterDataType>(customer);
   const [monthlyConsumptionData, setMonthlyConsumptionData] = React.useState<ScrapedMonthlyConsumption[]>(monthlyConsumption);
   const [rechargeHistoryData, setRechargeHistoryData] = React.useState<ScrapedRechargeRecord[]>(rechargeHistory);

   const chartData = monthlyConsumptionData?.map(item => ({
      month: `${item.month}/${item.year}`,
      usage: Number(item.totalUsageDeduction) || 0,
   })) || [];

   return (
      <div className="space-y-8">
         {customerData && <CustomerInfo chartData={chartData} customerData={customerData} setCustomerData={setCustomerData} setMonthlyConsumptionData={setMonthlyConsumptionData} setRechargeHistoryData={setRechargeHistoryData}/>}
         {monthlyConsumptionData && <MonthlyConsumptionTable data={monthlyConsumptionData} />}
         {rechargeHistoryData && <RechargeHistoryTable data={rechargeHistoryData} />}
      </div>
   );
};

export default MeterDetailsWrapper;