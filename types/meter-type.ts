import { Dictionary } from "./dictionary";
 
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
   feederName: string;
   electricityOffice: string;
}
export type MeterCardButtonsProps = {
   dictionary: Dictionary;
   onDeleteMeter: (consumerNumber: string) => void;
   onThresholdUpdate: (consumerNumber: string, newThreshold: number) => void;
   onRefreshMeter: (meter: NescoMeterDataType) => void;
   consumerNumber: string; 
   currentThreshold:string;
   meterName: string;
}
