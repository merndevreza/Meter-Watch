"use client";
import React, { useState } from 'react';
import {
   Field,
   FieldGroup,
   FieldLabel,
} from "@/components/ui/field";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThresholdUpdaterModalProps } from '@/types';
import { toast } from 'sonner';

const ThresholdUpdaterModal = ({ dictionary, currentThreshold, consumerNumber, onThresholdUpdate, setShowModal }: ThresholdUpdaterModalProps) => {
   const [threshold, setThreshold] = useState<number>(Number(currentThreshold));

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const amount = formData.get("amount");
      try {
         const response = await fetch('/api/threshold-update', {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               consumerNumber,
               newThreshold: Number(amount),
            }),
         });

         const data = await response.json();
         if (data.success) {
            toast.success(data.message);
            onThresholdUpdate(consumerNumber, Number(amount));
            setShowModal(false);
            setThreshold(Number(amount));
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         console.log('Error updating threshold:', error);
      }
   };
   return (
      <div className='w-full'>
         <div className='bg-muted p-3 rounded-lg my-4'>
            <h3 className='text-center'>Current Threshold: {threshold} {dictionary.tk}</h3>
         </div>
         <form onSubmit={handleSubmit}>
            <FieldGroup>
               <Field>
                  <FieldLabel htmlFor="amount">Set Threshold</FieldLabel>
                  <Input
                     id="amount"
                     type="number"
                     name="amount"
                     min={0}
                     required
                  />
               </Field>

               <FieldGroup>
                  <Button type="submit">
                     Update
                  </Button>
               </FieldGroup>
            </FieldGroup>
         </form>
      </div>
   );
};

export default ThresholdUpdaterModal;
