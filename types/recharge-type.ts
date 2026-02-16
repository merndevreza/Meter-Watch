export interface RechargeHistoryType {
   id: string;
   // Reference to customer
   consumerNumber: string;
   userId: string;

   // Recharge Details
   serialNo: string;
   token: string;

   // Charges (keeping as strings to preserve original format)
   meterRent: string;
   demandCharge: string;
   pfcCharge: string;
   vat: string;
   paidDebtFine: string;
   rebate: string;

   // Amounts
   electricityAmount: string;
   rechargeAmount: string;
   estimatedEnergyKwh: string;

   // Transaction Info
   rechargeMethod: string;
   rechargeDate: string;
   remoteRechargeStatus: string;

   // Metadata
   scrapedAt: Date;
   createdAt: Date;
   updatedAt: Date;
}
