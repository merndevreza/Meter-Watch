import { useTransition } from 'react';
import { Button } from '../ui/button';
import { RefreshCcw } from 'lucide-react';
import { NescoMeterDataType } from '@/types';
import { toast } from 'sonner'; 

const RefreshButton = ({ consumerNumber, meterName, onRefreshMeter, isShowLabel = false, className }: { consumerNumber: string, meterName: string, onRefreshMeter: (updatedMeter: NescoMeterDataType) => void, isShowLabel?: boolean, className?: string }) => {
   const [isPending, startTransition] = useTransition();

   const handleRefresh = async () => {
      startTransition(async () => {
         try {
            const response = await fetch('/api/add-update-nesco-meter', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ consumerNumber, meterName, existingCustomer: true }),
            });
            const result = await response.json();
            console.log("Refresh result:", result);

            if (result.success) {
               const updatedCustomer = result.data.customer;
               const updatedNotice = result.data.notice;
               const updatedRechargeHistory = result.data.rechargeHistory;
               const updatedMonthlyConsumption = result.data.monthlyConsumption;

               const updatedMeter = {
                  consumerNumber: updatedCustomer.consumerNumber,
                  customerName: updatedCustomer.customerName,
                  meterName: meterName,
                  mobile: updatedCustomer.mobile,
                  meterNumber: updatedCustomer.meterNumber,
                  meterStatus: updatedCustomer.meterStatus,
                  meterType: updatedCustomer.meterType,
                  sanctionedLoadKw: updatedCustomer.sanctionedLoadKw,
                  tariff: updatedCustomer.tariff,
                  meterInstallationDate: updatedCustomer.meterInstallationDate,
                  minimumRechargeAmount: String(updatedCustomer.minimumRechargeAmount),
                  remainingBalance: String(updatedCustomer.remainingBalance),
                  updatedAt: new Date().toISOString(),
                  hasNotice: result.data.notice.hasNotice,
                  noticeMessage: result.data.notice.noticeMessage,
                  feederName: updatedCustomer.feederName,
                  electricityOffice: updatedCustomer.electricityOffice, 
               } as NescoMeterDataType;
               
               onRefreshMeter(updatedMeter);
               toast.success("Meter Updated successfully", { position: "top-right" })
            } else {
               toast.error(result.message || "Failed to update meter", { position: "top-right" })
            }
         } catch (error) {
            toast.error("Failed to update meter", { position: "top-right" })
            console.log("error", error);
         }
      })
   }
   return (
      <Button onClick={handleRefresh} variant="outline" size="sm" className={className}>
         <RefreshCcw className={`${isPending ? "animate-spin" : ""} h-5 w-5`} /> {isShowLabel && "Refresh"}
      </Button>
   );
};

export default RefreshButton;