"use client";
import ModalPortal from '@/components/modals/ModalPortal';
import { Button } from '@/components/ui/button';
import { MeterCardButtonsProps } from '@/types';
import { Trash } from 'lucide-react';
import Link from 'next/link';
import { useState} from 'react';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import ThresholdUpdaterModal from './ThresholdUpdaterModal';
import { useParams } from 'next/navigation'; 
import RefreshButton from '@/components/Buttons/RefreshButton';

const CardButtons = ({ dictionary, consumerNumber, onDeleteMeter, onThresholdUpdate, onRefreshMeter, currentThreshold, meterName }: MeterCardButtonsProps) => {
   const [showThresholdModal, setShowThresholdModal] = useState(false);
   const [showConfirmationModal, setShowConfirmationModal] = useState(false);
   const params = useParams();
   const lang = params.lang as string;
   
   const handleDeleteMeter = async () => {
      try {
         const response = await fetch('/api/delete-nesco-meter', {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ consumerNumber: consumerNumber }),
         });
         if (response.status === 200) {
            onDeleteMeter(consumerNumber);
            setTimeout(() => {
               setShowConfirmationModal(false);
            }, 1000);
         }
      } catch (error) {
         console.log("delete error", error);
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
            <Button onClick={() => setShowConfirmationModal(true)} variant="outline" size="icon" className="h-11 w-11 flex-1 sm:flex-none text-destructive border-destructive/20 hover:bg-destructive/5">
               <Trash className="h-5 w-5" />
            </Button>
         </div>
         {
            showThresholdModal && (
               <ModalPortal setShowModal={setShowThresholdModal}>
                  <ThresholdUpdaterModal dictionary={dictionary} setShowModal={setShowThresholdModal} onThresholdUpdate={onThresholdUpdate} consumerNumber={consumerNumber} currentThreshold={currentThreshold} />
               </ModalPortal>
            )
         }
         {
            showConfirmationModal && (
               <ModalPortal setShowModal={setShowConfirmationModal}>
                  <DeleteConfirmationModal onClose={() => setShowConfirmationModal(false)} onDelete={() => handleDeleteMeter()} title={dictionary.deleteModalTitle} description={dictionary.deleteModalDesc} />
               </ModalPortal>
            )
         }
      </div>
   );
};

export default CardButtons;