import { Dictionary } from "./dictionary";

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
export type NescoMeterDataType = {
   id: string;
   meterName: string;
   consumerNumber: string;
   customerName: string;
   mobile: string;
   meterNumber: string;
   meterStatus: string;
   meterType: string;
   sanctionedLoadKw: string;
   tariff: string;
   meterInstallationDate: string;
   minimumRechargeAmount: string;
   remainingBalance: string;
   updatedAt: string;
   hasNotice: boolean;
   noticeMessage: string | null;
   noticeLastChecked?: Date;
}
export type MeterCardButtonsProps = {
   dictionary: Dictionary;
   onDeleteMeter: (consumerNumber: string) => void;
   onThresholdUpdate: (consumerNumber: string, newThreshold: number) => void; 
   consumerNumber: string; 
   currentThreshold:string;
   meterName: string;
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