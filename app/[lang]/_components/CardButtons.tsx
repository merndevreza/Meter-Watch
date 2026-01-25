"use client";
import { Button } from '@/components/ui/button';
import { MeterCardButtonsProps } from '@/types/meter-type';
import { BanknoteArrowDown, BanknoteArrowUp, SquarePen, Trash } from 'lucide-react';
import Link from 'next/link';

const CardButtons = ({ meterCurrentBalance, mongoId, onDeleteMeter, isActive }: MeterCardButtonsProps) => {
   const handleDeleteMeter = async () => {
      try {
         // Implement delete meter functionality here
         const response = await fetch('/api/meter', {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mongoId: mongoId }),
         });
         console.log(response);
         if (response.status === 200) {
            onDeleteMeter(mongoId);
         }
         console.log(`Deleting meter with ID: ${mongoId}`);
      } catch (error) {
         console.log("delete error", error);

      }
   }


   return (
      <div className="flex flex-wrap gap-3 pt-1">
         <Button disabled={!isActive} className={`flex-1 h-11 gap-2 text-sm font-bold shadow-md active:scale-95 transition-transform`}>
            <BanknoteArrowUp className="h-5 w-5" />
            Recharge
         </Button>
         <Button disabled={meterCurrentBalance <= 0} variant="secondary" className="flex-1 h-11 gap-2 text-sm font-bold active:scale-95 transition-transform">
            <BanknoteArrowDown className="h-5 w-5" />
            Usage
         </Button>
         <div className="flex gap-2 w-full sm:w-auto">
            <Link href={`/dashboard/add-edit-meter?id=${mongoId}`}>
               <Button variant="outline" size="icon" className="h-11 w-11 flex-1 sm:flex-none border-muted-foreground/20 hover:bg-accent">
                  <SquarePen className="h-5 w-5" />
               </Button>
            </Link>
            <Button onClick={handleDeleteMeter} variant="outline" size="icon" className="h-11 w-11 flex-1 sm:flex-none text-destructive border-destructive/20 hover:bg-destructive/5">
               <Trash className="h-5 w-5" />
            </Button>
         </div>
      </div>
   );
};

export default CardButtons;