/**
 * CENTRALIZED TYPE DEFINITIONS
 * Single source of truth for all types in the application
 */

// ============================================================================
// BASE TYPES - Reusable type compositions
// ============================================================================

/**
 * Common metadata for database entities
 */
type EntityMetadata = {
  _id?: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Common references to user and meter
 */
type EntityReferences = {
  userId: string;
  consumerNumber: string;
};

/**
 * Financial charges data (as strings to preserve original format from NESCO)
 */
type FinancialCharges = {
  meterRent: string;
  demandCharge: string;
  pfcCharge: string;
  vat: string;
  rebate: string;
};

/**
 * Period information (year and month)
 */
type PeriodInfo = {
  year: string;
  month: string;
};

/**
 * Scraped data metadata
 */
type ScrapedMetadata = {
  scrapedAt: Date;
};

// ============================================================================
// DOMAIN MODELS - Core data structures
// ============================================================================

/**
 * CoreCustomerInfo - Common customer/meter information
 * Shared between ScrapedCustomerData and Customer
 */
type CoreCustomerInfo = {
  // Basic Information
  customerName: string;
  fatherHusbandName: string;
  address: string;
  mobile: string;

  // Electricity Office Details
  electricityOffice: string;
  feederName: string;
  consumerNumber: string;

  // Meter Information
  meterNumber: string;
  sanctionedLoadKw: string;
  tariff: string;
  meterType: string;
  meterStatus: string;
  meterInstallationDate: string;

  // Balance Information
  minimumRechargeAmount: number;
  remainingBalance: number;
};

/**
 * Customer - Core customer/meter information
 * Used by: Database, API, Frontend
 */
export interface Customer extends EntityMetadata, CoreCustomerInfo {
  userId: string;

  // Meter Information
  meterName: string;

  // Notice Information
  hasNotice: boolean;
  noticeMessage: string | null;
  noticeLastChecked: Date;

  // Timestamps
  lastScraped: Date;
}

/**
 * RechargeHistory - Individual recharge transaction record
 * Used by: Database, API, Frontend
 */
export interface RechargeHistory extends EntityMetadata, EntityReferences, FinancialCharges, ScrapedMetadata {
  // Recharge Details
  serialNo: string;
  token: string;

  // Additional charges
  paidDebtFine: string;

  // Amounts
  electricityAmount: string;
  rechargeAmount: string;
  estimatedEnergyKwh: string;

  // Transaction Info
  rechargeMethod: string;
  rechargeDate: string;
  remoteRechargeStatus: string;
}

/**
 * MonthlyConsumption - Monthly consumption and charges record
 * Used by: Database, API, Frontend
 */
export interface MonthlyConsumption extends EntityMetadata, EntityReferences, PeriodInfo, FinancialCharges, ScrapedMetadata {
  // Financial data (as strings to preserve original format from NESCO)
  totalRecharge: string;
  energyUsage: string;
  paidDebt: string;
  totalUsageDeduction: string;
  monthEndMeterBalance: string;
  energyUsageKwh: string;
}

// ============================================================================
// SCRAPER TYPES - Data from NESCO portal scraping
// ============================================================================

/**
 * Raw customer data as scraped from NESCO portal
 */
export type ScrapedCustomerData = CoreCustomerInfo;

/**
 * Raw recharge record as scraped from NESCO portal
 * Includes all financial data from recharge without database metadata
 */
export interface ScrapedRechargeRecord extends FinancialCharges {
  serialNo: string;
  token: string;
  paidDebtFine: string;
  electricityAmount: string;
  rechargeAmount: string;
  estimatedEnergyKwh: string;
  rechargeMethod: string;
  rechargeDate: string;
  remoteRechargeStatus: string;
}

/**
 * Raw monthly consumption data as scraped from NESCO portal
 * Includes all financial and period data without database metadata
 */
export interface ScrapedMonthlyConsumption extends PeriodInfo, FinancialCharges {
  totalRecharge: string;
  energyUsage: string;
  paidDebt: string;
  totalUsageDeduction: string;
  monthEndMeterBalance: string;
  energyUsageKwh: string;
}

/**
 * Arrear notice information
 */
export interface ArrearNotice {
  hasNotice: boolean;
  noticeMessage: string | null;
}

/**
 * Complete scraped data from NESCO portal
 */
export interface ScrapedData {
  customer: ScrapedCustomerData;
  rechargeHistory: ScrapedRechargeRecord[];
  monthlyConsumption: ScrapedMonthlyConsumption[];
  notice: ArrearNotice;
}

/**
 * Result of saving scraped data to database
 */
export interface SavedDataSummary {
  customer: boolean;
  newRecharges: number;
  duplicateRecharges: number;
  newConsumption: number;
  updatedConsumption: number;
  errors?: string[];
}

// ============================================================================
// USER TYPES
// ============================================================================

export type User = {
  id: string;
  email: string;
  emailVerified: Date | null;
  name?: string;
  image?: string;
};

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Meter card data for frontend display
 */
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
};

/**
 * Meter card buttons component props
 */
export type MeterCardButtonsProps = {
  dictionary: any;
  onDeleteMeter: (consumerNumber: string) => void;
  onThresholdUpdate: (consumerNumber: string, newThreshold: number) => void;
  onRefreshMeter: (meter: NescoMeterDataType) => void;
  consumerNumber: string;
  currentThreshold: string;
  meterName: string;
};

/**
 * Add meter form props
 */
export type AddMeterFormProps = {
  meterName: string;
  meterNumber: string;
  sanctionLoad: string;
  sanctionTariff: string;
  meterType: string;
  minimumRechargeThreshold: string;
  meterInstallationDate: string;
};

/**
 * Edit meter form props
 */
export type EditMeterFormProps = AddMeterFormProps & {
  mongoId: string;
  isActive: boolean;
};

/**
 * Delete confirmation modal props
 */
export interface DeleteConfirmationModalProps {
  title: string;
  description: string;
  onClose: () => void;
  onDelete: () => void | Promise<void>;
}

/**
 * Threshold updater modal props
 */
export interface ThresholdUpdaterModalProps {
  dictionary: any;
  currentThreshold: number | string;
  consumerNumber: string;
  onThresholdUpdate: (consumerNumber: string, newThreshold: number) => void;
  setShowModal: (show: boolean) => void;
}

// ============================================================================
// EXPORT ALIASES FOR BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Aliases for types used in different parts of the app
 * These allow gradual migration to centralized types
 */
export type RechargeHistoryType = RechargeHistory;
export type MonthlyConsumptionType = MonthlyConsumption;

// Scraper type aliases (deprecated, use Scraped* prefix)
export type CustomerData = ScrapedCustomerData;
export type RechargeRecord = ScrapedRechargeRecord;
export type MonthlyConsumptionRecord = ScrapedMonthlyConsumption;
