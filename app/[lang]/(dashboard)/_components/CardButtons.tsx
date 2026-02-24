"use client";
import { Button } from '@/components/ui/button';
import { NescoMeterDataType, ScrapedData } from '@/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import RefreshButton from '@/components/Buttons/RefreshButton';
import DeleteMeterButton from '@/components/Buttons/DeleteMeterButton';
import UpdateThresholdButton from '@/components/Buttons/UpdateThresholdButton';
import { Dictionary } from '@/types/dictionary';

type MeterCardButtonsProps = {
  dictionary: Dictionary;
  onDeleteMeter: (consumerNumber: string) => void;
  onThresholdUpdate: (consumerNumber: string, newThreshold: number) => void;
  onRefreshUpdateMeters: (meter: NescoMeterDataType) => void;
  consumerNumber: string;
  currentThreshold: string;
  meterName: string;
  meterId: string;
};
const CardButtons = ({ dictionary, consumerNumber, onDeleteMeter, onThresholdUpdate, currentThreshold, meterName, meterId, onRefreshUpdateMeters }: MeterCardButtonsProps) => {
   const params = useParams();
   const lang = params.lang as string;

   const onRefreshMeter = (responseData: ScrapedData) => {
      try {
         const { customer: updatedCustomer, notice } = responseData;

         // Validate required data
         if (!updatedCustomer) {
            throw new Error('Customer data is missing from response');
         }

         // Update customer data with type safety, preserving meterName from existing data
         const updatedCustomerState: NescoMeterDataType = {
            id: meterId,
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
            minimumRechargeAmount: currentThreshold,
            remainingBalance: String(updatedCustomer.remainingBalance),
            updatedAt: new Date().toISOString(),
            hasNotice: notice.hasNotice,
            noticeMessage: notice.noticeMessage ?? null,
            feederName: updatedCustomer.feederName,
            electricityOffice: updatedCustomer.electricityOffice,
         };
         onRefreshUpdateMeters(updatedCustomerState);
      } catch (error) {
         console.error('Error updating meter data:', error);
         throw error;
      }
   }
   return (
      <div className="flex flex-wrap gap-3 pt-1">
         <Link className='flex-1' href={`${lang}/meter-details/${consumerNumber}`}>
            <Button className={`w-full h-11 gap-2 text-sm font-bold shadow-md active:scale-95 transition-transform`}>
               Details
            </Button>
         </Link>
         <UpdateThresholdButton className="flex-1 h-11 gap-2 text-sm font-bold shadow-md active:scale-95 transition-transform" dictionary={dictionary} consumerNumber={consumerNumber} currentThreshold={currentThreshold} onThresholdUpdate={onThresholdUpdate} />
         <div className="flex gap-2 w-full sm:w-auto">
            <RefreshButton consumerNumber={consumerNumber} meterName={meterName} onRefreshMeter={onRefreshMeter} isShowLabel={false} className="h-11 w-11 flex-1 sm:flex-none border-muted-foreground/20 hover:bg-accent" />
         </div>
         <div className="flex gap-2 w-full sm:w-auto">
            <DeleteMeterButton consumerNumber={consumerNumber} onDeleteMeter={onDeleteMeter} dictionary={dictionary} className="h-11 w-11 flex-1 sm:flex-none text-destructive border-destructive/20 hover:bg-destructive/5" />
         </div>
      </div>
   );
};

export default CardButtons;