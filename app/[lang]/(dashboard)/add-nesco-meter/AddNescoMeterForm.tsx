"use client";
import { Button } from "@/components/ui/button"
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card"
import {
   Field,
   FieldGroup,
   FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Dictionary } from "@/types/dictionary";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";


const AddNescoMeterForm = ({ dictionary, lang }: { dictionary: Dictionary; lang: "en" | "bn" }) => {
   const [error, setError] = useState<string | null>(null);
   const [isPending, startTransition] = useTransition();

   const router = useRouter();

   const handleScrapping = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const meterName = formData.get("meter-name") as string
      const consumerNumber = formData.get("consumer-number") as string
      startTransition(async () => {
         try {
            const response = await fetch('/api/add-update-nesco-meter', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ consumerNumber, meterName, existingCustomer: false }),
            });
            const result = await response.json();
            if (result.success) {
               toast.success("Meter added successfully", { position: "top-right" })
               setTimeout(() => {
                  router.push(`/${lang}`);
               }, 1000);
            } else {
               setError(result.message);
            }
         } catch (error) {
            console.log("error", error);
            setError("Failed to add meter");
         }
      })
   }
   return (
      <Card>
         <CardHeader className="text-center">
            <CardTitle className="text-2xl">Add New Meter</CardTitle>
         </CardHeader>
         <CardContent>
            {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
            <form onSubmit={handleScrapping}>
               <FieldGroup>
                  <Field>
                     <FieldLabel htmlFor="meter-name">{dictionary.meterName}</FieldLabel>
                     <Input
                        id="meter-name"
                        name="meter-name"
                        type="text"
                        required
                     />
                  </Field>
                  <Field>
                     <FieldLabel htmlFor="consumer-number">Consumer ID</FieldLabel>
                     <Input
                        id="consumer-number"
                        name="consumer-number"
                        type="number"
                        required
                     />
                  </Field>

                  <FieldGroup>
                     <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Meter
                     </Button>
                  </FieldGroup>
               </FieldGroup>
            </form>
         </CardContent>
      </Card>
   );
};

export default AddNescoMeterForm;
