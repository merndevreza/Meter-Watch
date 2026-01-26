"use client";
import React, { useState } from 'react';
import {
   Field,
   FieldGroup,
   FieldLabel,
} from "@/components/ui/field";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BalanceUpdaterModalProps } from '@/types/modal';
import { toast } from 'sonner';

const BalanceUpdaterModal = ({ dictionary, currentBalance, mongoId, onBalanceUpdate, setShowModal, modalType }: BalanceUpdaterModalProps) => {
   const [balance, setBalance] = useState<number>(currentBalance);

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const amount = formData.get("amount");
      const newBalance = modalType === "recharge" ? balance + Number(amount) : balance - Number(amount)
      try {
         const response = await fetch('/api/meter/balance-updater', {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mongoId, newBalance }),
         });
         if (response.status === 200) {
            setBalance(newBalance);
            onBalanceUpdate(mongoId, newBalance);
            toast.success(`${modalType === "recharge" ? "Recharged successfully" : "Balance used successfully"}`, { position: "top-center" })
            setTimeout(() => {
               setShowModal(false);
            }, 1000);
         }
      } catch (error) {
         console.log("recharge error", error);
      }
   };
   return (
      <div className='w-full'>
         <div className='bg-muted p-3 rounded-lg my-4'>
            <h3 className='text-center'>{dictionary.currentBalance}: {balance} {dictionary.tk}</h3>
         </div>
         <form onSubmit={handleSubmit}>
            <FieldGroup>
               <Field>
                  <FieldLabel htmlFor="amount">{modalType === "recharge" ? "Recharge Balance" : "Use Balance"}</FieldLabel>
                  <Input
                     id="amount"
                     type="number"
                     name="amount"
                     min={0}
                     max={modalType === "balance-use" ? currentBalance : undefined}
                     required
                  />
               </Field>

               <FieldGroup>
                  <Button type="submit">
                     {modalType === "recharge" ? "Add money" : "Use Money"}
                  </Button>
               </FieldGroup>
            </FieldGroup>
         </form>
      </div>
   );
};

export default BalanceUpdaterModal;
