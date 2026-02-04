export interface CustomerData {
  customerName: string;
  fatherHusbandName: string;
  address: string;
  mobile: string;
  electricityOffice: string;
  feederName: string;
  consumerNumber: string;
  meterNumber: string;
  sanctionedLoadKw: string;
  tariff: string;
  meterType: string;
  meterStatus: string;
  meterInstallationDate: string;
  minimumRechargeAmount: number;
  remainingBalance: number;
}

export interface RechargeRecord {
  serialNo: string;
  token: string;
  meterRent: string;
  demandCharge: string;
  pfcCharge: string;
  vat: string;
  paidDebtFine: string;
  rebate: string;
  electricityAmount: string;
  rechargeAmount: string;
  estimatedEnergyKwh: string;
  rechargeMethod: string;
  rechargeDate: string;
  remoteRechargeStatus: string;
}

export interface MonthlyConsumption {
  year: string;
  month: string;
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
}

export interface ScrapedData {
  customer: CustomerData; 
  rechargeHistory: RechargeRecord[];
  monthlyConsumption?: MonthlyConsumption[];
}