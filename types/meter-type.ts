export type MeterDataType = {
   id: string;
   meterName: string;
   meterNumber: number;
   sanctionLoad: number;
   sanctionTariff: string;
   meterType: string;
   isActive: boolean;
   minimumRechargeThreshold: number;
   currentBalance: number;
   meterInstallationDate: string;
   createdAt?: string;
   createdBy?: string;
   meterOwner?: string;
   updatedAt?: string;
}

export type MeterCardButtonsProps = {
   onDeleteMeter: (mongoId: string) => void;
   meterCurrentBalance: number;
   mongoId: string;
   isActive: boolean;
}

export type AddMeterFormProps = {
   meterName: string;
   meterNumber: string;
   sanctionLoad: string;
   sanctionTariff: string;
   meterType: string;
   minimumRechargeThreshold: string;
   meterInstallationDate: string;
}
export type EditMeterFormProps = AddMeterFormProps & {
   mongoId: string;
   isActive: boolean;
}