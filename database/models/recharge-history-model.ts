import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Recharge History Interface - matches the scraped data structure
 */
export interface IRechargeHistory extends Document {
  // Reference to customer
  consumerNumber: string; // Links to Customer collection
  userId: string; // The user who owns this record
  
  // Recharge Details
  serialNo: string;
  token: string;
  
  // Charges
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
  
  // Timestamps
  scrapedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Recharge History Schema
 */
const RechargeHistorySchema: Schema = new Schema(
  {
    // Reference to customer
    consumerNumber: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    
    // Recharge Details
    serialNo: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
      index: true, // For quick token lookups
    },
    
    // Charges
    meterRent: {
      type: String,
      default: '',
    },
    demandCharge: {
      type: String,
      default: '',
    },
    pfcCharge: {
      type: String,
      default: '',
    },
    vat: {
      type: String,
      default: '',
    },
    paidDebtFine: {
      type: String,
      default: '',
    },
    rebate: {
      type: String,
      default: '',
    },
    
    // Amounts
    electricityAmount: {
      type: String,
      default: '',
    },
    rechargeAmount: {
      type: String,
      required: true,
    },
    estimatedEnergyKwh: {
      type: String,
      default: '',
    },
    
    // Transaction Info
    rechargeMethod: {
      type: String,
      required: true,
    },
    rechargeDate: {
      type: String,
      required: true,
    },
    remoteRechargeStatus: {
      type: String,
      default: '',
    },
    
    // Timestamps
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create compound indexes for efficient queries
RechargeHistorySchema.index({ userId: 1, consumerNumber: 1 });
RechargeHistorySchema.index({ userId: 1, rechargeDate: -1 }); // For sorting by date
RechargeHistorySchema.index({ consumerNumber: 1, token: 1 }, { unique: true }); // Prevent duplicate tokens for same customer

/**
 * Recharge History Model
 */
export const RechargeHistory: Model<IRechargeHistory> = 
  mongoose.models.RechargeHistory || mongoose.model<IRechargeHistory>('RechargeHistory', RechargeHistorySchema);