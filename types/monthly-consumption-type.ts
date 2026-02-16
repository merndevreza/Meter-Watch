/**
 * Monthly Consumption Interface
 */
export interface MonthlyConsumptionType {
   id: string;
   // Period
   year: string;
   month: string;

   // Financial data (keeping as strings to preserve original format from NESCO)
   // Can be parsed to numbers in application layer if needed for calculations
   totalRecharge: string;
   rebate: string;
   energyUsage: string;
   meterRent: string;
   demandCharge: string;
   pfcCharge: string;
   paidDebt: string;
   vat: string;
   totalUsageDeduction: string;
   monthEndMeterBalance: string;
   energyUsageKwh: string;

   // References
   consumerNumber: string;
   userId: string;

   // Metadata
   scrapedAt: Date;
   createdAt: Date;
   updatedAt: Date;
}
