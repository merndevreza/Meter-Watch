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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AddMeterFormProps, EditMeterFormProps, MeterDataType } from "@/types/meter-type";
import { useRouter } from "next/navigation";
import { useState } from "react";


const AddEditMeterForm = ({ meterData, mongoId }: { meterData?: MeterDataType; mongoId?: string | undefined }) => {
   const [error, setError] = useState<string | null>(null); 
   const [isActive, setIsActive] = useState<boolean>(meterData?.isActive ?? false);
   const [meterType, setMeterType] = useState<string>(meterData?.meterType ?? "single-phase");

   const router = useRouter();

   const handleAddMeter = async (data: AddMeterFormProps) => {
      try {
         const response = await fetch("/api/meter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
         });
         const result = await response.json();

         if (result.success) {
            router.push("/");
         } else {
            setError(result.message);
         }
      } catch (error) {
         setError("Failed to add meter");
      }
   }

   const handleEditMeter = async (data: EditMeterFormProps) => {
      try {
         const response = await fetch("/api/meter", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
         });
         const result = await response.json();

         if (result.success) {
            router.push("/"); 
         } else {
            setError(result.message);
         }
      } catch (error) {
         setError("Failed to update meter");
      }
   }

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      const addData = {
         meterName: formData.get("meter-name") as string,
         meterNumber: formData.get("meter-number") as string,
         sanctionLoad: formData.get("sanction-load") as string,
         sanctionTariff: formData.get("sanction-tariff") as string,
         meterType: meterType, // Using state for Select
         minimumRechargeThreshold: formData.get("minimum-recharge-threshold") as string,
         meterInstallationDate: formData.get("meter-installation-date") as string,
      };

      if (mongoId) {
         const editData = {
            ...addData,
            isActive,
            mongoId
         }
         await handleEditMeter(editData);
      } else {
         await handleAddMeter(addData);
      }
   }

   return (
      <Card>
         <CardHeader>
            <CardTitle>{mongoId ? "Edit Meter" : "Add Meter"}</CardTitle>
         </CardHeader>
         <CardContent>
            {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

            <form onSubmit={handleSubmit}>
               <FieldGroup>
                  <Field>
                     <FieldLabel htmlFor="meter-name">Meter Name</FieldLabel>
                     <Input
                        id="meter-name"
                        name="meter-name"
                        defaultValue={meterData?.meterName}
                        required
                     />
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="meter-number">Meter No.</FieldLabel>
                     <Input
                        id="meter-number"
                        type="number"
                        name="meter-number"
                        defaultValue={meterData?.meterNumber}
                        required
                     />
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="sanction-load">Sanction Load (K.W)</FieldLabel>
                     <Input
                        id="sanction-load"
                        type="number"
                        name="sanction-load"
                        defaultValue={meterData?.sanctionLoad}
                        min={0}
                        required
                     />
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="sanction-tariff">Sanction Tariff</FieldLabel>
                     <Input
                        id="sanction-tariff"
                        name="sanction-tariff"
                        defaultValue={meterData?.sanctionTariff}
                        required
                     />
                  </Field>

                  {mongoId && (
                     <Field>
                        <FieldLabel>Status</FieldLabel>
                        <div className="flex items-center space-x-2">
                           <Switch
                              id="meter-status"
                              checked={isActive}
                              onCheckedChange={setIsActive}
                           />
                           <Label htmlFor="meter-status">{isActive ? "Active" : "Inactive"}</Label>
                        </div>
                     </Field>
                  )}

                  <Field>
                     <FieldLabel htmlFor="meter-type">Meter Type</FieldLabel>
                     <Select
                        name="meter-type"
                        value={meterType}
                        onValueChange={setMeterType}
                     >
                        <SelectTrigger className="w-40">
                           <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="single-phase">Single Phase</SelectItem>
                           <SelectItem value="two-phase">Two Phase</SelectItem>
                           <SelectItem value="three-phase">Three Phase</SelectItem>
                        </SelectContent>
                     </Select>
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="minimum-recharge-threshold">Set Minimum Recharge Threshold (TK)</FieldLabel>
                     <Input
                        id="minimum-recharge-threshold"
                        type="number"
                        name="minimum-recharge-threshold"
                        defaultValue={meterData?.minimumRechargeThreshold}
                        min={0}
                        required
                     />
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="meter-installation-date">Meter Installation Date</FieldLabel>
                     <Input
                        id="meter-installation-date"
                        name="meter-installation-date"
                        type="date"
                        defaultValue={
                           meterData?.meterInstallationDate
                              ? meterData.meterInstallationDate.split('T')[0] // Extracts "2026-01-25"
                              : new Date().toISOString().split('T')[0]
                        }
                        required
                     />
                  </Field>

                  <FieldGroup>
                     <Button type="submit">
                        {mongoId ? "Update Meter" : "Add Meter"}
                     </Button>
                  </FieldGroup>
               </FieldGroup>
            </form>
         </CardContent>
      </Card>
   );
};

export default AddEditMeterForm;