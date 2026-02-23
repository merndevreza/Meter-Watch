import { useTransition } from 'react';
import { Button } from '../ui/button';
import { RefreshCcw } from 'lucide-react';
import { ScrapedData } from '@/types';
import { toast } from 'sonner'; 

const RefreshButton = ({ consumerNumber, meterName, onRefreshMeter, isShowLabel = false, className }: { consumerNumber: string, meterName: string, onRefreshMeter: (data: ScrapedData) => void, isShowLabel?: boolean, className?: string }) => {
   const [isPending, startTransition] = useTransition();

   const handleRefresh = async () => {
      startTransition(async () => {
         try {
            const response = await fetch('/api/add-update-nesco-meter', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ consumerNumber, meterName, existingCustomer: true }),
            });
            const result = await response.json(); 

            if (result.success && result.data) { 
               try {
                  onRefreshMeter(result.data);
                  toast.success("Meter Updated successfully", { position: "top-right" })
               } catch (callbackError) {
                  console.error("Error in onRefreshMeter callback:", callbackError);
                  toast.error("Failed to update meter data", { position: "top-right" })
               }
            } else {
               toast.error(result.message || "Failed to update meter", { position: "top-right" })
            }
         } catch (error) {
            toast.error("Failed to update meter", { position: "top-right" })
            console.error("error", error);
         }
      })
   }
   return (
      <Button onClick={handleRefresh} variant="outline" size="sm" className={className}>
         <RefreshCcw className={`${isPending ? "animate-spin" : ""} h-5 w-5`} /> {isShowLabel && "Refresh"}
      </Button>
   );
};

export default RefreshButton;