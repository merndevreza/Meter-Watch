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
   FieldDescription,
   FieldGroup,
   FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";


const AddEditMeterForm = () => {
   const [error, setError] = useState<string | null>(null);
   const router = useRouter();

   // Handle form submission
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const meterNumber = formData.get("meter-number") as string;
      const sanctionLoad = formData.get("sanction-load") as string;
      const sanctionTariff = formData.get("sanction-tariff") as string;
      const meterType = formData.get("meter-type") as string;
      const meterInstallationDate = formData.get("meter-installation-date") as string;
      try {
         const response = await fetch("/api/meter", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               meterNumber,
               sanctionLoad,
               sanctionTariff,
               meterType,
               meterInstallationDate
            }),
         });
         const result = await response.json();
         console.log("result", result);

         if (result.success) {
            router.push("/dashboard/meters");
         } else {
            setError(result.message);
         }
      } catch (error) {
         setError("Failed to add meter");
      }

   }
   return (
      <Card>
         <CardHeader>
            <CardTitle>Add Meter</CardTitle>
         </CardHeader>
         <CardContent>
            {error && (
               <div className="mb-4 text-sm text-red-500">
                  {error}
               </div>
            )}
            <form onSubmit={handleSubmit}>
               <FieldGroup>
                  <Field>
                     <FieldLabel htmlFor="meter-number">Meter No.</FieldLabel>
                     <Input id="meter-number" type="number" name="meter-number" required />
                  </Field>
                  <Field>
                     <FieldLabel htmlFor="sanction-load">Sanction Load (K.W)</FieldLabel>
                     <Input id="sanction-load" type="number" name="sanction-load" required />
                  </Field>
                  <Field>
                     <FieldLabel htmlFor="sanction-tariff">Sanction Tariff</FieldLabel>
                     <Input id="sanction-tariff" type="text" name="sanction-tariff" required />
                  </Field>
                  <Field>
                     <FieldLabel htmlFor="meter-type">Meter Type</FieldLabel>
                     <Select name="meter-type">
                        <SelectTrigger
                           className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                           aria-label="Select a value"
                        >
                           <SelectValue placeholder="Single Phase" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                           <SelectItem value="single-phase" className="rounded-lg">
                              Single Phase
                           </SelectItem>
                           <SelectItem value="two-phase" className="rounded-lg">
                              Two Phase
                           </SelectItem>
                           <SelectItem value="three-phase" className="rounded-lg">
                              Three Phase
                           </SelectItem>
                        </SelectContent>
                     </Select>
                  </Field>
                  <Field>
                     <FieldLabel htmlFor="meter-installation-date">Meter Installation Date</FieldLabel>
                     <Input id="meter-installation-date" defaultValue={new Date().toISOString().split('T')[0]} type="date" name="meter-installation-date" required />
                  </Field>
                  <FieldGroup>
                     <Button type="submit">Add Meter</Button>
                  </FieldGroup>
               </FieldGroup>
            </form>
         </CardContent>
      </Card>
   );
};

export default AddEditMeterForm;