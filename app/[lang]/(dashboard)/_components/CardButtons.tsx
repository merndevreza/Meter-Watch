"use client";
import ModalPortal from '@/components/modals/ModalPortal';
import { Button } from '@/components/ui/button';
import { MeterCardButtonsProps } from '@/types/meter-type';
import { BanknoteArrowDown, BanknoteArrowUp, SquarePen, Trash } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import BalanceUpdaterModal from './BalanceUpdaterModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';

const CardButtons = ({dictionary, meterCurrentBalance, mongoId, onDeleteMeter, onBalanceUpdate, isActive }: MeterCardButtonsProps) => {
   const [showRechargeModal, setShowRechargeModal] = useState(false);
   const [showBalanceUseModal, setShowBalanceUseModal] = useState(false);
   const [showConfirmationModal, setShowConfirmationModal] = useState(false);

   const handleDeleteMeter = async () => {
      try { 
         const response = await fetch('/api/meter', {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mongoId: mongoId }),
         });
         if (response.status === 200) {
            onDeleteMeter(mongoId); 
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
         <Button onClick={() => setShowRechargeModal(true)} disabled={!isActive} className={`flex-1 h-11 gap-2 text-sm font-bold shadow-md active:scale-95 transition-transform`}>
            <BanknoteArrowUp className="h-5 w-5" />
            {dictionary.recharge}
         </Button>
         <Button onClick={() => setShowBalanceUseModal(true)} disabled={meterCurrentBalance <= 0} variant="secondary" className="flex-1 h-11 gap-2 text-sm font-bold active:scale-95 transition-transform">
            <BanknoteArrowDown className="h-5 w-5" />
            {dictionary.usage}
         </Button>
         <div className="flex gap-2 w-full sm:w-auto">
            <Link href={`/add-edit-meter?id=${mongoId}`}>
               <Button variant="outline" size="icon" className="h-11 w-11 flex-1 sm:flex-none border-muted-foreground/20 hover:bg-accent">
                  <SquarePen className="h-5 w-5" />
               </Button>
            </Link>
            <Button onClick={()=>setShowConfirmationModal(true)} variant="outline" size="icon" className="h-11 w-11 flex-1 sm:flex-none text-destructive border-destructive/20 hover:bg-destructive/5">
               <Trash className="h-5 w-5" />
            </Button>
         </div>
         {
            (showRechargeModal || showBalanceUseModal) && (
               <ModalPortal setShowModal={showRechargeModal ? setShowRechargeModal : setShowBalanceUseModal}>
                  <BalanceUpdaterModal dictionary={dictionary} setShowModal={showRechargeModal ? setShowRechargeModal : setShowBalanceUseModal} onBalanceUpdate={onBalanceUpdate} mongoId={mongoId} currentBalance={meterCurrentBalance} modalType={showRechargeModal ? "recharge" : "balance-use"} />
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