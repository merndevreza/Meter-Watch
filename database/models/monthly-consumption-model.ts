// database/models/monthly-consumption-model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IMonthlyConsumption extends Document {
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
  consumerNumber: string;
  userId: string;
  scrapedAt: Date;
}

const MonthlyConsumptionSchema = new Schema<IMonthlyConsumption>(
  {
    year: {
      type: String,
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      index: true,
    },
    totalRecharge: {
      type: String,
      required: true,
    },
    rebate: {
      type: String,
      required: true,
    },
    energyUsage: {
      type: String,
      required: true,
    },
    meterRent: {
      type: String,
      required: true,
    },
    demandCharge: {
      type: String,
      required: true,
    },
    pfcCharge: {
      type: String,
      required: true,
    },
    paidDebt: {
      type: String,
      required: true,
    },
    vat: {
      type: String,
      required: true,
    },
    totalUsageDeduction: {
      type: String,
      required: true,
    },
    monthEndMeterBalance: {
      type: String,
      required: true,
    },
    energyUsageKwh: {
      type: String,
      required: true,
    },
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
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries and uniqueness
MonthlyConsumptionSchema.index(
  { consumerNumber: 1, year: 1, month: 1 },
  { unique: true }
);

// Index for user-specific queries
MonthlyConsumptionSchema.index({ userId: 1, consumerNumber: 1 });

export const MonthlyConsumptionModel =
  mongoose.models.MonthlyConsumption ||
  mongoose.model<IMonthlyConsumption>('MonthlyConsumption', MonthlyConsumptionSchema);