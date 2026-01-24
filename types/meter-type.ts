export type MeterDataType = {
   id: string;
   meterName: string;
   meterNumber: number;
   sanctionLoad: number;
   sanctionTariff: string;
   meterType: string;
   meterStatus: string;
   minimumRechargeThreshold: number;
   currentBalance: number;
   meterInstallationDate: string;
   createdAt?: string;
   createdBy?: string;
   meterOwner?: string;
   updatedAt?: string;
}