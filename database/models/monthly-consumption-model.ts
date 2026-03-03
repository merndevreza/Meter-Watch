import mongoose, { Schema, Document, Model } from 'mongoose';
import { MonthlyConsumption as MonthlyConsumptionType } from '@/types';

/**
 * IMonthlyConsumption - Mongoose Document interface
 * Extends the base MonthlyConsumption type for Mongoose document methods
 * Omit _id from MonthlyConsumptionType to avoid conflict with Document's _id
 */
export interface IMonthlyConsumption extends Document, Omit<MonthlyConsumptionType, '_id'> {}

/**
 * Monthly Consumption Schema
 */
const MonthlyConsumptionSchema = new Schema<IMonthlyConsumption>(
  {
    year: {
      type: String,
      required: [true, 'Year is required'],
      index: true,
      validate: {
        validator: function(v: string) {
          return /^\d{4}$/.test(v);
        },
        message: 'Year must be a 4-digit number',
      },
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      index: true,
      validate: {
        validator: function(v: string) {
          // Accept month names or numbers
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          const monthNum = parseInt(v);
          return monthNames.includes(v) || (monthNum >= 1 && monthNum <= 12);
        },
        message: 'Invalid month format',
      },
    },
    totalRecharge: {
      type: String,
      required: [true, 'Total recharge is required'],
      trim: true,
    },
    rebate: {
      type: String,
      required: [true, 'Rebate is required'],
      trim: true,
    },
    energyUsage: {
      type: String,
      required: [true, 'Energy usage is required'],
      trim: true,
    },
    meterRent: {
      type: String,
      required: [true, 'Meter rent is required'],
      trim: true,
    },
    demandCharge: {
      type: String,
      required: [true, 'Demand charge is required'],
      trim: true,
    },
    pfcCharge: {
      type: String,
      required: [true, 'PFC charge is required'],
      trim: true,
    },
    paidDebt: {
      type: String,
      required: [true, 'Paid debt is required'],
      trim: true,
    },
    vat: {
      type: String,
      required: [true, 'VAT is required'],
      trim: true,
    },
    totalUsageDeduction: {
      type: String,
      required: [true, 'Total usage deduction is required'],
      trim: true,
    },
    monthEndMeterBalance: {
      type: String,
      required: [true, 'Month end meter balance is required'],
      trim: true,
    },
    energyUsageKwh: {
      type: String,
      required: [true, 'Energy usage (kWh) is required'],
      trim: true,
    },
    consumerNumber: {
      type: String,
      required: [true, 'Consumer number is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      index: true,
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
MonthlyConsumptionSchema.index(
  { consumerNumber: 1, year: 1, month: 1 },
  { unique: true }
);
MonthlyConsumptionSchema.index({ userId: 1, consumerNumber: 1 });
MonthlyConsumptionSchema.index({ userId: 1, year: -1, month: -1 });

// Helper methods
MonthlyConsumptionSchema.methods.toNumeric = function() {
  const parseValue = (str: string): number => {
    const cleaned = str.replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  return {
    year: parseInt(this.year),
    month: this.month,
    totalRecharge: parseValue(this.totalRecharge),
    rebate: parseValue(this.rebate),
    energyUsage: parseValue(this.energyUsage),
    meterRent: parseValue(this.meterRent),
    demandCharge: parseValue(this.demandCharge),
    pfcCharge: parseValue(this.pfcCharge),
    paidDebt: parseValue(this.paidDebt),
    vat: parseValue(this.vat),
    totalUsageDeduction: parseValue(this.totalUsageDeduction),
    monthEndMeterBalance: parseValue(this.monthEndMeterBalance),
    energyUsageKwh: parseValue(this.energyUsageKwh),
  };
};

/**
 * Monthly Consumption Model
 */
export const MonthlyConsumptionModel: Model<IMonthlyConsumption> =
  mongoose.models.MonthlyConsumption ||
  mongoose.model<IMonthlyConsumption>('MonthlyConsumption', MonthlyConsumptionSchema);