"use client";
import ModalPortal from '@/components/modals/ModalPortal';
import { Button } from '@/components/ui/button';
import { MeterCardButtonsProps, NescoMeterDataType, ScrapedData } from '@/types'; 
import Link from 'next/link';
import { useState} from 'react'; 
import ThresholdUpdaterModal from './ThresholdUpdaterModal';
import { useParams } from 'next/navigation'; 
import RefreshButton from '@/components/Buttons/RefreshButton';
import DeleteMeterButton from '@/components/Buttons/DeleteMeterButton';

const CardButtons = ({ dictionary, consumerNumber, onDeleteMeter, onThresholdUpdate,  currentThreshold, meterName, meterId, onRefreshUpdateMeters }: MeterCardButtonsProps) => {
   const [showThresholdModal, setShowThresholdModal] = useState(false);
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
         <Button variant="secondary" onClick={() => setShowThresholdModal(true)} className={`flex-1 h-11 gap-2 text-sm font-bold shadow-md active:scale-95 transition-transform`}>
            Update {dictionary.threshold}
         </Button>
         <div className="flex gap-2 w-full sm:w-auto">
            <RefreshButton consumerNumber={consumerNumber} meterName={meterName} onRefreshMeter={onRefreshMeter} isShowLabel={false}  className="h-11 w-11 flex-1 sm:flex-none border-muted-foreground/20 hover:bg-accent"/> 
         </div>
         <div className="flex gap-2 w-full sm:w-auto">
          <DeleteMeterButton consumerNumber={consumerNumber} onDeleteMeter={onDeleteMeter} dictionary={dictionary} className="h-11 w-11 flex-1 sm:flex-none text-destructive border-destructive/20 hover:bg-destructive/5" />
         </div>
         {
            showThresholdModal && (
               <ModalPortal setShowModal={setShowThresholdModal}>
                  <ThresholdUpdaterModal dictionary={dictionary} setShowModal={setShowThresholdModal} onThresholdUpdate={onThresholdUpdate} consumerNumber={consumerNumber} currentThreshold={currentThreshold} />
               </ModalPortal>
            )
         }
       
      </div>
   );
};

export default CardButtons;