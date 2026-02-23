"use client";
import React from 'react';
import CustomerInfo from './CustomerInfo';
import { MonthlyConsumptionTable } from './MonthlyConsumptionTable';
import { RechargeHistoryTable } from './RechargeHistoryTable';

const MeterDetailsWrapper = ({ monthlyConsumption, rechargeHistory, customer }: { monthlyConsumption: any[], rechargeHistory: any[], customer: any }) => {
   const [customerState, setCustomer] = React.useState(customer);
   const [monthlyConsumptionState, setMonthlyConsumption] = React.useState(monthlyConsumption);
   const [rechargeHistoryState, setRechargeHistory] = React.useState(rechargeHistory);

   const chartData = monthlyConsumptionState?.map(item => ({
      month: `${item.month}/${item.year}`,
      usage: item.totalUsageDeduction,
   })) || [];

   return (
      <div className="space-y-8">
         {customerState && <CustomerInfo chartData={chartData} customer={customerState} />}
         {monthlyConsumptionState && <MonthlyConsumptionTable data={monthlyConsumptionState} />}
         {rechargeHistoryState && <RechargeHistoryTable data={rechargeHistoryState} />}
      </div>
   );
};

export default MeterDetailsWrapper;