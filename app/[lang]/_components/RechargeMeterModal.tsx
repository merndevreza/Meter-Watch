"use client";
import React, { useState } from 'react';
import {
   Field,
   FieldGroup,
   FieldLabel,
} from "@/components/ui/field";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RechargeMeterModalProps } from '@/types/modal';

const RechargeMeterModal = ({ currentBalance, mongoId, onRechargeMeter, setShowRechargeModal }: RechargeMeterModalProps) => {
   const [balance, setBalance] = useState(currentBalance);

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const rechargeAmount = formData.get("recharge-amount");
      try {
         const response = await fetch('/api/meter/recharge', {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mongoId, currentBalance, rechargeAmount }),
         });
         if (response.status === 200) {
           setBalance(prev => prev + Number(rechargeAmount));
           onRechargeMeter(mongoId, balance + Number(rechargeAmount));
           setTimeout(() => {
            setShowRechargeModal(false);
           }, 1000);
         }
      } catch (error) {
         console.log("recharge error", error);
      }
   };
   return (
      <div className='w-full'>
         <div className='bg-muted p-3 rounded-lg my-4'>
            <h3 className='text-center'>Current Balance: {balance} TK</h3>
         </div>
         <form onSubmit={handleSubmit}>
            <FieldGroup>
               <Field>
                  <FieldLabel htmlFor="recharge-amount">Recharge Amount</FieldLabel>
                  <Input
                     id="recharge-amount"
                     type="number"
                     name="recharge-amount"
                     required
                  />
               </Field>

               <FieldGroup>
                  <Button type="submit">
                     Add Money
                  </Button>
               </FieldGroup>
            </FieldGroup>
         </form>
      </div>
   );
};

export default RechargeMeterModal;