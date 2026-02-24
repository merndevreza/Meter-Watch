import { useState } from 'react';
import { Button } from '../ui/button';
import { Wallet } from 'lucide-react';
import ModalPortal from '../modals/ModalPortal';
import ThresholdUpdaterModal from '@/components/modals/ThresholdUpdaterModal';
import { Dictionary } from '@/types/dictionary';
type UpdateThresholdButtonProps = {
   className?: string;
   dictionary: Dictionary;
   onThresholdUpdate: (consumerNumber: string, newThreshold: number) => void;
   consumerNumber: string;
   currentThreshold: string;
   isShowIcon?: boolean;
   variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" | null | undefined;
}

const UpdateThresholdButton = ({ className, dictionary, onThresholdUpdate, consumerNumber, currentThreshold, isShowIcon = false, variant = "secondary" }: UpdateThresholdButtonProps) => {
   const [showThresholdModal, setShowThresholdModal] = useState(false);

   return (
      <>
         <Button variant={variant} onClick={() => setShowThresholdModal(true)} size="sm" className={className}>
            {isShowIcon && <Wallet className="h-5 w-5" />}
            Update Threshold
         </Button>
         {
            showThresholdModal && (
               <ModalPortal setShowModal={setShowThresholdModal}>
                  <ThresholdUpdaterModal dictionary={dictionary} setShowModal={setShowThresholdModal} onThresholdUpdate={onThresholdUpdate} consumerNumber={consumerNumber} currentThreshold={currentThreshold} />
               </ModalPortal>
            )
         }
      </>
   );
};

export default UpdateThresholdButton;