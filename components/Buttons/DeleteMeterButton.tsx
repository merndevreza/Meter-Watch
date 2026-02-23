import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Trash } from 'lucide-react';
import ModalPortal from '../modals/ModalPortal';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';
import { Dictionary } from '@/types/dictionary';
type DeleteMeterButtonProps = {
   consumerNumber: string;
   onDeleteMeter: (consumerNumber: string) => void;
   dictionary: Dictionary;
   className?: string;
   isShowLabel?: boolean;
}

const DeleteMeterButton = ({ consumerNumber, onDeleteMeter, dictionary, className, isShowLabel = false }: DeleteMeterButtonProps) => {
   const [showConfirmationModal, setShowConfirmationModal] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [isDeleted, setIsDeleted] = useState(false);

   const handleDeleteMeter = async () => {
      setIsDeleting(true);
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
            setIsDeleted(true);
            setTimeout(() => {
               setShowConfirmationModal(false);
               setIsDeleted(false);
            }, 1000);
         }
      } catch (error) {
         console.log("delete error", error);
      } finally {
         setIsDeleting(false);
      }
   }
   return (
      <>
         <Button onClick={() => setShowConfirmationModal(true)} variant="outline" size="sm" className={className}>
            <Trash className="h-5 w-5" /> {isShowLabel && "Delete Meter"}
         </Button>
         {
            showConfirmationModal && (
               <ModalPortal setShowModal={setShowConfirmationModal}>
                  <DeleteConfirmationModal onClose={() => setShowConfirmationModal(false)} onDelete={() => handleDeleteMeter()} title={dictionary.deleteModalTitle} description={dictionary.deleteModalDesc} isDeleting={isDeleting} isDeleted={isDeleted} />
               </ModalPortal>
            )
         }
      </>
   );
};

export default DeleteMeterButton;