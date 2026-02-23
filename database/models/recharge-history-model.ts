import mongoose, { Schema, Document, Model } from 'mongoose';
import { RechargeHistory as RechargeHistoryType } from '@/types';

/**
 * IRechargeHistory - Mongoose Document interface
 * Extends the base RechargeHistory type for Mongoose document methods
 * Omit _id from RechargeHistoryType to avoid conflict with Document's _id
 */
export interface IRechargeHistory extends Document, Omit<RechargeHistoryType, '_id'> {}

/**
 * Recharge History Schema
 */
const RechargeHistorySchema: Schema = new Schema(
  {
    consumerNumber: {
      type: String,
      required: [true, 'Consumer number is required'],
      index: true,
      trim: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    serialNo: {
      type: String,
      required: [true, 'Serial number is required'],
      trim: true,
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
      index: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          // Token should be non-empty
          return v.length > 0;
        },
        message: 'Token cannot be empty',
      },
    },
    meterRent: {
      type: String,
      default: '0',
      trim: true,
    },
    demandCharge: {
      type: String,
      default: '0',
      trim: true,
    },
    pfcCharge: {
      type: String,
      default: '0',
      trim: true,
    },
    vat: {
      type: String,
      default: '0',
      trim: true,
    },
    paidDebtFine: {
      type: String,
      default: '0',
      trim: true,
    },
    rebate: {
      type: String,
      default: '0',
      trim: true,
    },
    electricityAmount: {
      type: String,
      default: '0',
      trim: true,
    },
    rechargeAmount: {
      type: String,
      required: [true, 'Recharge amount is required'],
      trim: true,
    },
    estimatedEnergyKwh: {
      type: String,
      default: '0',
      trim: true,
    },
    rechargeMethod: {
      type: String,
      required: [true, 'Recharge method is required'],
      trim: true,
      enum: {
        values: ['Online', 'Offline', 'Mobile Banking', 'Counter', 'Other', ''],
        message: 'Invalid recharge method',
      },
    },
    rechargeDate: {
      type: String,
      required: [true, 'Recharge date is required'],
      trim: true,
    },
    remoteRechargeStatus: {
      type: String,
      default: '',
      trim: true,
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
RechargeHistorySchema.index({ userId: 1, consumerNumber: 1 });
RechargeHistorySchema.index({ userId: 1, rechargeDate: -1 });
RechargeHistorySchema.index(
  { consumerNumber: 1, token: 1 },
  { unique: true } // Prevent duplicate tokens for same consumer
);

// Helper method to convert strings to numbers
RechargeHistorySchema.methods.toNumeric = function() {
  const parseValue = (str: string): number => {
    const cleaned = str.replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  return {
    serialNo: this.serialNo,
    token: this.token,
    meterRent: parseValue(this.meterRent),
    demandCharge: parseValue(this.demandCharge),
    pfcCharge: parseValue(this.pfcCharge),
    vat: parseValue(this.vat),
    paidDebtFine: parseValue(this.paidDebtFine),
    rebate: parseValue(this.rebate),
    electricityAmount: parseValue(this.electricityAmount),
    rechargeAmount: parseValue(this.rechargeAmount),
    estimatedEnergyKwh: parseValue(this.estimatedEnergyKwh),
    rechargeMethod: this.rechargeMethod,
    rechargeDate: this.rechargeDate,
    remoteRechargeStatus: this.remoteRechargeStatus,
  };
};

// Static method to get recent recharges
RechargeHistorySchema.statics.getRecentRecharges = function(
  userId: string,
  consumerNumber: string,
  limit: number = 10
) {
  return this.find({ userId, consumerNumber })
    .sort({ rechargeDate: -1 })
    .limit(limit)
    .lean();
};

// Static method to get recharges by date range
RechargeHistorySchema.statics.getRechargesByDateRange = function(
  userId: string,
  consumerNumber: string,
  startDate: string,
  endDate: string
) {
  return this.find({
    userId,
    consumerNumber,
    rechargeDate: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ rechargeDate: -1 })
    .lean();
};

/**
 * Recharge History Model
 */
export const RechargeHistory: Model<IRechargeHistory> = 
  mongoose.models.RechargeHistory || 
  mongoose.model<IRechargeHistory>('RechargeHistory', RechargeHistorySchema);