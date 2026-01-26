"use client";
import { Button } from "@/components/ui/button"
import {
   Card,
   CardContent,
   CardDescription,
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
import { Dictionary } from "@/types/dictionary";
import { AddMeterFormProps, EditMeterFormProps, MeterDataType } from "@/types/meter-type";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";


const AddEditMeterForm = ({dictionary, meterData, mongoId }: {dictionary:Dictionary; meterData?: MeterDataType; mongoId?: string | undefined }) => {
   const [error, setError] = useState<string | null>(null);
   const [isActive, setIsActive] = useState<boolean>(meterData?.isActive ?? false);
   const [meterType, setMeterType] = useState<string>(meterData?.meterType ?? "single-phase");
   const [isPending, startTransition] = useTransition();

   const router = useRouter();

   const handleAddEditMeter = async (type: "add" | "edit", data: EditMeterFormProps | AddMeterFormProps) => {
      const method = type === "add" ? "POST" : "PUT"
      startTransition(async () => {
         try {
            const response = await fetch("/api/meter", {
               method,
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(data),
            });
            const result = await response.json();

            if (result.success) {
               toast.success(`${type === "add" ? "Meter added successfully" : "Meter updated successfully"}`, { position: "top-right" })
               setTimeout(() => {
                  router.push("/");
               }, 1000);
            } else {
               setError(result.message);
            }
         } catch (error) {
            setError(type === "add" ? "Failed to add meter" : "Failed to update meter");
         }
      })
   }

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      const addData = {
         meterName: formData.get("meter-name") as string,
         meterNumber: formData.get("meter-number") as string,
         sanctionLoad: formData.get("sanction-load") as string,
         sanctionTariff: formData.get("sanction-tariff") as string,
         meterType: meterType,
         minimumRechargeThreshold: formData.get("minimum-recharge-threshold") as string,
         meterInstallationDate: formData.get("meter-installation-date") as string,
      };

      if (mongoId) {
         const editData = {
            ...addData,
            isActive,
            mongoId
         }
         await handleAddEditMeter("edit", editData);
      } else {
         await handleAddEditMeter("add", addData);
      }
   }

   return (
      <Card>
         <CardHeader className="text-center">
            <CardTitle className="text-2xl">{mongoId ? "Edit Meter" : "Add New Meter"}</CardTitle>
         </CardHeader>
         <CardContent>
            {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

            <form onSubmit={handleSubmit}>
               <FieldGroup>
                  <Field>
                     <FieldLabel htmlFor="meter-name">{dictionary.meterName}</FieldLabel>
                     <Input
                        id="meter-name"
                        name="meter-name"
                        defaultValue={meterData?.meterName}
                        required
                     />
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="meter-number">{dictionary.meterNo}</FieldLabel>
                     <Input
                        id="meter-number"
                        type="number"
                        name="meter-number"
                        defaultValue={meterData?.meterNumber}
                        required
                     />
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="sanction-load">{dictionary.sanctionLoad} (K.W)</FieldLabel>
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
                     <FieldLabel htmlFor="sanction-tariff">{dictionary.tariffType}</FieldLabel>
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
                     <FieldLabel htmlFor="meter-type">{dictionary.meterType}</FieldLabel>
                     <Select
                        name="meter-type"
                        value={meterType}
                        onValueChange={setMeterType}
                     >
                        <SelectTrigger className="w-40">
                           <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="single-phase">{dictionary.singlePhase}</SelectItem>
                           <SelectItem value="two-phase">{dictionary.twoPhase}</SelectItem>
                           <SelectItem value="three-phase">{dictionary.threePhase}</SelectItem>
                        </SelectContent>
                     </Select>
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="minimum-recharge-threshold">{dictionary.setMin}</FieldLabel>
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
                     <FieldLabel htmlFor="meter-installation-date">{dictionary.meterInstallDate}</FieldLabel>
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
                     <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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